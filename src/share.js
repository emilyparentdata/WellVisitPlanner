import { getQuestionTexts } from './questions.js';
import { loadMilestones, getUncheckedMilestones } from './milestones.js';

/**
 * Build a plain-text version (for email mailto and Web Share fallback).
 */
export function buildPrepText(visit) {
  const questions = getQuestionTexts(visit.id, visit.suggestedQuestions);
  const unchecked = getUncheckedMilestones(visit.id, visit.milestones);
  const checked = loadMilestones(visit.id);
  const lines = [];

  lines.push(`${visit.ageDisplay} Well Visit Prep`);
  lines.push('Powered by ParentData');
  lines.push('');

  // Things to Discuss
  const hasDiscussionItems = questions.length > 0 || unchecked.length > 0;
  if (hasDiscussionItems) {
    lines.push('THINGS TO DISCUSS');
    lines.push('');

    if (questions.length) {
      lines.push('Questions:');
      questions.forEach(q => lines.push(`  - ${q}`));
      lines.push('');
    }

    if (unchecked.length) {
      lines.push('Milestones to ask about:');
      let currentCat = '';
      unchecked.forEach(({ category, text }) => {
        if (category !== currentCat) {
          currentCat = category;
          lines.push(`  ${category}:`);
        }
        lines.push(`    - ${text}`);
      });
      lines.push('');
    }
  }

  // What to Expect
  lines.push('WHAT TO EXPECT');
  visit.whatToExpect.forEach(item => lines.push(`  - ${item}`));
  lines.push('');

  // Vaccines
  lines.push('VACCINES');
  visit.vaccines.forEach(v => {
    let line = `  - ${v.name}`;
    if (v.note) line += ` (${v.note})`;
    lines.push(line);
  });
  if (visit.vaccineLinks.length) {
    lines.push('');
    lines.push('  Learn more:');
    visit.vaccineLinks.forEach(link => {
      lines.push(`    ${link.title}: ${link.url}`);
    });
  }
  lines.push('');

  // Milestones
  if (Object.keys(visit.milestones).length > 0) {
    lines.push('MILESTONES');
    for (const [category, items] of Object.entries(visit.milestones)) {
      lines.push(`  ${category}:`);
      items.forEach((item, i) => {
        const mark = checked.has(`${category}::${i}`) ? '[x]' : '[ ]';
        lines.push(`    ${mark} ${item}`);
      });
    }
    lines.push('');
  }

  // Articles
  lines.push('RECOMMENDED READING');
  visit.articles.forEach(a => {
    lines.push(`  - ${a.title}`);
    lines.push(`    ${a.url}`);
  });

  return lines.join('\n');
}

/**
 * Build a rich HTML version for clipboard (pastes nicely into Notes, Docs, email composers).
 */
