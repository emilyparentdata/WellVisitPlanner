const STORAGE_PREFIX = 'wellvisit_ms_';

/**
 * Load checked milestone state for a visit.
 * Returns a Set of "category::index" keys that are checked.
 */
export function loadMilestones(visitId) {
  const key = STORAGE_PREFIX + visitId;
  try {
    const raw = localStorage.getItem(key);
    if (raw) return new Set(JSON.parse(raw));
  } catch (e) { /* ignore */ }
  return new Set();
}

/**
 * Toggle a milestone's checked state.
 */
export function toggleMilestone(visitId, category, index, checked) {
  const key = STORAGE_PREFIX + visitId;
  const checkedSet = loadMilestones(visitId);
  const id = `${category}::${index}`;

  if (checked) {
    checkedSet.add(id);
  } else {
    checkedSet.delete(id);
  }

  localStorage.setItem(key, JSON.stringify([...checkedSet]));
}

/**
 * Get unchecked milestones grouped by category.
 * Returns array of { category, text } objects.
 */
export function getUncheckedMilestones(visitId, milestones) {
  const checked = loadMilestones(visitId);
  const unchecked = [];

  for (const [category, items] of Object.entries(milestones)) {
    items.forEach((text, i) => {
      if (!checked.has(`${category}::${i}`)) {
        unchecked.push({ category, text });
      }
    });
  }

  return unchecked;
}
