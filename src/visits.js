import { loadQuestions, addQuestion, deleteSuggested, deleteCustom, restoreDefaults } from './questions.js';
import { loadMilestones, toggleMilestone } from './milestones.js';

/**
 * Render the visit picker grid.
 */
const VISIT_ICONS = {
  newborn: '👶',
  '1mo':   '🍼',
  '2mo':   '😴',
  '4mo':   '🧸',
  '6mo':   '🥣',
  '9mo':   '👋',
  '12mo':  '🎂',
  '15mo':  '👣',
  '18mo':  '📚',
  '24mo':  '🎨',
  '30mo':  '🧩',
  '36mo':  '🎒',
};

export function renderVisitPicker(visits, onSelect) {
  const grid = document.getElementById('visit-grid');
  grid.innerHTML = '';

  visits.forEach(visit => {
    const card = document.createElement('button');
    card.className = 'visit-card';

    const icon = VISIT_ICONS[visit.id] || '🩺';

    // Check if user has saved notes for this visit
    let savedBadge = '';
    try {
      const raw = localStorage.getItem('wellvisit_q_' + visit.id);
      if (raw) {
        const stored = JSON.parse(raw);
        const hasNotes = (stored.custom && stored.custom.length > 0) ||
                         (stored.deleted && stored.deleted.length > 0);
        if (hasNotes) {
          savedBadge = '<div class="visit-card__saved">&#9998; Notes saved</div>';
        }
      }
    } catch (e) { /* ignore */ }

    card.innerHTML = `
      <div class="visit-card__icon-img">${icon}</div>
      <div class="visit-card__age">${visit.label}</div>
      ${savedBadge}
    `;
    card.addEventListener('click', () => onSelect(visit));
    grid.appendChild(card);
  });
}

/**
 * Render the full prep document for a visit.
 */
export function renderVisitPrep(visit) {
  const container = document.getElementById('prep-content');
  container.innerHTML = '';

  // Header
  const header = document.createElement('h2');
  header.className = 'prep-header';
  header.textContent = `${visit.ageDisplay} Well Visit`;
  container.appendChild(header);

  // 1. What to Expect
  container.appendChild(renderWhatToExpect(visit.whatToExpect));

  // 2. Vaccines
  container.appendChild(renderVaccines(visit.vaccines, visit.vaccineLinks));

  // 3. Milestones (skip if none for this visit)
  if (Object.keys(visit.milestones).length > 0) {
    container.appendChild(renderMilestones(visit.id, visit.milestones));
  }

  // 4. Questions
  container.appendChild(renderQuestions(visit));

  // 5. Recommended Reading
  container.appendChild(renderArticles(visit.articles));
}

function renderWhatToExpect(items) {
  const card = createCard('What to Expect', '🩺');
  const ul = document.createElement('ul');
  ul.className = 'prep-list';
  items.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    ul.appendChild(li);
  });
  card.appendChild(ul);
  return card;
}

function renderVaccines(vaccines, links) {
  const card = createCard('Vaccines', '💉');

  vaccines.forEach(v => {
    const div = document.createElement('div');
    div.className = 'vaccine-item';
    div.innerHTML = `
      <div class="vaccine-name">${v.name}</div>
      ${v.note ? `<div class="vaccine-note">${v.note}</div>` : ''}
    `;
    card.appendChild(div);
  });

  if (links && links.length) {
    const linksDiv = document.createElement('div');
    linksDiv.className = 'vaccine-links';
    links.forEach(link => {
      const a = document.createElement('a');
      a.href = link.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = link.title;
      linksDiv.appendChild(a);
    });
    card.appendChild(linksDiv);
  }

  return card;
}

function renderMilestones(visitId, milestones) {
  const card = createCard('Milestones', '📋');
  const checked = loadMilestones(visitId);

  for (const [category, items] of Object.entries(milestones)) {
    const group = document.createElement('div');
    group.className = 'milestone-category';

    const title = document.createElement('div');
    title.className = 'milestone-category__title';
    title.textContent = category;
    group.appendChild(title);

    items.forEach((item, i) => {
      const row = document.createElement('div');
      row.className = 'milestone-item';

      const elId = `ms-${category.replace(/\W/g, '')}-${i}`;
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.id = elId;
      cb.checked = checked.has(`${category}::${i}`);

      cb.addEventListener('change', () => {
        toggleMilestone(visitId, category, i, cb.checked);
      });

      const label = document.createElement('label');
      label.htmlFor = elId;
      label.textContent = item;

      row.appendChild(cb);
      row.appendChild(label);
      group.appendChild(row);
    });

    card.appendChild(group);
  }

  return card;
}

function renderQuestions(visit) {
  const card = createCard('Your Questions & Notes', '📝');
  card.classList.add('questions-card');

  // Saved-locally indicator
  const savedNote = document.createElement('div');
  savedNote.className = 'questions-saved-note';
  savedNote.innerHTML = '&#128274; Your notes are saved in this browser and will be here when you come back.';
  card.appendChild(savedNote);

  const listEl = document.createElement('div');
  listEl.id = 'questions-list';
  card.appendChild(listEl);

  function refresh() {
    listEl.innerHTML = '';
    const questions = loadQuestions(visit.id, visit.suggestedQuestions);

    questions.forEach(q => {
      const row = document.createElement('div');
      row.className = 'question-item';

      const text = document.createElement('span');
      text.className = 'question-text' + (q.isCustom ? ' custom' : '');
      text.textContent = q.text;

      const btn = document.createElement('button');
      btn.className = 'btn-delete-q';
      btn.innerHTML = '×';
      btn.title = 'Remove question';
      btn.addEventListener('click', () => {
        if (q.isCustom) {
          deleteCustom(visit.id, q.customIndex);
        } else {
          deleteSuggested(visit.id, q.index);
        }
        refresh();
      });

      row.appendChild(text);
      row.appendChild(btn);
      listEl.appendChild(row);
    });
  }

  refresh();

  // Add question form
  const addForm = document.createElement('div');
  addForm.className = 'question-add';
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Add your own question…';
  const addBtn = document.createElement('button');
  addBtn.textContent = 'Add';

  function handleAdd() {
    const text = input.value.trim();
    if (!text) return;
    addQuestion(visit.id, text);
    input.value = '';
    refresh();
  }

  addBtn.addEventListener('click', handleAdd);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') handleAdd();
  });

  addForm.appendChild(input);
  addForm.appendChild(addBtn);
  card.appendChild(addForm);

  // Restore defaults button
  const restoreBtn = document.createElement('button');
  restoreBtn.className = 'btn-restore';
  restoreBtn.textContent = 'Restore default questions';
  restoreBtn.addEventListener('click', () => {
    restoreDefaults(visit.id);
    refresh();
  });
  card.appendChild(restoreBtn);

  return card;
}

function renderArticles(articles) {
  const card = createCard('Recommended Reading', '📚');

  articles.forEach(a => {
    const link = document.createElement('a');
    link.className = 'article-link';
    link.href = a.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = a.title;
    card.appendChild(link);
  });

  return card;
}

function createCard(title, icon) {
  const card = document.createElement('div');
  card.className = 'prep-card';

  const h3 = document.createElement('h3');
  h3.className = 'prep-card__title';
  h3.innerHTML = `<span class="prep-card__icon">${icon}</span> ${title}`;
  card.appendChild(h3);

  return card;
}
