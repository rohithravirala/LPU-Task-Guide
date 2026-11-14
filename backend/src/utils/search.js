/**
 * Task search helpers.
 *
 * The catalogue is small (tens to a few hundred tasks), so search uses
 * case-insensitive partial matching + in-memory ranking instead of a MongoDB text
 * index. That gives "search as you type" behaviour ("atten" finds "attendance") and
 * lets us rank title matches above description matches. If the catalogue grows into
 * thousands of tasks, switch the candidate query to Atlas Search or a text index.
 */

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'at', 'can', 'do', 'for', 'get', 'how', 'i', 'in', 'is', 'it',
  'me', 'my', 'of', 'on', 'or', 'the', 'to', 'what', 'where', 'with',
]);

/**
 * Plain-language related terms so a student does not need the university's exact
 * wording. These are generic synonyms, not university policy. Admins can also add
 * per-task keywords, which is the preferred way to cover task-specific vocabulary.
 */
const RELATED_TERMS = {
  fine: ['dues', 'penalty', 'fee', 'payment'],
  fines: ['dues', 'penalty', 'fee', 'payment'],
  penalty: ['fine', 'dues'],
  dues: ['fee', 'fine', 'payment', 'pending'],
  fee: ['fees', 'payment', 'dues'],
  fees: ['fee', 'payment', 'dues'],
  pay: ['payment', 'fee'],
  payment: ['fee', 'pay', 'dues'],
  money: ['fee', 'payment'],
  marks: ['result', 'grade', 'score'],
  grade: ['result', 'marks'],
  grades: ['result', 'marks'],
  score: ['result', 'marks'],
  result: ['marks', 'grade'],
  results: ['result', 'marks', 'grade'],
  exam: ['examination', 'test'],
  exams: ['examination', 'exam'],
  test: ['exam', 'examination'],
  datesheet: ['examination', 'schedule', 'timetable'],
  absent: ['attendance', 'leave'],
  absence: ['attendance', 'leave'],
  present: ['attendance'],
  bunk: ['attendance'],
  leave: ['absence', 'attendance'],
  sick: ['leave', 'medical'],
  medical: ['leave'],
  certificate: ['document', 'letter'],
  letter: ['certificate', 'document'],
  bonafide: ['certificate'],
  document: ['certificate', 'documents'],
  transcript: ['certificate', 'marks', 'document'],
  schedule: ['timetable', 'datesheet'],
  timetable: ['schedule', 'classes'],
  classes: ['timetable', 'attendance'],
  login: ['sign', 'password', 'portal'],
  password: ['login', 'sign'],
  portal: ['ums', 'service'],
  notice: ['announcement', 'notices'],
  announcement: ['notice'],
  help: ['support', 'desk'],
  support: ['help', 'desk'],
  complaint: ['help', 'grievance', 'support'],
  recheck: ['re-evaluation', 'revaluation'],
  revaluation: ['re-evaluation', 'recheck'],
  elective: ['course', 'registration'],
  subject: ['course'],
  course: ['courses', 'registration'],
};

export function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Lower-cases, strips punctuation (keeps hyphens) and collapses whitespace. */
export function normaliseQuery(query) {
  return String(query ?? '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);
}

/** Up to 6 meaningful terms. Falls back to all words if everything was a stop word. */
export function tokenize(normalisedQuery) {
  const words = normalisedQuery.split(' ').filter(Boolean);
  const meaningful = words.filter((word) => word.length > 1 && !STOP_WORDS.has(word));
  return [...new Set(meaningful.length ? meaningful : words)].slice(0, 6);
}

/** Map of term -> related terms that are not already search terms. */
export function relatedTermsFor(terms) {
  const termSet = new Set(terms);
  const related = new Map();
  for (const term of terms) {
    const extras = (RELATED_TERMS[term] ?? []).filter((candidate) => !termSet.has(candidate));
    if (extras.length) related.set(term, extras);
  }
  return related;
}

function scoreTerm(term, fields) {
  let score = 0;
  const wordStart = new RegExp(`(^|[\\s-])${escapeRegex(term)}`);

  if (wordStart.test(fields.title)) score += 12;
  else if (fields.title.includes(term)) score += 8;

  if (fields.keywords.some((keyword) => keyword === term)) score += 9;
  else if (fields.keywords.some((keyword) => keyword.includes(term))) score += 5;

  if (fields.category.includes(term)) score += 4;
  if (fields.summary.includes(term)) score += 3;
  if (fields.description.includes(term)) score += 1;

  return score;
}

/**
 * Ranks tasks for a query. A term is "covered" when it, or one of its related terms,
 * matches. Tasks covering more of the student's terms rank first, then by score.
 */
export function rankTasks(tasks, { query, terms, related }) {
  const results = [];

  for (const task of tasks) {
    const fields = {
      title: task.title.toLowerCase(),
      summary: (task.summary ?? '').toLowerCase(),
      description: (task.description ?? '').toLowerCase(),
      keywords: task.keywords ?? [],
      category: `${task.category?.name ?? ''} ${task.category?.code ?? ''}`.toLowerCase(),
    };

    let score = fields.title.includes(query) ? 15 : 0;
    let covered = 0;

    for (const term of terms) {
      const direct = scoreTerm(term, fields);
      const viaRelated = Math.max(0, ...(related.get(term) ?? []).map((extra) => scoreTerm(extra, fields)));
      if (direct > 0 || viaRelated > 0) covered += 1;
      score += direct + viaRelated * 0.5;
    }

    if (covered > 0) results.push({ task, score, covered });
  }

  return results.sort(
    (a, b) =>
      b.covered - a.covered ||
      b.score - a.score ||
      (b.task.viewerCount ?? 0) - (a.task.viewerCount ?? 0) ||
      a.task.title.localeCompare(b.task.title),
  );
}
