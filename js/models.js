/* ========================================
   3D Models — Data-driven rendering
   Separates model data from HTML markup for
   easier maintenance. Update the array below
   to add/remove/reorder models.
   ======================================== */

const MODELS = [
  {
    title: 'Clip for RatRig V-core 4 (sleeved PTFE)',
    desc: 'Clip for pinning sleeved cables and sleeved PTFE tube to the frame.',
    url: 'https://www.printables.com/model/1084955-clip-for-ratrig-v-core-4-remixed-sleeved-ptfe',
    image: 'https://media.printables.com/media/prints/1084955/images/8230416_fc3fc8ff-311f-49a4-b2a9-76edce64af6d_aa6bca77-50b5-45e4-a706-3f6c67ed17a2/thumbs/inside/640x480/png/2.webp',
    category: 'ratrig',
    tag: { label: 'Rat Rig V-Core 4', className: 'showcase-tag--ratrig' },
    stats: { downloads: 18, likes: 87, collections: 35 },
  },
  {
    title: 'Orbitool O2S Mount',
    desc: 'Mount for Orbitool O2S toolboard paired with Rat Rig V-Core 4. Features ziptie loops and iterative improvements.',
    url: 'https://www.printables.com/model/1420726-orbitool-o2s-mount-for-ratrig-v-core-4',
    image: 'https://media.printables.com/media/prints/cfaeb3a2-2dcf-4a47-8d62-86895e490e71/images/10777640_05ce3206-0576-4859-8f00-6825fc5063b2_de3305c4-a84b-4db5-97e2-dfdec202502c/thumbs/inside/640x480/png/screenshot-2025-09-29-165046.webp',
    category: 'ratrig',
    tag: { label: 'Rat Rig V-Core 4', className: 'showcase-tag--ratrig' },
    stats: { downloads: 4, likes: 16, collections: 7 },
  },
  {
    title: 'Manta M8P 2.0 Mounting Bracket',
    desc: 'Bracket for mounting the BTT Manta M8P 2.0 board to the electronics enclosure. Remixed from official Rat Rig files.',
    url: 'https://www.printables.com/model/1223982-manta-m8p-20-mounting-bracket-for-rat-rig-v-core-4',
    image: 'https://media.printables.com/media/prints/1223982/images/9176811_9e8dfdbd-dfd0-4815-8b57-00d272dbf257_2eb2d348-6cef-4ab3-8e23-7e6637440f23/thumbs/inside/640x480/png/screenshot-2025-03-10-044823.webp',
    category: 'ratrig',
    tag: { label: 'Rat Rig V-Core 4', className: 'showcase-tag--ratrig' },
    stats: { downloads: 4, likes: 13, collections: 3 },
  },
  {
    title: 'Bear Upgrade LED Light Bar (10mm Z rods)',
    desc: 'Remix of the Bear Upgrade LED light bar adapted for 10mm Z-axis rods on Prusa i3 MK2/MK3.',
    url: 'https://www.printables.com/model/552422-bear-upgrade-led-light-bar-10mm-z-axis-rods-prusa-',
    image: 'https://media.printables.com/media/prints/552422/images/4435428_e8af6fb9-8c2d-4a68-948f-6de602dd65c8/thumbs/inside/640x480/jpg/pxl_20230813_215412532.webp',
    category: 'prusa',
    tag: { label: 'Prusa', className: 'showcase-tag--prusa' },
    stats: { downloads: 8, likes: 27, collections: 8 },
  },
];

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function buildModelCard(model) {
  const card = document.createElement('a');
  card.href = model.url;
  card.target = '_blank';
  card.rel = 'noopener';
  card.className = 'showcase-card';
  card.dataset.category = model.category;
  card.tabIndex = 0;

  const { downloads, likes, collections } = model.stats;

  card.innerHTML = `
    <div class="showcase-card-img">
      <img src="${escapeHtml(model.image)}"
           alt="${escapeHtml(model.title)}" loading="lazy">
    </div>
    <div class="showcase-card-body">
      <span class="showcase-tag ${model.tag.className}">${escapeHtml(model.tag.label)}</span>
      <h3 class="showcase-card-title">${escapeHtml(model.title)}</h3>
      <p class="showcase-card-desc">${escapeHtml(model.desc)}</p>
      <div class="showcase-card-stats">
        <span><i class="fa-solid fa-download"></i> ${downloads}</span>
        <span><i class="fa-solid fa-heart"></i> ${likes}</span>
        <span><i class="fa-solid fa-layer-group"></i> ${collections} collections</span>
      </div>
    </div>
    <span class="showcase-card-cta">View on Printables <i class="fa-solid fa-arrow-up-right-from-square"></i></span>
  `;

  return card;
}

function initModels() {
  const grid = document.getElementById('modelsGrid');
  if (!grid) return;

  grid.innerHTML = '';
  MODELS.forEach((model) => {
    grid.appendChild(buildModelCard(model));
  });

  // Initialize filter chips on the rendered cards
  initFilterChips();
}

/* Script loaded with defer — DOM is ready */
initModels();
