// Fills MongoDB with the sample content from seedData.js and creates the demo student.
// Run it with:  npm run seed
// It REPLACES tasks, steps, services and FAQs every time (edit seedData.js, run again).
// Other students are never deleted.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB } from '../lib/mongodb.js';
import Student from '../models/Student.js';
import Task from '../models/Task.js';
import TaskStep from '../models/TaskStep.js';
import UniversityService from '../models/UniversityService.js';
import FAQ from '../models/FAQ.js';
import { faqs, services, tasks } from './seedData.js';

// Plain Node does not read .env.local by itself (Next.js does), so load it here.
const backendFolder = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
dotenv.config({ path: path.join(backendFolder, '.env.local'), quiet: true });

async function seed() {
  await connectDB();
  console.log(`Connected to database "${mongoose.connection.name}"`);

  // 1. Remove old sample content, then make the database indexes match our models
  //    (syncIndexes also removes indexes left behind by older versions of a model)
  const contentModels = [Task, TaskStep, UniversityService, FAQ];
  await Promise.all(contentModels.map((Model) => Model.deleteMany({})));
  await Promise.all([...contentModels, Student].map((Model) => Model.syncIndexes()));

  // 2. Services, then remember each service's _id by its name
  const savedServices = await UniversityService.insertMany(services);
  const serviceId = Object.fromEntries(savedServices.map((service) => [service.name, service._id]));

  // 3. Tasks and their ordered steps
  const taskId = {};
  let stepCount = 0;
  for (const { steps, ...taskData } of tasks) {
    const task = await Task.create(taskData);
    taskId[task.title] = task._id;
    const stepDocuments = steps.map((step, index) => ({
      ...step,
      task: task._id,
      order: index + 1,
      service: step.service ? serviceId[step.service] : undefined,
    }));
    await TaskStep.insertMany(stepDocuments);
    stepCount += steps.length;
  }

  // 4. FAQs, linked to a task when the FAQ names one
  await FAQ.insertMany(faqs.map((faq) => ({ ...faq, task: faq.task ? taskId[faq.task] : undefined })));

  // 5. Demo student (password comes from .env.local and is stored only as a hash)
  const { SEED_STUDENT_NAME, SEED_STUDENT_REG_NO, SEED_STUDENT_PASSWORD } = process.env;
  if (SEED_STUDENT_REG_NO && SEED_STUDENT_PASSWORD) {
    await Student.findOneAndUpdate(
      { registrationNumber: SEED_STUDENT_REG_NO },
      {
        name: SEED_STUDENT_NAME || 'Demo Student',
        registrationNumber: SEED_STUDENT_REG_NO,
        passwordHash: await bcrypt.hash(SEED_STUDENT_PASSWORD, 10),
        program: 'B.Tech (Demo)',
      },
      { upsert: true },
    );
    console.log(`Demo student ready: ${SEED_STUDENT_REG_NO}`);
  } else {
    console.log('Skipped demo student: set SEED_STUDENT_REG_NO and SEED_STUDENT_PASSWORD in .env.local');
  }

  console.log(`Saved ${services.length} services, ${tasks.length} tasks, ${stepCount} steps, ${faqs.length} FAQs`);
}

seed()
  .catch((error) => {
    console.error('Seed failed:', error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
