import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { startGithubLogin, githubLoginCallback, startGoogleLogin, googleLoginCallback } from "../controllers/oauth.controller";
const router = Router();
router.get("/github", asyncHandler(startGithubLogin));
router.get("/github/callback", asyncHandler(githubLoginCallback));
router.get("/google", asyncHandler(startGoogleLogin));
router.get("/google/callback", asyncHandler(googleLoginCallback));
export default router;
