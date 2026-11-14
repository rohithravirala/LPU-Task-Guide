// The app's data, built once from the hard-coded files in this folder (no database).
// It gives every item an `_id`, builds the steps of tasks that have none, links every
// name to its object, and stops with a clear error if content.js names something unknown.
import { demoUpdates, faqs as faqContent, services as serviceContent, tasks as taskContent } from './content.js';
import { students } from './students.js';

// "Check your attendance" -> "check-your-attendance" (used as the id in page addresses)
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/* ---------- Services: portals (UMS, LPU Live ...) and offices ---------- */

export const services = serviceContent.map((service) => ({ ...service, _id: service.slug ?? slugify(service.name) }));
const serviceByName = new Map(services.map((service) => [service.name, service]));

function serviceNamed(name, where) {
  if (!name) return null;
  const service = serviceByName.get(name);
  if (!service) throw new Error(`Unknown service "${name}" in ${where} (src/data/content.js)`);
  return service;
}

export const portals = services.filter((service) => service.isPortal).sort((a, b) => a.order - b.order);

/* ---------- Tasks and their steps ---------- */

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
    instructions: task.howTo ?? ['Follow the instructions on the page.'],
    note: task.stepNote,
  });

  return steps;
}

export const tasks = taskContent.map(({ steps, extraSteps, howTo, howToTitle, stepNote, portal: portalName, ...task }) => {
  const _id = slugify(task.title);
  const portal = serviceNamed(portalName, `task "${task.title}"`);
  const stepContent = steps ?? [...stepsFromMenu({ ...task, howTo, howToTitle, stepNote }, portal), ...(extraSteps ?? [])];

  return {
    ...task,
    _id,
    description: task.description ?? task.summary,
    requirements: task.requirements ?? [],
    keywords: task.keywords ?? [],
    menuPath: task.menuPath ?? [],
    url: task.url ?? '',
    isPopular: Boolean(task.isPopular),
    portal,
    steps: stepContent.map((step, index) => ({
      _id: `${_id}-${index + 1}`,
      order: index + 1,
      title: step.title,
      instructions: (step.instructions ?? []).filter(Boolean), // drop empty hints
      note: step.note,
      isOptional: Boolean(step.isOptional),
      service: serviceNamed(step.service, `a step of "${task.title}"`),
    })),
  };
});

const taskById = new Map(tasks.map((task) => [task._id, task]));
if (taskById.size !== tasks.length) throw new Error('Two tasks in src/data/content.js have the same title');
const taskByTitle = new Map(tasks.map((task) => [task.title, task]));

function taskTitled(title, where) {
  const task = taskByTitle.get(title);
  if (!task) throw new Error(`${where} names an unknown task "${title}" (src/data/content.js)`);
  return task;
}

export function findTask(id) {
  return taskById.get(id) ?? null;
}

export const categories = [...new Set(tasks.map((task) => task.category))].sort();

/* ---------- FAQs ---------- */

export const faqs = faqContent
  .map((faq, index) => ({
    ...faq,
    _id: `faq-${index + 1}`,
    task: faq.task ? taskTitled(faq.task, `FAQ "${faq.question}"`)._id : null,
    keywords: faq.keywords ?? [],
  }))
  .sort((a, b) => a.category.localeCompare(b.category) || a.question.localeCompare(b.question));

/* ---------- Sample updates ---------- */

export const updates = demoUpdates.map((update, index) => ({
  ...update,
  _id: `update-${index + 1}`,
  task: taskTitled(update.task, `Update "${update.title}"`),
}));

/* ---------- Students ---------- */

export function findStudentByRegistrationNumber(registrationNumber) {
  return students.find((student) => student.registrationNumber === registrationNumber) ?? null;
}

export function findStudentById(id) {
  return students.find((student) => student._id === id) ?? null;
}

// The account used by the "Try demo" button
export function findDemoStudent() {
  return students.find((student) => student.isDemo) ?? null;
}
