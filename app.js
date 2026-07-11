const controls = [
  { code: 'LD-01', category: 'Leadership', title: 'Safety policy & commitment', desc: 'Signed policy and visible leadership commitment.', status: 'complete', label: 'Compliant' },
  { code: 'RA-02', category: 'Risk assessment', title: 'Hazard identification', desc: 'Routine and non-routine hazards are assessed.', status: 'complete', label: 'Compliant' },
  { code: 'TR-03', category: 'Training', title: 'Worker competency', desc: 'Training records demonstrate role competency.', status: 'finding', label: 'Finding' },
  { code: 'EM-04', category: 'Emergency response', title: 'Emergency action plan', desc: 'A written plan is maintained and tested.', status: 'progress', label: 'In progress', active: true },
  { code: 'IN-05', category: 'Incident management', title: 'Incident investigation', desc: 'Root causes and corrective actions are documented.', status: 'pending', label: 'Not started' },
  { code: 'EQ-06', category: 'Equipment safety', title: 'Preventive maintenance', desc: 'Critical equipment is inspected and maintained.', status: 'pending', label: 'Not started' },
  { code: 'CH-07', category: 'Chemical safety', title: 'Hazard communication', desc: 'Labels and safety data sheets are accessible.', status: 'pending', label: 'Not started' }
];

const list = document.getElementById('controlList');
const detail = {
  code: document.getElementById('detailCode'), category: document.getElementById('detailCategory'),
  title: document.getElementById('detailTitle'), description: document.getElementById('detailDescription'),
  requirement: document.getElementById('detailRequirement'), status: document.getElementById('detailStatus')
};
let selected = controls.findIndex(c => c.active);
let decision = 'finding';

function renderControls() {
  list.innerHTML = controls.map((c, i) => `
    <div class="control-item ${c.status} ${i === selected ? 'active' : ''}" data-index="${i}" tabindex="0" role="button">
      <span class="control-check">${c.status === 'complete' ? '✓' : c.status === 'finding' ? '!' : c.code.split('-')[1]}</span>
      <div class="control-copy"><small>${c.code} · ${c.category.toUpperCase()}</small><strong>${c.title}</strong><p>${c.desc}</p></div>
      <span class="control-status ${c.status}">${c.label}</span>
    </div>`).join('');
  list.querySelectorAll('.control-item').forEach(item => {
    const activate = () => selectControl(Number(item.dataset.index));
    item.addEventListener('click', activate);
    item.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') activate(); });
  });
}

function selectControl(index) {
  selected = index;
  const c = controls[index];
  detail.code.textContent = c.code;
  detail.category.textContent = c.category.toUpperCase();
  detail.title.textContent = c.title;
  detail.description.textContent = c.desc;
  detail.requirement.textContent = `Verify ${c.title.toLowerCase()} is documented, current, communicated to affected workers, and supported by objective evidence.`;
  detail.status.textContent = c.label;
  detail.status.className = `status-pill ${c.status}`;
  document.getElementById('reviewNotes').value = c.status === 'progress' ? 'Plan is current. Night-shift accountability procedure needs confirmation.' : '';
  document.querySelector('.review-panel').classList.remove('closed');
  renderControls();
}

document.querySelectorAll('[data-decision]').forEach(button => button.addEventListener('click', () => {
  decision = button.dataset.decision;
  document.querySelectorAll('[data-decision]').forEach(b => b.classList.toggle('selected', b === button));
}));

function toast(message) {
  const el = document.getElementById('toast');
  el.textContent = message; el.classList.add('show');
  clearTimeout(window.toastTimer); window.toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}

document.getElementById('completeReview').addEventListener('click', () => {
  const c = controls[selected];
  c.status = decision === 'compliant' ? 'complete' : decision === 'finding' ? 'finding' : 'complete';
  c.label = decision === 'compliant' ? 'Compliant' : decision === 'finding' ? 'Finding' : 'N/A';
  detail.status.textContent = c.label; detail.status.className = `status-pill ${c.status}`;
  const completed = controls.filter(x => x.status === 'complete' || x.status === 'finding').length;
  document.getElementById('reviewedCount').textContent = Math.min(25, 15 + completed);
  document.getElementById('findingCount').textContent = 4 + controls.filter(x => x.status === 'finding').length;
  document.getElementById('readinessScore').textContent = `${Math.round(((15 + completed) / 25) * 100)}%`;
  renderControls(); toast(`${c.code} review completed`);
});
document.getElementById('saveDraft').addEventListener('click', () => toast('Draft saved locally'));
document.getElementById('closeReview').addEventListener('click', () => document.querySelector('.review-panel').classList.add('closed'));
document.getElementById('addEvidence').addEventListener('click', () => {
  const item = document.createElement('div'); item.className = 'evidence-item';
  item.innerHTML = '<span class="file-icon doc">NEW</span><div><strong>Supporting_evidence.docx</strong><small>Ready to upload · Just now</small></div><button type="button">•••</button>';
  document.getElementById('evidenceList').appendChild(item); toast('Evidence placeholder added');
});
document.getElementById('exportBtn').addEventListener('click', () => {
  const summary = `CERTIFICATION REVIEW\nNorthstar Manufacturing\nReview: SC-2026-014\nReadiness: ${document.getElementById('readinessScore').textContent}\nOpen findings: ${document.getElementById('findingCount').textContent}\n\n${controls.map(c => `${c.code} | ${c.title} | ${c.label}`).join('\n')}`;
  const blob = new Blob([summary], {type: 'text/plain'}); const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'SC-2026-014-review.txt'; a.click(); URL.revokeObjectURL(url); toast('Review exported');
});

renderControls();
