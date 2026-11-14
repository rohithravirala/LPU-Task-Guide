/**
 * Development seed. Loads SAMPLE categories, services and tasks (all marked
 * "unverified") and creates the admin / demo-student accounts from .env.local.
 *
 *   npm run seed              seeds only when the catalogue is empty
 *   npm run seed -- --reset   replaces ALL categories, services, tasks, steps and task views
 *
 * Note: this script runs in plain Node (not through Next.js), so every module it
 * imports uses relative paths with explicit .js extensions.
 */
import './loadEnv.js'; // must stay first: loads .env.local before anything reads it
import bcrypt from 'bcryptjs';
import { connectDB, describeDatabaseError, disconnectDB, isDatabaseConnectionError } from '../lib/mongodb.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Service from '../models/Service.js';
import Task from '../models/Task.js';
import TaskStep from '../models/TaskStep.js';
import TaskView from '../models/TaskView.js';
import { slugify } from '../utils/slugify.js';
import { categories } from './data/categories.js';
import { services } from './data/services.js';
import { tasks } from './data/tasks.js';

const shouldReset = process.argv.includes('--reset');
const MODELS = [User, Category, Service, Task, TaskStep, TaskView];

async function seedCatalogue() {
  const existingTasks = await Task.countDocuments();
  if (existingTasks > 0 && !shouldReset) {
    console.log(
      `• The catalogue already has ${existingTasks} tasks, so it was left unchanged.\n` +
        '  Run "npm run seed -- --reset" to replace it with the sample content.',
    );
    return;
  }

  if (shouldReset) {
    await Promise.all([Category, Service, Task, TaskStep, TaskView].map((Model) => Model.deleteMany({})));
    console.log('• Cleared categories, services, tasks, steps and task views');
  }

  const categoryDocs = await Category.insertMany(
    categories.map((category) => ({ ...category, slug: slugify(category.name) })),
  );
  const categoryIdByCode = new Map(categoryDocs.map((doc) => [doc.code, doc._id]));

  const serviceDocs = await Service.insertMany(services.map(({ key: _key, ...service }) => service));
  const serviceIdByKey = new Map(services.map((service, index) => [service.key, serviceDocs[index]._id]));

  const serviceId = (key, context) => {
    if (!key) return null;
    const id = serviceIdByKey.get(key);
    if (!id) throw new Error(`Unknown service key "${key}" in ${context}`);
    return id;
  };

  let stepTotal = 0;
  for (const { category, primaryService, steps, ...task } of tasks) {
    const categoryId = categoryIdByCode.get(category);
    if (!categoryId) throw new Error(`Unknown category code "${category}" in task "${task.title}"`);

    const taskDoc = await Task.create({
      ...task,
      slug: slugify(task.title),
      categoryId,
      primaryServiceId: serviceId(primaryService, `task "${task.title}"`),
      verificationStatus: 'unverified',
    });

    await TaskStep.insertMany(
      steps.map(({ service, ...step }, index) => ({
        ...step,
        taskId: taskDoc._id,
        order: index + 1,
        serviceId: serviceId(service, `step ${index + 1} of "${task.title}"`),
      })),
    );
    stepTotal += steps.length;
  }

  console.log(
    `• Seeded ${categoryDocs.length} categories, ${serviceDocs.length} services, ` +
      `${tasks.length} tasks and ${stepTotal} steps (all marked "unverified")`,
  );
}

async function ensureUser({ label, name, email, password, role }) {
  if (!email || !password) {
    console.log(`• Skipped the ${label} account (set its email and password in .env.local)`);
    return;
  }
  if (password.length < 8) throw new Error(`The ${label} password must be at least 8 characters`);

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    if (role === 'admin' && existing.role !== 'admin') {
      existing.role = 'admin';
      await existing.save();
      console.log(`• Promoted ${email} to admin`);
    } else {
      console.log(`• The ${label} account ${email} already exists (password unchanged)`);
    }
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await User.create({ name, email, passwordHash, role });
  console.log(`• Created the ${label} account: ${email}`);
}

async function main() {
  await connectDB();
  await Promise.all(MODELS.map((Model) => Model.createIndexes()));

  await seedCatalogue();
  await ensureUser({
    label: 'admin',
    role: 'admin',
    name: process.env.SEED_ADMIN_NAME || 'Platform Admin',
    email: process.env.SEED_ADMIN_EMAIL,
    password: process.env.SEED_ADMIN_PASSWORD,
  });
  await ensureUser({
    label: 'demo student',
    role: 'student',
    name: process.env.SEED_STUDENT_NAME || 'Demo Student',
    email: process.env.SEED_STUDENT_EMAIL,
    password: process.env.SEED_STUDENT_PASSWORD,
  });

  console.log('Seed finished.');
}

main()
  .catch((error) => {
    console.error('Seed failed:', isDatabaseConnectionError(error) ? describeDatabaseError(error) : error.message);
    process.exitCode = 1;
  })
  .finally(disconnectDB);
