import { demoUpdates, faqs as faqContent, services as serviceContent, tasks as taskContent } from './content.js';
import { students } from './students.js';

const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const services = serviceContent.map((service) => ({ ...service, _id: service.slug ?? slugify(service.name) }));
export const portals = services.filter((service) => service.isPortal).sort((a, b) => a.order - b.order);

function findService(name, where) {
  if (!name) return null;
  const service = services.find((s) => s.name === name);
  if (!service) throw new Error(`Unknown service "${name}" in ${where} (src/data/content.js)`);
  return service;
}

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

  if (parents.length) {
    steps.push({
      title: `Go to ${parents.join(' › ')}`,
      service: portal.name,
      instructions: [...parents.map((part, i) => (i === 0 ? `Open “${part}”.` : `Look under “${part}”.`)), portal.menuHint],
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

export const tasks = taskContent.map((item) => {
  const { steps, extraSteps = [], howTo, howToTitle, stepNote, portal: portalName, ...task } = item;
  const _id = slugify(task.title);
  const portal = findService(portalName, `task "${task.title}"`);
  const allSteps = steps ?? [...stepsFromMenu(item, portal), ...extraSteps];

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
    steps: allSteps.map((step, index) => ({
      _id: `${_id}-${index + 1}`,
      order: index + 1,
      title: step.title,
      instructions: (step.instructions ?? []).filter(Boolean),
      note: step.note,
      isOptional: Boolean(step.isOptional),
      service: findService(step.service, `a step of "${task.title}"`),
    })),
  };
});

if (new Set(tasks.map((task) => task._id)).size !== tasks.length) {
  throw new Error('Two tasks in src/data/content.js have the same title');
}

function findTaskByTitle(title, where) {
  const task = tasks.find((t) => t.title === title);
  if (!task) throw new Error(`${where} names an unknown task "${title}" (src/data/content.js)`);
  return task;
}

export const categories = [...new Set(tasks.map((task) => task.category))].sort();

export const faqs = faqContent
  .map((faq, index) => ({
    ...faq,
    _id: `faq-${index + 1}`,
    task: faq.task ? findTaskByTitle(faq.task, `FAQ "${faq.question}"`)._id : null,
    keywords: faq.keywords ?? [],
  }))
  .sort((a, b) => a.category.localeCompare(b.category) || a.question.localeCompare(b.question));

export const updates = demoUpdates.map((update, index) => ({
  ...update,
  _id: `update-${index + 1}`,
  task: findTaskByTitle(update.task, `Update "${update.title}"`),
}));

export const findTask = (id) => tasks.find((task) => task._id === id) ?? null;
export const findStudentById = (id) => students.find((student) => student._id === id) ?? null;
export const findStudentByRegistrationNumber = (number) => students.find((student) => student.registrationNumber === number) ?? null;
export const findDemoStudent = () => students.find((student) => student.isDemo) ?? null;