function buildPrepHTML(visit) {
  const questions = getQuestionTexts(visit.id, visit.suggestedQuestions);
  const unchecked = getUncheckedMilestones(visit.id, visit.milestones);
  const checked = loadMilestones(visit.id);

  const s = {
    wrapper: 'font-family: -apple-system, system-ui, "Segoe UI", sans-serif; color: #2d3047; max-width: 600px;',
    header: 'margin: 0 0 4px 0; font-size: 22px; color: #054f8b;',
    subtitle: 'margin: 0 0 20px 0; font-size: 13px; color: #888;',
    discussBox: 'background: #fffcee; border-left: 4px solid #054f8b; padding: 16px 20px; margin-bottom: 24px; border-radius: 6px;',
    discussTitle: 'margin: 0 0 12px 0; font-size: 16px; color: #054f8b; font-weight: 700;',
    sectionTitle: 'margin: 24px 0 8px 0; font-size: 15px; color: #054f8b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #a8dff2; padding-bottom: 4px;',
    catTitle: 'margin: 12px 0 4px 0; font-size: 13px; color: #666; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px;',
    ul: 'margin: 4px 0 0 0; padding-left: 20px;',
    li: 'margin-bottom: 4px; font-size: 14px; line-height: 1.5;',
    checkItem: 'margin-bottom: 3px; font-size: 14px; line-height: 1.5;',
    link: 'color: #054f8b;',
    vaccNote: 'color: #888; font-size: 13px;',
  };

  let html = `<div style="${s.wrapper}">`;

  // Header
  html += `<h1 style="${s.header}">${visit.ageDisplay} Well Visit Prep</h1>`;
  html += `<p style="${s.subtitle}">Powered by <a href="https://parentdata.org" style="${s.link}">ParentData</a></p>`;

  // Things to Discuss
  const hasDiscussionItems = questions.length > 0 || unchecked.length > 0;
  if (hasDiscussionItems) {
    html += `<div style="${s.discussBox}">`;
    html += `<h2 style="${s.discussTitle}">Things to Discuss</h2>`;

    if (questions.length) {
      html += `<p style="margin: 0 0 4px 0; font-size: 13px; font-weight: 600; color: #054f8b;">Questions:</p>`;
      html += `<ul style="${s.ul}">`;
      questions.forEach(q => { html += `<li style="${s.li}">${esc(q)}</li>`; });
      html += '</ul>';
    }

    if (unchecked.length) {
      if (questions.length) html += '<br>';
      html += `<p style="margin: 0 0 4px 0; font-size: 13px; font-weight: 600; color: #054f8b;">Milestones to ask about:</p>`;
      let currentCat = '';
      html += `<ul style="${s.ul}; list-style: none; padding-left: 8px;">`;
      unchecked.forEach(({ category, text }) => {
        if (category !== currentCat) {
          if (currentCat) html += '<br>';
          currentCat = category;
          html += `<li style="font-size: 12px; color: #666; font-weight: 600; text-transform: uppercase; margin-bottom: 2px;">${esc(category)}</li>`;
        }
        html += `<li style="${s.checkItem}">&#9744; ${esc(text)}</li>`;
      });
      html += '</ul>';
    }

    html += '</div>';
  }

  // What to Expect
  html += `<h3 style="${s.sectionTitle}">What to Expect</h3>`;
  html += `<ul style="${s.ul}">`;
  visit.whatToExpect.forEach(item => { html += `<li style="${s.li}">${esc(item)}</li>`; });
  html += '</ul>';

  // Vaccines
  html += `<h3 style="${s.sectionTitle}">Vaccines</h3>`;
  html += `<ul style="${s.ul}">`;
  visit.vaccines.forEach(v => {
    let note = v.note ? ` <span style="${s.vaccNote}">— ${esc(v.note)}</span>` : '';
    html += `<li style="${s.li}"><strong>${esc(v.name)}</strong>${note}</li>`;
  });
  html += '</ul>';
  if (visit.vaccineLinks.length) {
    html += `<p style="margin: 8px 0 4px 0; font-size: 13px; font-weight: 600; color: #666;">Learn more:</p>`;
    visit.vaccineLinks.forEach(link => {
      html += `<p style="margin: 2px 0 2px 20px; font-size: 13px;"><a href="${esc(link.url)}" style="${s.link}">${esc(link.title)}</a></p>`;
    });
  }

  // Milestones
  if (Object.keys(visit.milestones).length > 0) {
    html += `<h3 style="${s.sectionTitle}">Milestones</h3>`;
    for (const [category, items] of Object.entries(visit.milestones)) {
      html += `<p style="${s.catTitle}">${esc(category)}</p>`;
      items.forEach((item, i) => {
        const isChecked = checked.has(`${category}::${i}`);
        const mark = isChecked ? '&#9745;' : '&#9744;';
        const textStyle = isChecked ? 'color: #999; text-decoration: line-through;' : '';
        html += `<p style="${s.checkItem}">${mark} <span style="${textStyle}">${esc(item)}</span></p>`;
      });
    }
  }

  // Articles
  html += `<h3 style="${s.sectionTitle}">Recommended Reading</h3>`;
  html += `<ul style="${s.ul}">`;
  visit.articles.forEach(a => {
    html += `<li style="${s.li}"><a href="${esc(a.url)}" style="${s.link}">${esc(a.title)}</a></li>`;
  });
  html += '</ul>';

  html += '</div>';
  return html;
}

function esc(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
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
 * Copy as rich HTML + plain text fallback to clipboard.
 */
export async function copyPrep(visit) {
  const html = buildPrepHTML(visit);
  const text = buildPrepText(visit);

  try {
    const htmlBlob = new Blob([html], { type: 'text/html' });
    const textBlob = new Blob([text], { type: 'text/plain' });
    await navigator.clipboard.write([
      new ClipboardItem({
        'text/html': htmlBlob,
        'text/plain': textBlob,
      }),
    ]);
  } catch {
    // Fallback for browsers that don't support ClipboardItem
    await navigator.clipboard.writeText(text);
  }
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
