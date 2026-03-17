import { renderVisitPicker, renderVisitPrep } from './visits.js';
import { sharePrep, copyPrep, emailPrep } from './share.js';

let visits = [];
let currentVisit = null;

// ── Toast ──
function showToast(message, duration = 2000) {
  const el = document.getElementById('toast');
  el.textContent = message;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), duration);
}

// ── Screen management ──
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');

  const shareBar = document.getElementById('share-bar');
  if (id === 'screen-prep') {
    shareBar.classList.remove('hidden');
  } else {
    shareBar.classList.add('hidden');
  }

  window.scrollTo(0, 0);
}

function selectVisit(visit) {
  currentVisit = visit;
  renderVisitPrep(visit);
  showScreen('screen-prep');
}

// ── Init ──
async function init() {
  try {
    const resp = await fetch('data/visits.json');
    visits = await resp.json();
  } catch (e) {
    document.getElementById('app').innerHTML = '<p style="text-align:center;padding:40px;color:#e53e3e;">Failed to load visit data.</p>';
    return;
  }

  renderVisitPicker(visits, selectVisit);

  // Back button
  document.getElementById('btn-back').addEventListener('click', () => {
    currentVisit = null;
    showScreen('screen-picker');
  });

  // Share buttons
  document.getElementById('btn-share').addEventListener('click', async () => {
    if (!currentVisit) return;
    const shared = await sharePrep(currentVisit);
    if (!shared && !navigator.share) {
      // Fallback: copy instead
      try {
        await copyPrep(currentVisit);
        showToast('Copied to clipboard');
      } catch {
        showToast('Unable to share');
      }
    }
  });

  document.getElementById('btn-copy').addEventListener('click', async () => {
    if (!currentVisit) return;
    try {
      await copyPrep(currentVisit);
      showToast('Copied to clipboard!');
    } catch {
      showToast('Unable to copy');
    }
  });

  document.getElementById('btn-email').addEventListener('click', () => {
    if (!currentVisit) return;
    emailPrep(currentVisit);
  });

  // Hide native share button on desktop if Web Share API not available
  if (!navigator.share) {
    document.getElementById('btn-share').style.display = 'none';
  }
}

init();
