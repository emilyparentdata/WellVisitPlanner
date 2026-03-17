import { getQuestionTexts } from './questions.js';
import { loadMilestones, getUncheckedMilestones } from './milestones.js';

/**
 * Build a plain-text version (fallback).
 */
export function buildPrepText(visit) {
  const questions = getQuestionTexts(visit.id, visit.suggestedQuestions);
  const unchecked = getUncheckedMilestones(visit.id, visit.milestones);
  const checked = loadMilestones(visit.id);
  const lines = [];

  lines.push(`${visit.ageDisplay} Well Visit Prep`);
  lines.push('Powered by ParentData');
  lines.push('');

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
      lines.push('Milestones you might want to discuss:');
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

  lines.push('EVERYTHING YOU NEED TO KNOW');
  lines.push('');
  lines.push('What to Expect');
  visit.whatToExpect.forEach(item => lines.push(`  - ${item}`));
  lines.push('');

  lines.push('Vaccines');
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

  if (Object.keys(visit.milestones).length > 0) {
    lines.push('All Milestones');
    for (const [category, items] of Object.entries(visit.milestones)) {
      lines.push(`  ${category}:`);
      items.forEach((item, i) => {
        const mark = checked.has(`${category}::${i}`) ? '[x]' : '[ ]';
        lines.push(`    ${mark} ${item}`);
      });
    }
    lines.push('');
  }

  lines.push('Recommended Reading');
  visit.articles.forEach(a => {
    lines.push(`  - ${a.title}`);
    lines.push(`    ${a.url}`);
  });

  return lines.join('\n');
}

/**
 * Build rich HTML body fragment (for clipboard paste into rich editors).
 */
function buildPrepHTMLFragment(visit) {
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

  return buildHTMLBody(visit, questions, unchecked, checked, s);
}

/**
 * Build a full standalone HTML document (for file sharing and email preview).
 */
function buildPrepHTMLDocument(visit) {
  const questions = getQuestionTexts(visit.id, visit.suggestedQuestions);
  const unchecked = getUncheckedMilestones(visit.id, visit.milestones);
  const checked = loadMilestones(visit.id);

  const s = {
    wrapper: 'font-family: -apple-system, system-ui, "Segoe UI", sans-serif; color: #2d3047; max-width: 600px; margin: 0 auto; padding: 24px 16px;',
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

  const body = buildHTMLBody(visit, questions, unchecked, checked, s);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(visit.ageDisplay)} Well Visit Prep — ParentData</title>
<style>
  body { margin: 0; background: #f8f8f8; }
  @media print {
    body { background: #fff; }
  }
</style>
</head>
<body>
${body}
</body>
</html>`;
}

/**
 * Shared HTML body builder used by both fragment and document builders.
 */
function buildHTMLBody(visit, questions, unchecked, checked, s) {
  let html = `<div style="${s.wrapper}">`;

  // Header
  html += `<h1 style="${s.header}">${esc(visit.ageDisplay)} Well Visit Prep</h1>`;
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
      html += `<p style="margin: 0 0 4px 0; font-size: 13px; font-weight: 600; color: #054f8b;">Milestones you might want to discuss:</p>`;
      let currentCat = '';
      unchecked.forEach(({ category, text }) => {
        if (category !== currentCat) {
          currentCat = category;
          html += `<p style="${s.catTitle}">${esc(category)}</p>`;
        }
        html += `<p style="${s.checkItem}; padding-left: 8px;">\u2610 ${esc(text)}</p>`;
      });
    }

    html += '</div>';
  }

  // Everything You Need to Know
  html += `<h2 style="${s.discussTitle}; margin-top: 32px;">Everything You Need to Know</h2>`;

  // What to Expect
  html += `<h3 style="${s.sectionTitle}">What to Expect</h3>`;
  html += `<ul style="${s.ul}">`;
  visit.whatToExpect.forEach(item => { html += `<li style="${s.li}">${esc(item)}</li>`; });
  html += '</ul>';

  // Vaccines
  html += `<h3 style="${s.sectionTitle}">Vaccines</h3>`;
  html += `<ul style="${s.ul}">`;
  visit.vaccines.forEach(v => {
    let note = v.note ? ` <span style="${s.vaccNote}">\u2014 ${esc(v.note)}</span>` : '';
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
    html += `<h3 style="${s.sectionTitle}">All Milestones</h3>`;
    for (const [category, items] of Object.entries(visit.milestones)) {
      html += `<p style="${s.catTitle}">${esc(category)}</p>`;
      items.forEach((item, i) => {
        const isChecked = checked.has(`${category}::${i}`);
        const mark = isChecked ? '\u2611' : '\u2610';
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
 * Share via Web Share API — tries to share as an HTML file first,
 * falls back to plain text.
 */
export async function sharePrep(visit) {
  if (!navigator.share) return false;

  // Try sharing as an HTML file (renders nicely in Notes, Messages, etc.)
  try {
    const htmlDoc = buildPrepHTMLDocument(visit);
    const file = new File([htmlDoc], `${visit.label} Well Visit Prep.html`, { type: 'text/html' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: `Well Visit Prep: ${visit.label}`,
        files: [file],
      });
      return true;
    }
  } catch (e) {
    if (e.name === 'AbortError') return false;
    // Fall through to text sharing
  }

  // Fallback: share as plain text
  try {
    await navigator.share({
      title: `Well Visit Prep: ${visit.label}`,
      text: buildPrepText(visit),
    });
    return true;
  } catch (e) {
    if (e.name === 'AbortError') return false;
    throw e;
  }
}

/**
 * Copy as rich HTML + plain text fallback to clipboard.
 */
export async function copyPrep(visit) {
  const html = buildPrepHTMLFragment(visit);
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
    await navigator.clipboard.writeText(text);
  }
}

/**
 * Open a formatted prep document in a new tab for emailing/printing.
 */
export function emailPrep(visit) {
  const htmlDoc = buildPrepHTMLDocument(visit);
  const blob = new Blob([htmlDoc], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}
