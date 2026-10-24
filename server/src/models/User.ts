import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  userId: string;
  nickname: string;
  xp: number;
  level: number;
  completedMissions: number[];
  bestMissionScores: Map<string, number>;
  unlockedAchievements: string[];
  activeDefenses: {
    instructionHierarchy: boolean;
    documentIsolation: boolean;
    outputFiltering: boolean;
    structuredValidation: boolean;
    leastPrivilegeTools: boolean;
  };
  stats: {
    threatsIdentified: number;
    attacksBlocked: number;
    indirectInjectionsFound: number;
    perfectDefenses: number;
    totalSubmissions: number;
  };
  soundEnabled: boolean;
  reducedMotion: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    nickname: { type: String, default: 'Guest Auditor', trim: true, maxlength: 50 },
    xp: { type: Number, default: 0, min: 0 },
    level: { type: Number, default: 1, min: 1 },
    completedMissions: { type: [Number], default: [] },
    bestMissionScores: { type: Map, of: Number, default: {} },
    unlockedAchievements: { type: [String], default: [] },
    activeDefenses: {
      instructionHierarchy: { type: Boolean, default: false },
      documentIsolation: { type: Boolean, default: false },
      outputFiltering: { type: Boolean, default: false },
      structuredValidation: { type: Boolean, default: false },
      leastPrivilegeTools: { type: Boolean, default: false },
    },
    stats: {
      threatsIdentified: { type: Number, default: 0 },
      attacksBlocked: { type: Number, default: 0 },
      indirectInjectionsFound: { type: Number, default: 0 },
      perfectDefenses: { type: Number, default: 0 },
      totalSubmissions: { type: Number, default: 0 },
    },
    soundEnabled: { type: Boolean, default: true },
    reducedMotion: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
