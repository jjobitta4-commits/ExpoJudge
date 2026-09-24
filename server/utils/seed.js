import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Event, DEFAULT_CRITERIA } from '../models/Event.js';
import { Team } from '../models/Team.js';
import { Score } from '../models/Score.js';
import { normalizeTeamName } from './similarity.js';

export async function seedDatabase() {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      return;
    }

    console.log('[Seed] Seeding initial data for ExpoJudge...');

    const salt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash('admin123', salt);
    const judgePasswordHash = await bcrypt.hash('judge123', salt);

    const admin = await User.create({
      name: 'Admin Coordinator',
      email: 'admin@expojudge.com',
      passwordHash: adminPasswordHash,
      role: 'admin',
    });

    const judge1 = await User.create({
      name: 'Dr. Alan Smith',
      email: 'judge.smith@expojudge.com',
      passwordHash: judgePasswordHash,
      role: 'judge',
    });

    const judge2 = await User.create({
      name: 'Prof. Priya Patel',
      email: 'judge.patel@expojudge.com',
      passwordHash: judgePasswordHash,
      role: 'judge',
    });

    const judge3 = await User.create({
      name: 'Dr. Emily Chen',
      email: 'judge.chen@expojudge.com',
      passwordHash: judgePasswordHash,
      role: 'judge',
    });

    const event = await Event.create({
      name: 'Annual Engineering Project Expo 2026',
      date: new Date(),
      criteria: DEFAULT_CRITERIA,
      isActive: true,
    });

    const teamsData = [
      {
        teamName: 'EcoPulse',
        projectTitle: 'IoT Smart Grid Water Conservation System',
        identifier: { type: 'table', value: 'B-04' },
        members: ['Maya Sharma', 'David Kim', 'Lucas Vance'],
        addedBy: { userId: admin._id, role: 'admin', name: admin.name },
      },
      {
        teamName: 'VisionAid AI',
        projectTitle: 'Real-Time Edge Computer Vision for Visually Impaired',
        identifier: { type: 'teamNo', value: 'T-12' },
        members: ['Sarah Jenkins', 'Aarav Patel'],
        addedBy: { userId: admin._id, role: 'admin', name: admin.name },
      },
      {
        teamName: 'AeroDrone Bio',
        projectTitle: 'Autonomous Aerial Reforestation Drone with Seed Dispenser',
        identifier: { type: 'table', value: 'C-01' },
        members: ['Chloe Bennett', 'Hassan Raza', 'Elena Gomez'],
        addedBy: { userId: admin._id, role: 'admin', name: admin.name },
      },
      {
        teamName: 'MediSync',
        projectTitle: 'Decentralized Emergency Patient Triage & Vitals Telemetry',
        identifier: { type: 'teamNo', value: 'T-08' },
        members: ['Rajesh Iyer', 'Hannah Schmidt'],
        addedBy: { userId: admin._id, role: 'admin', name: admin.name },
      },
      {
        teamName: 'SolarStrobe',
        projectTitle: 'High-Efficiency Perovskite Solar Tracker with Predictive Maintenance',
        identifier: { type: 'table', value: 'A-09' },
        members: ['Kevin Zhao', 'Amara Okafor'],
        addedBy: { userId: admin._id, role: 'admin', name: admin.name },
      },
    ];

    const createdTeams = [];
    for (const t of teamsData) {
      const team = await Team.create({
        ...t,
        eventId: event._id,
        teamNameNormalized: normalizeTeamName(t.teamName),
      });
      createdTeams.push(team);
    }

    await Score.create({
      eventId: event._id,
      judgeId: judge1._id,
      teamId: createdTeams[0]._id,
      marks: [
        { criterionName: 'Innovation & Originality', value: 13.5 },
        { criterionName: 'Problem Relevance & Objective Clarity', value: 9.0 },
        { criterionName: 'Technical Knowledge & Feasibility', value: 18.5 },
        { criterionName: 'Functionality & Working Model / Prototype', value: 18.0 },
        { criterionName: 'Design & Implementation', value: 9.0 },
        { criterionName: 'Presentation & Communication Skills', value: 8.5 },
        { criterionName: 'Q&A Handling / Depth of Understanding', value: 9.0 },
        { criterionName: 'Cost Effectiveness & Scalability', value: 4.5 },
      ],
      totalScore: 90.0,
      remarks: 'Outstanding working demo. Sensor integration was remarkably stable.',
      isCompleted: true,
    });

    await Score.create({
      eventId: event._id,
      judgeId: judge1._id,
      teamId: createdTeams[1]._id,
      marks: [
        { criterionName: 'Innovation & Originality', value: 14.0 },
        { criterionName: 'Problem Relevance & Objective Clarity', value: 9.5 },
        { criterionName: 'Technical Knowledge & Feasibility', value: 17.5 },
        { criterionName: 'Functionality & Working Model / Prototype', value: 16.5 },
        { criterionName: 'Design & Implementation', value: 8.5 },
        { criterionName: 'Presentation & Communication Skills', value: 9.0 },
        { criterionName: 'Q&A Handling / Depth of Understanding', value: 8.0 },
        { criterionName: 'Cost Effectiveness & Scalability', value: 4.0 },
      ],
      totalScore: 87.0,
      remarks: 'Very compelling social impact. Edge inference speed was impressive.',
      isCompleted: true,
    });

    console.log('[Seed] Database successfully seeded with admin, judges, event, and teams!');
  } catch (err) {
    console.error('[Seed] Error seeding database:', err);
  }
}
