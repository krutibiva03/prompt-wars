import mongoose, { Schema, Document } from 'mongoose';

export interface IGameResult extends Document {
  resultId: string;
  userId: string;
  nickname: string;
  missionId: number;
  missionTitle: string;
  scoreAwarded: number;
  attemptsCount: number;
  timeTakenSeconds: number;
  isSecretLeaked: boolean;
  isDefenseBlocked: boolean;
  threatLevel: string;
  detectedCategories: string[];
  educationalTakeaway: string;
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const GameResultSchema = new Schema<IGameResult>(
  {
    resultId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    nickname: { type: String, default: 'Guest Auditor' },
    missionId: { type: Number, required: true, index: true },
    missionTitle: { type: String, required: true },
    scoreAwarded: { type: Number, required: true },
    attemptsCount: { type: Number, default: 1 },
    timeTakenSeconds: { type: Number, default: 0 },
    isSecretLeaked: { type: Boolean, default: false },
    isDefenseBlocked: { type: Boolean, default: false },
    threatLevel: { type: String, default: 'CLEAN' },
    detectedCategories: { type: [String], default: [] },
    educationalTakeaway: { type: String, default: '' },
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const GameResultModel =
  mongoose.models.GameResult || mongoose.model<IGameResult>('GameResult', GameResultSchema);
