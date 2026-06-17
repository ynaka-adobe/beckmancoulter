import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates desktop width
const isDesktop = window.matchMedia('(min-width: 900px)');

function closeAllDropdowns(scope) {
  scope.querySelectorAll('.nav-drop[aria-expanded="true"]').forEach((d) => {
    d.setAttribute('aria-expanded', 'false');
  });
}

function toggleDrop(li, force) {
  const expanded = force !== undefined ? force : li.getAttribute('aria-expanded') !== 'true';
  if (expanded) {
    closeAllDropdowns(li.closest('ul'));
  }
  li.setAttribute('aria-expanded', expanded ? 'true' : 'false');
}

/**
 * Decorate a list-based nav section: mark items with nested <ul> as dropdowns
 * and wire hover (desktop) + click (mobile/touch) behavior.
 * @param {Element} section the nav section wrapper
 */
function decorateDropdowns(section) {
  const topItems = section.querySelectorAll(':scope > ul > li');
  topItems.forEach((li) => {
    const submenu = li.querySelector(':scope > ul');
    if (!submenu) return;
    li.classList.add('nav-drop');
    li.setAttribute('aria-expanded', 'false');

    // desktop: open on hover
    li.addEventListener('mouseenter', () => {
      if (isDesktop.matches) toggleDrop(li, true);
    });
    li.addEventListener('mouseleave', () => {
      if (isDesktop.matches) toggleDrop(li, false);
    });

    // mobile + keyboard: toggle on click of the top-level label
    const label = li.querySelector(':scope > a');
    if (label) {
      label.addEventListener('click', (e) => {
        if (!isDesktop.matches) {
          e.preventDefault();
          toggleDrop(li);
        }
      });
    }
  });
}

function buildSearch() {
  const wrapper = document.createElement('div');
  wrapper.className = 'nav-search';
  const form = document.createElement('form');
  form.setAttribute('role', 'search');
  form.action = 'https://www.beckmancoulter.com/en/search';
  form.method = 'get';
  const input = document.createElement('input');
  input.type = 'search';
  input.name = 'q';
  input.setAttribute('aria-label', 'Search');
  input.placeholder = 'Search by part number';
  const button = document.createElement('button');
  button.type = 'submit';
  button.setAttribute('aria-label', 'Submit search');
  button.className = 'nav-search-submit';
  form.append(input, button);
  wrapper.append(form);
  return wrapper;
}

/**
 * loads and decorates the header
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // dual-fetch: localhost / aem up first, then DA/EDS production path
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  let fragment = await loadFragment('/content/nav');
  if (!fragment || !fragment.firstElementChild) {
    fragment = await loadFragment(navPath);
  }

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  // loadFragment runs decorateMain/loadSections, which wraps each top-level div
  // as `.section > .default-content-wrapper`. Unwrap so the lists/images become
  // direct children again (CSS and dropdown tagging rely on direct-child selectors).
  nav.querySelectorAll(':scope > div').forEach((section) => {
    const wrapper = section.querySelector(':scope > .default-content-wrapper');
    if (wrapper) {
      while (wrapper.firstChild) section.insertBefore(wrapper.firstChild, wrapper);
      wrapper.remove();
    }
  });

  // sections in fragment order: brand, main-nav, tools
  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    decorateDropdowns(navSections);
    // append search to the main nav row
    navSections.append(buildSearch());
  }

  const navTools = nav.querySelector('.nav-tools');
  if (navTools) {
    decorateDropdowns(navTools);
    // tag locale entry (the one containing a flag image)
    navTools.querySelectorAll(':scope > ul > li > a img').forEach((img) => {
      img.closest('li')?.classList.add('nav-locale');
    });
  }

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  const hamburgerBtn = hamburger.querySelector('button');
  hamburgerBtn.addEventListener('click', () => {
    const expanded = nav.getAttribute('aria-expanded') === 'true';
    nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    hamburgerBtn.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
    document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  });

  const navBrand = nav.querySelector('.nav-brand');
  if (navBrand) navBrand.prepend(hamburger);
  else nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');

  // close menus / reset on viewport change
  isDesktop.addEventListener('change', () => {
    nav.setAttribute('aria-expanded', 'false');
    hamburgerBtn.setAttribute('aria-label', 'Open navigation');
    document.body.style.overflowY = '';
    closeAllDropdowns(nav);
  });

  // close desktop dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    if (isDesktop.matches && !nav.contains(e.target)) closeAllDropdowns(nav);
  });

  // close on escape
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') closeAllDropdowns(nav);
  });

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
