export const INITIAL_EVENT_CONFIG = {
  eventName: 'National Engineering & Tech Innovation Expo 2026',
  organizer: 'Faculty of Technology & Innovation Cell',
  venue: 'Main Exhibition Hall & Innovation Atrium',
  date: new Date().toISOString().split('T')[0],
};

export const DEMO_TEAMS = [
  {
    id: 'team_01',
    teamName: 'Apex Robotics',
    projectTitle: 'Autonomous Greenhouse Rover with Computer Vision Weed Extermination',
    identifier: 'Table A-04',
    members: 'Aria Chen, Liam O\'Connor, Maya Patel',
    createdAt: Date.now() - 3600000 * 5,
  },
  {
    id: 'team_02',
    teamName: 'BioPulse Health',
    projectTitle: 'Non-Invasive Continuous Hemoglobin & Glucose Monitor',
    identifier: 'Team #108',
    members: 'David Kim, Sarah Jenkins',
    createdAt: Date.now() - 3600000 * 4,
  },
  {
    id: 'team_03',
    teamName: 'HydroPure Solutions',
    projectTitle: 'Solar-Powered Low-Cost Heavy Metal Water Filtration System',
    identifier: 'Stall B-12',
    members: 'Zubair Al-Mansoor, Elena Rossi, Kenji Sato',
    createdAt: Date.now() - 3600000 * 3,
  },
  {
    id: 'team_04',
    teamName: 'NeuroLink Ed',
    projectTitle: 'EEG-Based Attention Assistant for Neurodivergent Students',
    identifier: '', // Intentionally blank to test requirement: hide cleanly if blank
    members: 'Sophia Reynolds, Marcus Vance',
    createdAt: Date.now() - 3600000 * 2,
  },
  {
    id: 'team_05',
    teamName: 'GridGuard Dynamics',
    projectTitle: 'Edge-AI Microgrid Fault Predictor & Islanding Controller',
    identifier: 'Table C-07',
    members: 'Ananya Sharma, Rahul Nair',
    createdAt: Date.now() - 3600000 * 1,
  },
  {
    id: 'team_06',
    teamName: 'Veloce Mobility',
    projectTitle: 'Solid-State Battery Thermal Management System with Regenerative Cooling',
    identifier: 'Team #214',
    members: 'Carlos Gomez, Viktor Lindholm, Fatima Zahra',
    createdAt: Date.now(),
  },
];
