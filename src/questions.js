const STORAGE_PREFIX = 'wellvisit_q_';

/**
 * Load questions for a visit, merging defaults with localStorage customizations.
 * Returns { questions: [{text, isCustom, deleted}], deleted: Set, custom: [] }
 */
export function loadQuestions(visitId, suggestedQuestions) {
  const key = STORAGE_PREFIX + visitId;
  let stored = { deleted: [], custom: [] };
  try {
    const raw = localStorage.getItem(key);
    if (raw) stored = JSON.parse(raw);
  } catch (e) { /* ignore */ }

  const deletedSet = new Set(stored.deleted);
  const questions = [];

  suggestedQuestions.forEach((text, i) => {
    if (!deletedSet.has(i)) {
      questions.push({ text, isCustom: false, index: i });
    }
  });

  (stored.custom || []).forEach((text, i) => {
    questions.push({ text, isCustom: true, customIndex: i });
  });

  return questions;
}

/**
 * Add a custom question for a visit.
 */
export function addQuestion(visitId, text) {
  const key = STORAGE_PREFIX + visitId;
  let stored = { deleted: [], custom: [] };
  try {
    const raw = localStorage.getItem(key);
    if (raw) stored = JSON.parse(raw);
  } catch (e) { /* ignore */ }

  if (!stored.custom) stored.custom = [];
  stored.custom.push(text);
  localStorage.setItem(key, JSON.stringify(stored));
}

/**
 * Delete a suggested question by its original index.
 */
export function deleteSuggested(visitId, index) {
  const key = STORAGE_PREFIX + visitId;
  let stored = { deleted: [], custom: [] };
  try {
    const raw = localStorage.getItem(key);
    if (raw) stored = JSON.parse(raw);
  } catch (e) { /* ignore */ }

  if (!stored.deleted) stored.deleted = [];
  if (!stored.deleted.includes(index)) {
    stored.deleted.push(index);
  }
  localStorage.setItem(key, JSON.stringify(stored));
}

/**
 * Delete a custom question by its index in the custom array.
 */
export function deleteCustom(visitId, customIndex) {
  const key = STORAGE_PREFIX + visitId;
  let stored = { deleted: [], custom: [] };
  try {
    const raw = localStorage.getItem(key);
    if (raw) stored = JSON.parse(raw);
  } catch (e) { /* ignore */ }

  if (stored.custom) {
    stored.custom.splice(customIndex, 1);
  }
  localStorage.setItem(key, JSON.stringify(stored));
}

/**
 * Restore all defaults — clear deleted and custom.
 */
export function restoreDefaults(visitId) {
  const key = STORAGE_PREFIX + visitId;
  localStorage.removeItem(key);
}

/**
 * Get all active question texts (for sharing).
 */
export function getQuestionTexts(visitId, suggestedQuestions) {
  return loadQuestions(visitId, suggestedQuestions).map(q => q.text);
}
