import mongoose from 'mongoose';
import { normalizeTeamName } from '../utils/similarity.js';

const teamSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    teamName: {
      type: String,
      required: true,
      trim: true,
    },
    teamNameNormalized: {
      type: String,
      required: true,
      index: true,
    },
    projectTitle: {
      type: String,
      required: true,
      trim: true,
      default: '',
    },
    members: {
      type: [String],
      default: [],
    },
    identifier: {
      type: {
        type: String,
        enum: ['table', 'teamNo', null],
        default: null,
      },
      value: {
        type: String,
        default: '',
        trim: true,
      },
    },
    addedBy: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      role: {
        type: String,
        enum: ['admin', 'judge'],
        default: 'judge',
      },
      name: {
        type: String,
        default: '',
      },
    },
  },
  {
    timestamps: true,
  }
);

teamSchema.index({ eventId: 1, teamNameNormalized: 1 });

teamSchema.pre('validate', function () {
  if (this.teamName) {
    this.teamNameNormalized = normalizeTeamName(this.teamName);
  }
});

export const Team = mongoose.model('Team', teamSchema);
