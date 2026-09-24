import mongoose from 'mongoose';

export const DEFAULT_CRITERIA = [
  {
    id: 'innovation',
    name: 'Innovation & Originality',
    maxMarks: 15,
    order: 1,
    description: 'Novelty of the concept, creativity in solving the problem, uniqueness compared to existing solutions.',
  },
  {
    id: 'problem_relevance',
    name: 'Problem Relevance & Objective Clarity',
    maxMarks: 10,
    order: 2,
    description: 'Significance of the problem addressed, clear statement of goals, target audience impact.',
  },
  {
    id: 'technical_knowledge',
    name: 'Technical Knowledge & Feasibility',
    maxMarks: 20,
    order: 3,
    description: 'Mastery of underlying engineering principles, appropriate tech stack selection, practical viability.',
  },
  {
    id: 'functionality_model',
    name: 'Functionality & Working Model / Prototype',
    maxMarks: 20,
    order: 4,
    description: 'Live demonstration success, robustness of prototype, execution under test conditions.',
  },
  {
    id: 'design_implementation',
    name: 'Design & Implementation',
    maxMarks: 10,
    order: 5,
    description: 'Architecture quality, user interface/hardware aesthetics, code modularity or build craftsmanship.',
  },
  {
    id: 'presentation_communication',
    name: 'Presentation & Communication Skills',
    maxMarks: 10,
    order: 6,
    description: 'Pitch clarity, structured walkthrough, engaging communication, effective poster/slide visual aids.',
  },
  {
    id: 'qa_handling',
    name: 'Q&A Handling / Depth of Understanding',
    maxMarks: 10,
    order: 7,
    description: 'Ability to answer challenging questions, defend architectural choices, acknowledge limitations.',
  },
  {
    id: 'cost_scalability',
    name: 'Cost Effectiveness & Scalability',
    maxMarks: 5,
    order: 8,
    description: 'Commercial potential, cost efficiency, roadmap for real-world scaling and mass deployment.',
  },
];

const criterionSchema = new mongoose.Schema(
  {
    id: { type: String, default: '' },
    name: { type: String, required: true },
    maxMarks: { type: Number, required: true },
    order: { type: Number, default: 0 },
    description: { type: String, default: '' },
  },
  { _id: false }
);

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    criteria: {
      type: [criterionSchema],
      default: DEFAULT_CRITERIA,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Event = mongoose.model('Event', eventSchema);
