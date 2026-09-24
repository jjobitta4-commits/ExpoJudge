import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Event, DEFAULT_CRITERIA } from '../models/Event.js';
import { Team } from '../models/Team.js';
import { Score } from '../models/Score.js';
import { normalizeTeamName } from './similarity.js';
import { connectDB, disconnectDB } from '../config/db.js';

export async function seedDatabase(force = false) {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0 && !force) {
      return;
    }

    if (force) {
      await Score.deleteMany({});
      await Team.deleteMany({});
      await Event.deleteMany({});
      await User.deleteMany({});
    }

    console.log('[Seed] Seeding demo event with 8 teams, 3 judges, and mix of scores...');

    const salt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash('admin123', salt);
    const judgePasswordHash = await bcrypt.hash('judge123', salt);

    const admin = await User.create({
      name: 'Dr. Sarah Connor',
      email: 'admin@expojudge.com',
      passwordHash: adminPasswordHash,
      role: 'admin',
      panelLabel: 'Organizing Chair',
    });

    const judge1 = await User.create({
      name: 'Prof. Alan Turing',
      email: 'judge.turing@expojudge.com',
      passwordHash: judgePasswordHash,
      role: 'judge',
      panelLabel: 'Panel A - Software',
    });

    const judge2 = await User.create({
      name: 'Dr. Katherine Johnson',
      email: 'judge.johnson@expojudge.com',
      passwordHash: judgePasswordHash,
      role: 'judge',
      panelLabel: 'Panel B - Hardware',
    });

    const judge3 = await User.create({
      name: 'Dr. Homi Bhabha',
      email: 'judge.bhabha@expojudge.com',
      passwordHash: judgePasswordHash,
      role: 'judge',
      panelLabel: 'Panel C - Embedded',
    });

    const event = await Event.create({
      name: 'National Innovation & Project Expo 2026',
      collegeName: 'Apex Institute of Technology',
      date: new Date(),
      criteria: DEFAULT_CRITERIA,
      joinCode: 'EXPO26',
      organizerIds: [admin._id],
      judgeIds: [admin._id, judge1._id, judge2._id, judge3._id],
      isActive: true,
    });

    // Set activeEventId on all users
    await User.updateMany({}, { activeEventId: event._id });

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
      {
        teamName: 'CyberShield',
        projectTitle: 'Zero-Trust Industrial SCADA Intrusion Prevention Engine',
        identifier: { type: 'table', value: 'D-03' },
        members: ['Alex Rivera', 'Pooja Mehta'],
        addedBy: { userId: admin._id, role: 'admin', name: admin.name },
      },
      {
        teamName: 'NeuroGait',
        projectTitle: 'Wearable Exoskeleton Rehabilitation System for Stroke Patients',
        identifier: { type: 'teamNo', value: 'T-15' },
        members: ['Marcus Thorne', 'Lin Wei', 'Anita Roy'],
        addedBy: { userId: admin._id, role: 'admin', name: admin.name },
      },
      {
        teamName: 'AquaFilter Nano',
        projectTitle: 'Graphene Oxide Low-Pressure Arsenic Water Desalination',
        identifier: { type: 'table', value: 'E-07' },
        members: ['Siddharth Rao', 'Chloe Martin'],
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

    // Helper to generate realistic marks for a team
    const generateMarks = (baseScoreFraction) => {
      return DEFAULT_CRITERIA.map((c) => ({
        criterionId: c.id,
        criterionName: c.name,
        value: Math.round(c.maxMarks * (baseScoreFraction + (Math.random() * 0.15 - 0.075)) * 10) / 10,
      }));
    };

    // Judge 1: 5 completed, 1 draft, 2 unstarted
    for (let i = 0; i < 5; i++) {
      const marks = generateMarks(0.85);
      const totalScore = marks.reduce((sum, m) => sum + m.value, 0);
      await Score.create({
        eventId: event._id,
        judgeId: judge1._id,
        teamId: createdTeams[i]._id,
        marks,
        totalScore,
        remarks: 'Excellent technical depth and clear working demonstration.',
        isCompleted: true,
      });
    }
    // Draft score for team 5
    const partialMarks1 = generateMarks(0.7).slice(0, 4);
    await Score.create({
      eventId: event._id,
      judgeId: judge1._id,
      teamId: createdTeams[5]._id,
      marks: partialMarks1,
      totalScore: partialMarks1.reduce((sum, m) => sum + m.value, 0),
      remarks: 'Reviewed first four criteria, waiting for live telemetry demo.',
      isCompleted: false,
    });

    // Judge 2: 4 completed, 2 drafts, 2 unstarted
    for (let i = 0; i < 4; i++) {
      const marks = generateMarks(0.8);
      const totalScore = marks.reduce((sum, m) => sum + m.value, 0);
      await Score.create({
        eventId: event._id,
        judgeId: judge2._id,
        teamId: createdTeams[i]._id,
        marks,
        totalScore,
        remarks: 'Strong methodology and feasible deployment strategy.',
        isCompleted: true,
      });
    }
    const partialMarks2 = generateMarks(0.75).slice(0, 5);
    await Score.create({
      eventId: event._id,
      judgeId: judge2._id,
      teamId: createdTeams[4]._id,
      marks: partialMarks2,
      totalScore: partialMarks2.reduce((sum, m) => sum + m.value, 0),
      remarks: 'Draft pending cost breakdown review.',
      isCompleted: false,
    });

    // Judge 3: 3 completed, 1 draft
    for (let i = 0; i < 3; i++) {
      const marks = generateMarks(0.9);
      const totalScore = marks.reduce((sum, m) => sum + m.value, 0);
      await Score.create({
        eventId: event._id,
        judgeId: judge3._id,
        teamId: createdTeams[i]._id,
        marks,
        totalScore,
        remarks: 'Impressive innovation with tremendous commercial potential.',
        isCompleted: true,
      });
    }

    console.log('[Seed] Database successfully seeded with 8 teams, 3 judges, event (joinCode: EXPO26), and scores!');
  } catch (err) {
    console.error('[Seed] Error seeding database:', err);
  }
}

// Enable standalone CLI execution
if (process.argv[1]?.endsWith('seed.js')) {
  (async () => {
    await connectDB();
    await seedDatabase(true);
    await disconnectDB();
    process.exit(0);
  })();
}
