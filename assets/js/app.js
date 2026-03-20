
const state = {
  filter: 'all',
  query: ''
};

const allItems = Array.isArray(window.GALLERY_ITEMS) ? window.GALLERY_ITEMS : [];
const pdfItems = allItems.filter(item => item.kind === 'pdf');
const imageItems = allItems.filter(item => item.kind === 'image');

const pdfGrid = document.querySelector('#pdf-grid');
const imageGrid = document.querySelector('#image-grid');
const pdfEmpty = document.querySelector('#pdf-empty');
const imageEmpty = document.querySelector('#image-empty');
const totalCountEls = document.querySelectorAll('.js-total-count');
const pdfCountEls = document.querySelectorAll('.js-pdf-count');
const imageCountEls = document.querySelectorAll('.js-image-count');
const searchInput = document.querySelector('#search-input');
const modal = document.querySelector('#preview-modal');
const modalTitle = document.querySelector('#modal-title');
const modalContent = document.querySelector('#modal-content');
const modalOpenBtn = document.querySelector('#modal-open-file');

function escapeHtml(text = '') {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function makeCard(item) {
  const card = document.createElement('article');
  card.className = 'card';
  card.dataset.kind = item.kind;
  card.dataset.title = item.title.toLowerCase();

  const subtext = item.kind === 'pdf'
    ? `Archivo PDF • ${item.pages || 1} página`
    : `Imagen optimizada para visualización web`;

  card.innerHTML = `
    <div class="card-media">
      <span class="badge">${item.kind === 'pdf' ? 'PDF' : 'FOTO'}</span>
      <img src="${item.preview}" alt="${escapeHtml(item.title)}" loading="lazy" decoding="async">
    </div>
    <div class="card-body">
      <h3 class="card-title">${escapeHtml(item.title)}</h3>
      <p class="card-sub">${escapeHtml(subtext)}</p>
      <div class="card-actions">
        <button class="btn btn-dark js-preview" data-id="${item.id}">${item.kind === 'pdf' ? 'Vista previa' : 'Ampliar'}</button>
        <a class="btn" href="${item.src}" target="_blank" rel="noopener">${item.kind === 'pdf' ? 'Abrir PDF' : 'Abrir imagen'}</a>
      </div>
    </div>
  `;
  return card;
}

function renderSection(grid, emptyState, items) {
  grid.innerHTML = '';
  if (!items.length) {
    emptyState.classList.remove('hidden');
    return;
  }
  emptyState.classList.add('hidden');
  const fragment = document.createDocumentFragment();
  items.forEach(item => fragment.appendChild(makeCard(item)));
  grid.appendChild(fragment);
}

function matchesSearch(item) {
  if (!state.query) return true;
  return item.title.toLowerCase().includes(state.query)
    || item.originalName.toLowerCase().includes(state.query);
}

function applyFilters() {
  const pdfFiltered = pdfItems.filter(item => matchesSearch(item) && (state.filter === 'all' || state.filter === 'pdf'));
  const imageFiltered = imageItems.filter(item => matchesSearch(item) && (state.filter === 'all' || state.filter === 'image'));

  renderSection(pdfGrid, pdfEmpty, pdfFiltered);
  renderSection(imageGrid, imageEmpty, imageFiltered);

  totalCountEls.forEach(el => el.textContent = pdfFiltered.length + imageFiltered.length);
  pdfCountEls.forEach(el => el.textContent = pdfFiltered.length);
  imageCountEls.forEach(el => el.textContent = imageFiltered.length);

  document.querySelector('#pdf-section-wrap').classList.toggle('hidden', state.filter === 'image');
  document.querySelector('#image-section-wrap').classList.toggle('hidden', state.filter === 'pdf');
}

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(el => el.classList.remove('active'));
    btn.classList.add('active');
    state.filter = btn.dataset.filter;
    applyFilters();
  });
});

searchInput.addEventListener('input', e => {
  state.query = e.target.value.trim().toLowerCase();
  applyFilters();
});

document.addEventListener('click', e => {
  const trigger = e.target.closest('.js-preview');
  if (!trigger) return;
  const item = allItems.find(entry => entry.id === trigger.dataset.id);
  if (!item) return;
  openModal(item);
});

function openModal(item) {
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  modalTitle.textContent = item.title;
  modalOpenBtn.href = item.src;
  modalOpenBtn.textContent = item.kind === 'pdf' ? 'Abrir PDF en pestaña nueva' : 'Abrir imagen en pestaña nueva';

  if (item.kind === 'pdf') {
    modalContent.innerHTML = `<iframe src="${item.src}#view=FitH" title="${escapeHtml(item.title)}"></iframe>`;
  } else {
    modalContent.innerHTML = `<img src="${item.src}" alt="${escapeHtml(item.title)}">`;
  }
}

function closeModal() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  modalContent.innerHTML = '';
}

document.querySelector('#modal-close').addEventListener('click', closeModal);
modal.addEventListener('click', e => {
  if (e.target === modal) closeModal();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
});

applyFilters();
