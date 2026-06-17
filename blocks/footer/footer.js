import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // dual-fetch: localhost / aem up first, then DA/EDS production path
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  let fragment = await loadFragment('/content/footer');
  if (!fragment || !fragment.firstElementChild) {
    fragment = await loadFragment(footerPath);
  }

  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  // loadFragment runs decorateMain/loadSections, which wraps each top-level div as
  // `.section > .default-content-wrapper`. Unwrap so lists/images are direct children
  // again (CSS relies on direct-child selectors).
  footer.querySelectorAll(':scope > div').forEach((section) => {
    const wrapper = section.querySelector(':scope > .default-content-wrapper');
    if (wrapper) {
      while (wrapper.firstChild) section.insertBefore(wrapper.firstChild, wrapper);
      wrapper.remove();
    }
  });

  // tag sections in fragment order: trustmark, link columns + social, legal
  const classes = ['trustmark', 'links', 'legal'];
  classes.forEach((c, i) => {
    const section = footer.children[i];
    if (section) section.classList.add(`footer-${c}`);
  });

  // mark the social-icons list (the one whose links contain images)
  const linksSection = footer.querySelector('.footer-links');
  if (linksSection) {
    linksSection.querySelectorAll(':scope > ul').forEach((ul) => {
      if (ul.querySelector('a img')) ul.classList.add('footer-social');
    });
  }

  block.append(footer);
}
