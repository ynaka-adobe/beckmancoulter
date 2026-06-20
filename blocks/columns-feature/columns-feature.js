const QUICK_LINK_ICONS = {
  'safety-data-sheets': `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M6 17H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1v2"/>
    <rect x="6" y="7" width="14" height="14" rx="1"/>
    <line x1="10" y1="11" x2="16" y2="11"/><line x1="10" y1="14" x2="16" y2="14"/><line x1="10" y1="17" x2="14" y2="17"/>
  </svg>`,
  webinar: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <rect x="2" y="3" width="20" height="13" rx="2"/>
    <path d="M8 21h8M12 16v5"/>
    <polyline points="9 9 12 6 15 9"/>
    <line x1="12" y1="6" x2="12" y2="13"/>
  </svg>`,
  blog: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <rect x="2" y="3" width="20" height="14" rx="2"/>
    <line x1="8" y1="21" x2="16" y2="21"/>
    <line x1="12" y1="17" x2="12" y2="21"/>
  </svg>`,
  event: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
    <line x1="8" y1="14" x2="8" y2="14"/><line x1="12" y1="14" x2="12" y2="14"/><line x1="16" y1="14" x2="16" y2="14"/>
    <line x1="8" y1="18" x2="8" y2="18"/><line x1="12" y1="18" x2="12" y2="18"/>
  </svg>`,
  order: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="9 12 11 14 15 10"/>
  </svg>`,
};

function getIcon(href) {
  const h = href.toLowerCase();
  if (h.includes('safety-data') || h.includes('sds')) return QUICK_LINK_ICONS['safety-data-sheets'];
  if (h.includes('webinar')) return QUICK_LINK_ICONS.webinar;
  if (h.includes('blog')) return QUICK_LINK_ICONS.blog;
  if (h.includes('event')) return QUICK_LINK_ICONS.event;
  if (h.includes('order')) return QUICK_LINK_ICONS.order;
  return null;
}

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-feature-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          picWrapper.classList.add('columns-feature-img-col');
        }
      }
    });
  });

  // quick-links variant: also mark the wrapper for full-bleed CSS
  if (cols.length >= 5) {
    block.closest('.columns-feature-wrapper')?.classList.add('columns-feature-5-cols');
  }

  // inject icons for the quick-links (5-col) variant
  if (cols.length >= 5) {
    [...block.firstElementChild.children].forEach((col) => {
      const link = col.querySelector('a');
      if (!link) return;
      const svg = getIcon(link.getAttribute('href') || '');
      if (svg) {
        const iconWrap = document.createElement('span');
        iconWrap.className = 'columns-feature-icon';
        iconWrap.innerHTML = svg;
        link.prepend(iconWrap);
      }
    });
  }
}
