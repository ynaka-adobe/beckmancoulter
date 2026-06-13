/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-product. Base block: cards.
 * Source: https://www.beckmancoulter.com/
 * Generated: 2026-06-13
 *
 * Target structure (block-collection/cards): 2-column table.
 *   Row 1: block name.
 *   Each subsequent row = one card:
 *     - cell 1: image OR icon (mandatory)
 *     - cell 2: text content (title heading + description + CTA)
 *
 * This variant covers two distinct source structures, both mapped to cards-product:
 *   1. .sublayout-two-column-dynamic — two product feature cards in .column-1/.column-2,
 *      each a .showcase-teaser with: img, "NEW" badge (.card-tag span), h4 title, "Learn more" button.
 *   2. .sublayout.col-3-default-padding — three "Learning" cards (.ui.fluid.card),
 *      each with: icon (span.lnr), header link (.card-header-text), description (.card-content-text),
 *      and "Explore" link (.explore-link a).
 * The parser detects which structure the passed element matches and builds one row per card.
 */
export default function parse(element, { document }) {
  const cells = [];

  // --- Structure 1: product feature cards (.showcase-teaser inside .column-1/.column-2) ---
  const teasers = Array.from(element.querySelectorAll('.showcase-teaser'));

  // --- Structure 2: learning cards (.ui.fluid.card) ---
  const fluidCards = Array.from(element.querySelectorAll('.ui.fluid.card, .linear-icon-card'));

  if (teasers.length) {
    teasers.forEach((teaser) => {
      // Title — the h4 holds the real product title (h2 here is an empty placeholder).
      const title = teaser.querySelector('h4');
      const titleText = title ? title.textContent.replace(/\s+/g, ' ').trim() : '';

      // First cell: product image. The image is applied as a CSS background-image
      // on .showcase-teaser (no <img> element exists in the DOM), so extract the
      // URL from the inline style and build a real <img> for the cards block.
      let img = teaser.querySelector('img');
      if (!img) {
        const styleAttr = teaser.getAttribute('style') || '';
        const match = styleAttr.match(/url\((['"]?)(https?:[^'")]+)\1\)/i);
        if (match && match[2]) {
          img = document.createElement('img');
          img.setAttribute('src', match[2]);
        }
      }
      if (img && !img.getAttribute('alt')) {
        img.setAttribute('alt', titleText || 'card image');
      }

      // Second cell: NEW badge, title, CTA. Skip empty heading/paragraph placeholders.
      const textContent = [];

      // "NEW" badge — preserve as a paragraph so it renders as a card tag/eyebrow.
      const badge = teaser.querySelector('.card-tag span');
      if (badge && badge.textContent.trim()) {
        const badgeP = document.createElement('p');
        badgeP.textContent = badge.textContent.trim();
        textContent.push(badgeP);
      }

      // Title.
      if (titleText) {
        const heading = document.createElement('h3');
        heading.textContent = titleText;
        textContent.push(heading);
      }

      // CTA — "Learn more" button.
      const cta = teaser.querySelector('a.button, a[class*="button"], a[href]');
      if (cta && cta.textContent.trim()) textContent.push(cta);

      if (img || textContent.length) {
        cells.push([img, textContent]);
      }
    });
  } else if (fluidCards.length) {
    fluidCards.forEach((card) => {
      // First cell: icon (a span with the icon class). Preserve the element so its class survives.
      const icon = card.querySelector('span.lnr, [class*="lnr"], .ui.image span');

      // Second cell: title link, description, explore CTA.
      const textContent = [];

      const header = card.querySelector('.card-header-text, a.header');
      if (header && header.textContent.trim()) {
        const heading = document.createElement('h3');
        const headingLink = document.createElement('a');
        if (header.getAttribute('href')) headingLink.setAttribute('href', header.getAttribute('href'));
        headingLink.textContent = header.textContent.trim();
        heading.appendChild(headingLink);
        textContent.push(heading);
      }

      const desc = card.querySelector('.card-content-text p, .card-content-text');
      if (desc && desc.textContent.trim()) {
        const descP = document.createElement('p');
        descP.textContent = desc.textContent.trim();
        textContent.push(descP);
      }

      // Explore CTA link.
      const cta = card.querySelector('.explore-link a, a.btn-cta, .description a[href]');
      if (cta && cta.textContent.trim()) textContent.push(cta);

      if (icon || textContent.length) {
        cells.push([icon || '', textContent]);
      }
    });
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-product', cells });
  element.replaceWith(block);
}
