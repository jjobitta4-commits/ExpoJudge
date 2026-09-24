import mongoose from 'mongoose';

const markItemSchema = new mongoose.Schema(
  {
    criterionId: {
      type: String,
      required: true,
    },
    criterionName: {
      type: String,
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const scoreSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    judgeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
      index: true,
    },
    marks: {
      type: [markItemSchema],
      default: [],
    },
    totalScore: {
      type: Number,
      required: true,
      min: 0,
    },
    remarks: {
      type: String,
      default: '',
      trim: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

scoreSchema.index({ judgeId: 1, teamId: 1 }, { unique: true });

export const Score = mongoose.model('Score', scoreSchema);
