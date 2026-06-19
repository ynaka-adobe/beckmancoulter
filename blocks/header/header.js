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

const COUNTRIES = [
  ['United States', 'us'], ['Canada', 'ca'], ['United Kingdom', 'gb'],
  ['Australia', 'au'], ['Germany', 'de'], ['France', 'fr'], ['Japan', 'jp'],
  ['China', 'cn'], ['Brazil', 'br'], ['Mexico', 'mx'], ['India', 'in'],
  ['South Korea', 'kr'], ['Italy', 'it'], ['Spain', 'es'], ['Netherlands', 'nl'],
  ['Sweden', 'se'], ['Switzerland', 'ch'], ['Belgium', 'be'], ['Austria', 'at'],
  ['Singapore', 'sg'], ['Hong Kong', 'hk'], ['New Zealand', 'nz'],
  ['Denmark', 'dk'], ['Norway', 'no'], ['Finland', 'fi'], ['Poland', 'pl'],
  ['Czech Republic', 'cz'], ['Portugal', 'pt'], ['Argentina', 'ar'],
  ['Colombia', 'co'], ['Chile', 'cl'], ['South Africa', 'za'],
  ['United Arab Emirates', 'ae'], ['Israel', 'il'], ['Turkey', 'tr'],
  ['Russia', 'ru'], ['Taiwan', 'tw'], ['Thailand', 'th'], ['Malaysia', 'my'],
  ['Indonesia', 'id'], ['Philippines', 'ph'], ['Vietnam', 'vn'],
];

const LANGUAGES = [
  ['English', 'en'], ['French', 'fr'], ['German', 'de'], ['Spanish', 'es'],
  ['Italian', 'it'], ['Portuguese', 'pt'], ['Dutch', 'nl'], ['Swedish', 'sv'],
  ['Danish', 'da'], ['Norwegian', 'no'], ['Finnish', 'fi'], ['Polish', 'pl'],
  ['Czech', 'cs'], ['Russian', 'ru'], ['Japanese', 'ja'], ['Chinese (Simplified)', 'zh-cn'],
  ['Chinese (Traditional)', 'zh-tw'], ['Korean', 'ko'], ['Arabic', 'ar'],
  ['Turkish', 'tr'], ['Thai', 'th'], ['Vietnamese', 'vi'], ['Indonesian', 'id'],
];

function buildLocaleModal() {
  const overlay = document.createElement('div');
  overlay.className = 'locale-modal-overlay';
  overlay.setAttribute('aria-hidden', 'true');

  const modal = document.createElement('div');
  modal.className = 'locale-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'locale-modal-title');

  const closeBtn = document.createElement('button');
  closeBtn.className = 'locale-modal-close';
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.innerHTML = '&times;';

  const title = document.createElement('h2');
  title.id = 'locale-modal-title';
  title.textContent = 'Choose your country/region and language';

  const desc = document.createElement('p');
  desc.textContent = 'Your experience may change as only information for the country or region you select will be presented.';

  const countryLabel = document.createElement('label');
  countryLabel.setAttribute('for', 'locale-country');
  countryLabel.textContent = 'Country or Region';

  const countrySelect = document.createElement('select');
  countrySelect.id = 'locale-country';
  COUNTRIES.forEach(([name]) => {
    const opt = document.createElement('option');
    opt.value = name.toLowerCase().replace(/\s+/g, '-');
    opt.textContent = name;
    if (name === 'United States') opt.selected = true;
    countrySelect.append(opt);
  });

  const langLabel = document.createElement('label');
  langLabel.setAttribute('for', 'locale-language');
  langLabel.textContent = 'Language';

  const langSelect = document.createElement('select');
  langSelect.id = 'locale-language';
  LANGUAGES.forEach(([name]) => {
    const opt = document.createElement('option');
    opt.value = name.toLowerCase().replace(/\s+/g, '-');
    opt.textContent = name;
    if (name === 'English') opt.selected = true;
    langSelect.append(opt);
  });

  const enterBtn = document.createElement('button');
  enterBtn.className = 'locale-modal-enter';
  enterBtn.textContent = 'Enter';

  modal.append(closeBtn, title, desc, countryLabel, countrySelect, langLabel, langSelect, enterBtn);
  overlay.append(modal);

  const close = () => {
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  window.addEventListener('keydown', (e) => { if (e.code === 'Escape') close(); });

  enterBtn.addEventListener('click', () => {
    close();
  });

  return { overlay, open: () => {
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    countrySelect.focus();
  } };
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

  // decorateButtons (run by decorateMain) turns <p><a> patterns into .button /
  // .button-container — strip those classes so nav links render as plain text.
  nav.querySelectorAll('a.button, a.button-primary, a.button-secondary').forEach((a) => {
    a.classList.remove('button', 'button-primary', 'button-secondary');
  });
  nav.querySelectorAll('.button-container').forEach((p) => {
    p.classList.remove('button-container');
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

    // find the locale li — either one already containing a flag img, or the
    // plain-text "English" / "Language" item produced by the nav document
    let localeLi = null;
    navTools.querySelectorAll(':scope > ul > li').forEach((li) => {
      if (li.querySelector('a img')) {
        li.classList.add('nav-locale');
        localeLi = li;
      } else if (/english|language/i.test(li.textContent.trim())) {
        li.classList.add('nav-locale');
        localeLi = li;
      }
    });

    // if the locale li has no <a> yet (plain <p> text), replace with a proper link
    if (localeLi && !localeLi.querySelector('a')) {
      const label = localeLi.textContent.trim() || 'English';
      localeLi.textContent = '';
      const link = document.createElement('a');
      link.href = '#';
      link.setAttribute('aria-label', `${label} — change country/language`);

      const flag = document.createElement('img');
      flag.src = 'https://flagcdn.com/20x15/us.png';
      flag.width = 20;
      flag.height = 15;
      flag.alt = 'US flag';
      flag.className = 'nav-locale-flag';

      const text = document.createElement('span');
      text.textContent = label;

      link.append(flag, text);
      localeLi.append(link);
    }

    // build locale modal and wire to the locale li
    const { overlay, open } = buildLocaleModal();
    document.body.append(overlay);
    if (localeLi) {
      localeLi.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        open();
      });
    }
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
