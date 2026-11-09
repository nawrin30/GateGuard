import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { User } from "../models/User";
import { signAccessToken } from "../utils/jwt";

type Provider = "github" | "google";
const clientUrl = () => env.CLIENT_URL.split(",")[0].trim().replace(/\/$/, "");
function makeState(provider: Provider) {
  return jwt.sign({ provider, purpose: "oauth-state" }, env.JWT_SECRET, { expiresIn: "10m" });
}
function verifyState(state: string, provider: Provider) {
  const payload = jwt.verify(state, env.JWT_SECRET) as { provider?: string; purpose?: string };
  if (payload.provider !== provider || payload.purpose !== "oauth-state") throw new Error("Invalid OAuth state");
}
function fail(res: Response, message: string) {
  return res.redirect(`${clientUrl()}/auth/login?oauth_error=${encodeURIComponent(message)}`);
}

export async function startGithubLogin(_req: Request, res: Response) {
  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET || !env.GITHUB_LOGIN_CALLBACK_URL) {
    return res.status(503).json({ message: "GitHub Login is not configured on the server." });
  }
  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
  url.searchParams.set("redirect_uri", env.GITHUB_LOGIN_CALLBACK_URL);
  url.searchParams.set("scope", "read:user user:email");
  url.searchParams.set("state", makeState("github"));
  return res.redirect(url.toString());
}

export async function githubLoginCallback(req: Request, res: Response) {
  try {
    if (typeof req.query.code !== "string" || typeof req.query.state !== "string") throw new Error("GitHub authorization was cancelled.");
    verifyState(req.query.state, "github");
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST", headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: env.GITHUB_CLIENT_ID, client_secret: env.GITHUB_CLIENT_SECRET, code: req.query.code, redirect_uri: env.GITHUB_LOGIN_CALLBACK_URL })
    });
    const tokenData = await tokenResponse.json() as { access_token?: string; error_description?: string };
    if (!tokenResponse.ok || !tokenData.access_token) throw new Error(tokenData.error_description || "GitHub token exchange failed.");
    const headers = { Authorization: `Bearer ${tokenData.access_token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };
    const [profileResponse, emailsResponse] = await Promise.all([
      fetch("https://api.github.com/user", { headers }), fetch("https://api.github.com/user/emails", { headers })
    ]);
    if (!profileResponse.ok || !emailsResponse.ok) throw new Error("Could not read your GitHub profile/email.");
    const profile = await profileResponse.json() as { id: number; login: string; name?: string | null; email?: string | null };
    const emails = await emailsResponse.json() as Array<{ email: string; primary: boolean; verified: boolean }>;
    const email = (emails.find(e => e.primary && e.verified) || emails.find(e => e.verified))?.email || profile.email;
    if (!email) throw new Error("Your GitHub account has no verified email. Add and verify an email in GitHub, then try again.");
    let user = await User.findOne({ $or: [{ githubId: String(profile.id) }, { email: email.toLowerCase() }] });
    if (user) {
      if (user.githubId && user.githubId !== String(profile.id)) throw new Error("This email is already linked to another GitHub account.");
      user.githubId = String(profile.id); user.githubUsername = profile.login; await user.save();
    } else {
      user = await User.create({ name: profile.name?.trim() || profile.login, email: email.toLowerCase(), githubId: String(profile.id), githubUsername: profile.login });
    }
    const token = signAccessToken({ id: String(user._id), email: user.email, tokenVersion: user.tokenVersion });
    return res.redirect(`${clientUrl()}/auth/callback#token=${encodeURIComponent(token)}`);
  } catch (error) { return fail(res, error instanceof Error ? error.message : "GitHub Login failed."); }
}

export async function startGoogleLogin(_req: Request, res: Response) {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.GOOGLE_CALLBACK_URL) return res.status(503).json({ message: "Google Login is not configured on the server." });
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", env.GOOGLE_CLIENT_ID); url.searchParams.set("redirect_uri", env.GOOGLE_CALLBACK_URL);
  url.searchParams.set("response_type", "code"); url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", makeState("google")); url.searchParams.set("prompt", "select_account");
  return res.redirect(url.toString());
}

export async function googleLoginCallback(req: Request, res: Response) {
  try {
    if (typeof req.query.code !== "string" || typeof req.query.state !== "string") throw new Error("Google authorization was cancelled.");
    verifyState(req.query.state, "google");
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ code: req.query.code, client_id: env.GOOGLE_CLIENT_ID!, client_secret: env.GOOGLE_CLIENT_SECRET!, redirect_uri: env.GOOGLE_CALLBACK_URL!, grant_type: "authorization_code" }) });
    const tokenData = await tokenResponse.json() as { access_token?: string };
    if (!tokenResponse.ok || !tokenData.access_token) throw new Error("Google token exchange failed.");
    const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { Authorization: `Bearer ${tokenData.access_token}` } });
    const profile = await profileResponse.json() as { sub: string; email: string; email_verified: boolean; name?: string };
    if (!profileResponse.ok || !profile.email_verified || !profile.email) throw new Error("Google did not return a verified email address.");
    let user = await User.findOne({ $or: [{ googleId: profile.sub }, { email: profile.email.toLowerCase() }] });
    if (user) { if (user.googleId && user.googleId !== profile.sub) throw new Error("This email is already linked to another Google account."); user.googleId = profile.sub; await user.save(); }
    else user = await User.create({ name: profile.name || profile.email.split("@")[0], email: profile.email.toLowerCase(), googleId: profile.sub });
    const token = signAccessToken({ id: String(user._id), email: user.email, tokenVersion: user.tokenVersion });
    return res.redirect(`${clientUrl()}/auth/callback#token=${encodeURIComponent(token)}`);
  } catch (error) { return fail(res, error instanceof Error ? error.message : "Google Login failed."); }
}
