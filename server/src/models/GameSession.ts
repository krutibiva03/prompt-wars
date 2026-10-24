import mongoose, { Schema, Document } from 'mongoose';

export interface IGameSession extends Document {
  sessionId: string;
  userId: string;
  missionId: number;
  status: 'active' | 'completed' | 'abandoned';
  attemptsCount: number;
  totalEarnedXP: number;
  isSecretLeaked: boolean;
  isDefenseBlocked: boolean;
  lastPrompt: string;
  activeDefenses: {
    instructionHierarchy: boolean;
    documentIsolation: boolean;
    outputFiltering: boolean;
    structuredValidation: boolean;
    leastPrivilegeTools: boolean;
  };
  startedAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const GameSessionSchema = new Schema<IGameSession>(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    missionId: { type: Number, required: true, min: 1, max: 10 },
    status: { type: String, enum: ['active', 'completed', 'abandoned'], default: 'active' },
    attemptsCount: { type: Number, default: 0 },
    totalEarnedXP: { type: Number, default: 0 },
    isSecretLeaked: { type: Boolean, default: false },
    isDefenseBlocked: { type: Boolean, default: false },
    lastPrompt: { type: String, default: '' },
    activeDefenses: {
      instructionHierarchy: { type: Boolean, default: false },
      documentIsolation: { type: Boolean, default: false },
      outputFiltering: { type: Boolean, default: false },
      structuredValidation: { type: Boolean, default: false },
      leastPrivilegeTools: { type: Boolean, default: false },
    },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

export const GameSessionModel =
  mongoose.models.GameSession || mongoose.model<IGameSession>('GameSession', GameSessionSchema);
