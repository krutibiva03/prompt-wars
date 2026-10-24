import mongoose, { Schema, Document } from 'mongoose';

export interface IMission extends Document {
  id: number;
  title: string;
  codename: string;
  difficulty: string;
  story: string;
  protectedSecret: string;
  displaySecretMasked: string;
  baselineDefenses: {
    instructionHierarchy: boolean;
    documentIsolation: boolean;
    outputFiltering: boolean;
    structuredValidation: boolean;
    leastPrivilegeTools: boolean;
  };
  allowedActions: string[];
  objectives: Array<{
    id: string;
    description: string;
    points: number;
  }>;
  suggestedPrompts: string[];
  sampleDocuments?: Array<{
    id: string;
    title: string;
    filename: string;
    summary: string;
    content: string;
    containsInjection: boolean;
    injectionDetails?: string;
    previewSnippet: string;
  }>;
  educationalNotes: string[];
  exploitExplanation: string;
  defenseExplanation: string;
  createdAt: Date;
  updatedAt: Date;
}

const MissionSchema = new Schema<IMission>(
  {
    id: { type: Number, required: true, unique: true, index: true },
    title: { type: String, required: true },
    codename: { type: String, required: true },
    difficulty: { type: String, required: true },
    story: { type: String, required: true },
    protectedSecret: { type: String, required: true },
    displaySecretMasked: { type: String, required: true },
    baselineDefenses: {
      instructionHierarchy: { type: Boolean, default: false },
      documentIsolation: { type: Boolean, default: false },
      outputFiltering: { type: Boolean, default: false },
      structuredValidation: { type: Boolean, default: false },
      leastPrivilegeTools: { type: Boolean, default: false },
    },
    allowedActions: { type: [String], default: [] },
    objectives: [
      {
        id: { type: String, required: true },
        description: { type: String, required: true },
        points: { type: Number, required: true },
      },
    ],
    suggestedPrompts: { type: [String], default: [] },
    sampleDocuments: [
      {
        id: { type: String, required: true },
        title: { type: String, required: true },
        filename: { type: String, required: true },
        summary: { type: String, required: true },
        content: { type: String, required: true },
        containsInjection: { type: Boolean, default: false },
        injectionDetails: { type: String },
        previewSnippet: { type: String, default: '' },
      },
    ],
    educationalNotes: { type: [String], default: [] },
    exploitExplanation: { type: String, default: '' },
    defenseExplanation: { type: String, default: '' },
  },
  { timestamps: true }
);

export const MissionModel =
  mongoose.models.Mission || mongoose.model<IMission>('Mission', MissionSchema);
