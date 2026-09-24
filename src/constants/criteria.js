// SCORING CRITERIA (Fixed as specified — cannot be modified by users)
export const CRITERIA = [
  {
    id: 'innovation',
    name: 'Innovation & Originality',
    maxMarks: 15,
    description: 'Novelty of the concept, creativity in solving the problem, uniqueness compared to existing solutions.',
    iconName: 'Lightbulb',
  },
  {
    id: 'problem_relevance',
    name: 'Problem Relevance & Objective Clarity',
    maxMarks: 10,
    description: 'Significance of the problem addressed, clear statement of goals, target audience impact.',
    iconName: 'Target',
  },
  {
    id: 'technical_knowledge',
    name: 'Technical Knowledge & Feasibility',
    maxMarks: 20,
    description: 'Mastery of underlying engineering principles, appropriate tech stack selection, practical viability.',
    iconName: 'Cpu',
  },
  {
    id: 'functionality_model',
    name: 'Functionality & Working Model / Prototype',
    maxMarks: 20,
    description: 'Live demonstration success, robustness of prototype, execution under test conditions.',
    iconName: 'CheckCircle2',
  },
  {
    id: 'design_implementation',
    name: 'Design & Implementation',
    maxMarks: 10,
    description: 'Architecture quality, user interface/hardware aesthetics, code modularity or build craftsmanship.',
    iconName: 'LayoutTemplate',
  },
  {
    id: 'presentation_communication',
    name: 'Presentation & Communication Skills',
    maxMarks: 10,
    description: 'Pitch clarity, structured walkthrough, engaging communication, effective poster/slide visual aids.',
    iconName: 'Mic',
  },
  {
    id: 'qa_handling',
    name: 'Q&A Handling / Depth of Understanding',
    maxMarks: 10,
    description: 'Ability to answer challenging questions, defend architectural choices, acknowledge limitations.',
    iconName: 'HelpCircle',
  },
  {
    id: 'cost_scalability',
    name: 'Cost Effectiveness & Scalability',
    maxMarks: 5,
    description: 'Commercial potential, cost efficiency, roadmap for real-world scaling and mass deployment.',
    iconName: 'TrendingUp',
  },
];

export const TOTAL_MAX_MARKS = CRITERIA.reduce((sum, c) => sum + c.maxMarks, 0); // 100
