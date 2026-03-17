import { getQuestionTexts } from './questions.js';
import { loadMilestones, getUncheckedMilestones } from './milestones.js';

/**
 * Build a plain-text version of the prep document.
 * Leads with "Things to Discuss" — unchecked milestones + user questions —
 * so the most actionable info is at the top.
 */
export function buildPrepText(visit) {
  const questions = getQuestionTexts(visit.id, visit.suggestedQuestions);
  const unchecked = getUncheckedMilestones(visit.id, visit.milestones);
  const checked = loadMilestones(visit.id);
  const lines = [];

  lines.push(`WELL VISIT PREP: ${visit.label} (${visit.ageDisplay})`);
  lines.push('Powered by ParentData');
  lines.push('');

  // ── Things to Discuss (top of document) ──
  const hasDiscussionItems = questions.length > 0 || unchecked.length > 0;
  if (hasDiscussionItems) {
    lines.push('═══ THINGS TO DISCUSS ═══');
    lines.push('');

    if (questions.length) {
      lines.push('Questions:');
      questions.forEach(q => lines.push(`  • ${q}`));
      lines.push('');
    }

    if (unchecked.length) {
      lines.push('Milestones to ask about (not yet checked off):');
      let currentCat = '';
      unchecked.forEach(({ category, text }) => {
        if (category !== currentCat) {
          currentCat = category;
          lines.push(`  ${category}:`);
        }
        lines.push(`    ☐ ${text}`);
      });
      lines.push('');
    }

    lines.push('─────────────────────────');
    lines.push('');
  }

  // ── What to Expect ──
  lines.push('── WHAT TO EXPECT ──');
  visit.whatToExpect.forEach(item => lines.push(`• ${item}`));
  lines.push('');

  // ── Vaccines ──
  lines.push('── VACCINES ──');
  visit.vaccines.forEach(v => {
    let line = `• ${v.name}`;
    if (v.note) line += ` — ${v.note}`;
    lines.push(line);
  });
  lines.push('');
  lines.push('Learn more:');
  visit.vaccineLinks.forEach(link => {
    lines.push(`  ${link.title}: ${link.url}`);
  });
  lines.push('');

  // ── Milestones (full list with check state) ──
  if (Object.keys(visit.milestones).length > 0) {
    lines.push('── MILESTONES ──');
    for (const [category, items] of Object.entries(visit.milestones)) {
      lines.push(`${category}:`);
      items.forEach((item, i) => {
        const mark = checked.has(`${category}::${i}`) ? '☑' : '☐';
        lines.push(`  ${mark} ${item}`);
      });
    }
    lines.push('');
  }

  // ── Articles ──
  lines.push('── RECOMMENDED READING ──');
  visit.articles.forEach(a => {
    lines.push(`• ${a.title}`);
    lines.push(`  ${a.url}`);
  });

  return lines.join('\n');
}

/**
 * Share via Web Share API (mobile).
 */
export async function sharePrep(visit) {
  const text = buildPrepText(visit);
  if (navigator.share) {
    try {
      await navigator.share({
        title: `Well Visit Prep: ${visit.label}`,
        text: text,
      });
      return true;
    } catch (e) {
      if (e.name === 'AbortError') return false;
      throw e;
    }
  }
  return false;
}

/**
 * Copy prep text to clipboard.
 */
export async function copyPrep(visit) {
  const text = buildPrepText(visit);
  await navigator.clipboard.writeText(text);
}

/**
 * Open mailto link with prep text.
 */
export function emailPrep(visit) {
  const text = buildPrepText(visit);
  const subject = encodeURIComponent(`Well Visit Prep: ${visit.label}`);
  const body = encodeURIComponent(text);
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
}
