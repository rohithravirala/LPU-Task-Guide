/** "Check Attendance & Leave" -> "check-attendance-and-leave" */
export function slugify(input) {
  const slug = String(input ?? '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '');
  return slug || 'item';
}

/** Returns a slug that is not used by any other document of `Model` (adds -2, -3, ...). */
export async function uniqueSlug(Model, text, excludeId) {
  const root = slugify(text);
  let candidate = root;
  let suffix = 2;
  const exclude = excludeId ? { _id: { $ne: excludeId } } : {};

  while (await Model.exists({ slug: candidate, ...exclude })) {
    candidate = `${root}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}
