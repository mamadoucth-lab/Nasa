// ====== CONFIG: match these to your index.html ======
const API_URL = 'https://api.nasa.gov/planetary/apod';
const API_KEY = 'ww7QzHHG7jhCqkpFFcP6wcgqM9cwRkGqFBBddqFp';
const startInput = document.querySelector('#startDate');
const endInput = document.querySelector('#endDate');
const getButton = document.querySelector('.filters button');
const gallery = document.querySelector('#gallery');

// ====== LEVELUP: random space fact ======
const facts = [
  'A day on Venus is longer than its year.',
  'Neutron stars can spin over 600 times per second.',
  'Light from the Sun takes about 8 minutes to reach Earth.',
  'There are more stars in the universe than grains of sand on Earth.',
  'Saturn is less dense than water, so it would float in a big enough bathtub.',
  'The footprints on the Moon will last millions of years, since there is no wind.',
  'One teaspoon of a neutron star would weigh about a billion tons.',
  'Jupiter’s Great Red Spot is a storm that has raged for centuries.'
];

function showRandomFact() {
  const fact = facts[Math.floor(Math.random() * facts.length)];
  const box = document.createElement('div');
  box.className = 'space-fact';
  box.innerHTML = `<strong>🚀 Did You Know?</strong> ${fact}`;
  gallery.parentNode.insertBefore(box, gallery);
}

// ====== Modal (built in JS so no HTML changes needed) ======
const modal = document.createElement('div');
modal.className = 'modal';
modal.innerHTML = `
  <div class="modal-content" role="dialog" aria-modal="true">
    <button class="modal-close" aria-label="Close">&times;</button>
    <div class="modal-media"></div>
    <h2 class="modal-title"></h2>
    <p class="modal-date"></p>
    <p class="modal-explanation"></p>
  </div>`;
document.body.appendChild(modal);

const modalMedia = modal.querySelector('.modal-media');

function openModal(item) {
  if (item.media_type === 'image') {
    modalMedia.innerHTML = `<img src="${item.hdurl || item.url}" alt="${item.title}">`;
  } else if (item.url.includes('youtube.com/embed') || item.url.includes('player.vimeo.com')) {
    modalMedia.innerHTML = `<iframe src="${item.url}" title="${item.title}" allowfullscreen></iframe>`;
  } else {
    modalMedia.innerHTML = `<a href="${item.url}" target="_blank" rel="noopener">▶ Watch this video on NASA’s site</a>`;
  }
  modal.querySelector('.modal-title').textContent = item.title;
  modal.querySelector('.modal-date').textContent = item.date;
  modal.querySelector('.modal-explanation').textContent = item.explanation;
  modal.classList.add('open');
}

function closeModal() {
  modal.classList.remove('open');
  modalMedia.innerHTML = ''; // stops any playing video
}

modal.addEventListener('click', (e) => {
  if (e.target === modal || e.target.classList.contains('modal-close')) closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// ====== Gallery ======
function renderGallery(items) {
  gallery.innerHTML = '';
  if (!items.length) {
    gallery.innerHTML = '<p class="message">No space photos found for that range.</p>';
    return;
  }
  items.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'gallery-item';

    // Videos have a thumbnail_url only if requested with thumbs=true
    const thumb = item.media_type === 'image' ? item.url : item.thumbnail_url;
    const media = thumb
      ? `<img src="${thumb}" alt="${item.title}">`
      : `<div class="video-placeholder">🎬 Video</div>`;

    card.innerHTML = `
      ${media}
      <h3>${item.title}</h3>
      <p>${item.date}${item.media_type === 'video' ? ' · Video' : ''}</p>`;
    card.addEventListener('click', () => openModal(item));
    gallery.appendChild(card);
  });
}

async function fetchImages() {
  const start = startInput.value;
  const end = endInput.value;
  if (!start || !end) return;

  gallery.innerHTML = '<p class="message">🔄 Loading space photos…</p>';

  try {
    const url = `${API_URL}?api_key=${API_KEY}&start_date=${start}&end_date=${end}&thumbs=true`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`NASA API error (${res.status})`);
    const data = await res.json();
    renderGallery(Array.isArray(data) ? data.reverse() : [data]); // newest first
  } catch (err) {
    gallery.innerHTML = `<p class="message">⚠️ Couldn’t load photos. ${err.message}</p>`;
  }
}

getButton.addEventListener('click', fetchImages);
showRandomFact();
