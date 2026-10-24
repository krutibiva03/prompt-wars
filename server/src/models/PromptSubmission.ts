import mongoose, { Schema, Document } from 'mongoose';

export interface IPromptSubmission extends Document {
  submissionId: string;
  sessionId: string;
  userId: string;
  missionId: number;
  prompt: string;
  selectedDocId?: string;
  generatedResponse: string;
  latencyMs: number;
  providerMode: string;
  evaluation: {
    isThreatDetected: boolean;
    threatLevel: 'CLEAN' | 'SUSPICIOUS' | 'CRITICAL' | 'BLOCKED';
    detectedCategories: string[];
    isSecretLeaked: boolean;
    isBenign: boolean;
    isDefenseBlocked: boolean;
    blockReason?: string;
    heuristicsTriggered: string[];
    scoreAwarded: number;
    feedbackMessage: string;
    educationalTakeaway: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const PromptSubmissionSchema = new Schema<IPromptSubmission>(
  {
    submissionId: { type: String, required: true, unique: true, index: true },
    sessionId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    missionId: { type: Number, required: true },
    prompt: { type: String, required: true, maxlength: 2000 },
    selectedDocId: { type: String },
    generatedResponse: { type: String, required: true },
    latencyMs: { type: Number, default: 0 },
    providerMode: { type: String, default: 'simulation' },
    evaluation: {
      isThreatDetected: { type: Boolean, default: false },
      threatLevel: { type: String, default: 'CLEAN' },
      detectedCategories: { type: [String], default: [] },
      isSecretLeaked: { type: Boolean, default: false },
      isBenign: { type: Boolean, default: true },
      isDefenseBlocked: { type: Boolean, default: false },
      blockReason: { type: String },
      heuristicsTriggered: { type: [String], default: [] },
      scoreAwarded: { type: Number, default: 0 },
      feedbackMessage: { type: String, default: '' },
      educationalTakeaway: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

export const PromptSubmissionModel =
  mongoose.models.PromptSubmission ||
  mongoose.model<IPromptSubmission>('PromptSubmission', PromptSubmissionSchema);
