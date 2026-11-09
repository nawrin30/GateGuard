import mongoose, { Schema } from "mongoose";
export interface IUser {
  name: string; email: string; passwordHash?: string;
  googleId?: string;
  githubId?: string; githubUsername?: string; githubTokenEncrypted?: string;
  resetTokenHash?: string; resetTokenExpires?: Date;
  githubOAuthStateHash?: string; githubOAuthStateExpires?: Date; tokenVersion: number;
}
const UserSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: false, select: false },
  googleId: { type: String, unique: true, sparse: true },
  githubId: String, githubUsername: String, githubTokenEncrypted: { type: String, select: false },
  resetTokenHash: { type: String, select: false }, resetTokenExpires: Date,
  githubOAuthStateHash: { type: String, select: false }, githubOAuthStateExpires: Date,
  tokenVersion: { type: Number, default: 0, min: 0 }
}, { timestamps: true });
export const User = mongoose.model<IUser>("User", UserSchema);
