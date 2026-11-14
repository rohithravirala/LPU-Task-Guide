// Fills MongoDB with the sample content from seedData.js and creates the demo account.
// Run it with:  npm run seed
// It REPLACES tasks, steps, services, FAQs and demo updates every time (edit seedData.js, run again).
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
import DemoUpdate from '../models/DemoUpdate.js';
import { demoStudent, demoUpdates, faqs, services, tasks } from './seedData.js';

// Plain Node does not read .env.local by itself (Next.js does), so load it here.
const backendFolder = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
dotenv.config({ path: path.join(backendFolder, '.env.local'), quiet: true });

// A task without hand-written steps gets them from its portal and menu path:
//   1. Open <portal>   2. Go to <menu> › <section>   3. Open "<item>" and do the task
function stepsFromMenu(task, portal) {
  if (!portal) throw new Error(`Task "${task.title}" needs either "steps" or a "portal"`);

  const path = task.menuPath ?? [];
  const parents = path.slice(0, -1);
  const target = path.at(-1);

  const steps = [
    {
      title: `Open ${portal.name}`,
      service: portal.name,
      instructions:
        portal.type === 'Mobile App'
          ? [portal.openHint]
          : ['Use the “Open” button on this page; it takes you to the official site.', portal.openHint],
    },
  ];

  if (parents.length > 0) {
    steps.push({
      title: `Go to ${parents.join(' › ')}`,
      service: portal.name,
      instructions: [
        ...parents.map((part, index) => (index === 0 ? `Open “${part}”.` : `Look under “${part}”.`)),
        portal.menuHint,
      ],
    });
  }

  steps.push({
    title: task.howToTitle ?? (target ? `Open “${target}”` : `Do it on ${portal.name}`),
    service: portal.name,
    instructions: task.howTo ?? [`Follow the instructions on the page.`],
    note: task.stepNote,
  });

  // Drop empty hints (not every portal has a menuHint)
  return steps.map((step) => ({ ...step, instructions: step.instructions.filter(Boolean) }));
}

async function seed() {
  await connectDB();
  console.log(`Connected to database "${mongoose.connection.name}"`);

  // 1. Remove old sample content, then make the database indexes match our models
  //    (syncIndexes also removes indexes left behind by older versions of a model)
  const contentModels = [Task, TaskStep, UniversityService, FAQ, DemoUpdate];
  await Promise.all(contentModels.map((Model) => Model.deleteMany({})));
  await Promise.all([...contentModels, Student].map((Model) => Model.syncIndexes()));

  // 2. Services, then remember each saved service by its name.
  //    A misspelt service name stops the seed instead of silently losing a link.
  const savedServices = await UniversityService.insertMany(services);
  const serviceByName = Object.fromEntries(savedServices.map((service) => [service.name, service]));
  function serviceId(name, where) {
    if (!name) return undefined;
    if (!serviceByName[name]) throw new Error(`Unknown service "${name}" in ${where}`);
    return serviceByName[name]._id;
  }

  // 3. Tasks (one insert, same order as seedData.js), then all their ordered steps (one insert)
  const savedTasks = await Task.insertMany(
    tasks.map(({ steps, extraSteps, howTo, howToTitle, stepNote, portal, ...taskData }) => ({
      ...taskData,
      description: taskData.description ?? taskData.summary,
      portal: serviceId(portal, `task "${taskData.title}"`),
    })),
  );

  const stepDocuments = savedTasks.flatMap((task, index) => {
    const data = tasks[index];
    const steps = data.steps ?? [...stepsFromMenu(data, serviceByName[data.portal]), ...(data.extraSteps ?? [])];
    return steps.map((step, stepIndex) => ({
      ...step,
      task: task._id,
      order: stepIndex + 1,
      service: serviceId(step.service, `a step of "${task.title}"`),
    }));
  });
  await TaskStep.insertMany(stepDocuments);
  const stepCount = stepDocuments.length;

  // 4. FAQs, linked to a task when the FAQ names one
  const taskId = Object.fromEntries(savedTasks.map((task) => [task.title, task._id]));
  for (const faq of faqs) {
    if (faq.task && !taskId[faq.task]) throw new Error(`FAQ "${faq.question}" names an unknown task "${faq.task}"`);
  }
  await FAQ.insertMany(faqs.map((faq) => ({ ...faq, task: faq.task ? taskId[faq.task] : undefined })));

  // 5. Sample updates for the demo account, each linked to its task
  for (const update of demoUpdates) {
    if (!taskId[update.task]) throw new Error(`Demo update "${update.title}" names an unknown task "${update.task}"`);
  }
  await DemoUpdate.insertMany(demoUpdates.map((update, index) => ({ ...update, task: taskId[update.task], order: index + 1 })));

  // 6. The shared demo account (its password is stored only as a bcrypt hash)
  const { password, ...demoDetails } = demoStudent;
  await Student.findOneAndUpdate(
    { registrationNumber: demoStudent.registrationNumber },
    { ...demoDetails, passwordHash: await bcrypt.hash(password, 10), isDemo: true },
    { upsert: true },
  );
  console.log(`Demo account ready: ${demoStudent.registrationNumber} / ${password}`);

  console.log(
    `Saved ${services.length} services, ${tasks.length} tasks, ${stepCount} steps, ${faqs.length} FAQs, ${demoUpdates.length} demo updates`,
  );
}

seed()
  .catch((error) => {
    console.error('Seed failed:', error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
