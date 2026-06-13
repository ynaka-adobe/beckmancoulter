/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-feature. Base block: columns.
 * Source: https://www.beckmancoulter.com/
 * Generated: 2026-06-13
 *
 * Handles three distinct column-based layouts that all map to the AEM columns
 * block (first row = block name, subsequent rows = one cell per column):
 *   1. .quick-links                  -> horizontal bar of icon + label links;
 *                                       each link becomes its own column.
 *   2. .social-proof-card            -> two-column media showcase row: text
 *                                       content (heading + paragraphs + CTA)
 *                                       alongside a video/media thumbnail.
 *   3. .adjustable-two-column-display -> alternating feature row: heading +
 *                                       paragraph + "Learn more" button beside
 *                                       an image (image/content order varies).
 */
export default function parse(element, { document }) {
  const cells = [];

  // ---------------------------------------------------------------------------
  // Layout 1: quick-links horizontal bar (icon + label links)
  // Source: <div class="quick-links"><a><em class="lnr ..."></em><br>Label</a>...</div>
  // ---------------------------------------------------------------------------
  if (element.matches('.quick-links') || element.classList.contains('quick-links')) {
    const links = Array.from(element.querySelectorAll(':scope > a, a'));
    // Each quick link becomes its own column in a single row.
    if (links.length) {
      cells.push(links.map((link) => link));
    }
  } else if (
    element.matches('.social-proof-card')
    || element.classList.contains('social-proof-card')
  ) {
    // -------------------------------------------------------------------------
    // Layout 2: media-showcase two-column row (text + video thumbnail)
    // Source: .social-proof-card > .content-container > .image + .content
    // -------------------------------------------------------------------------
    // Media column: prefer the explicit thumbnail/media link so we don't pull
    // in placeholder "Empty heading" markup that lives in the content column.
    const mediaCol = element.querySelector('.image a.media-link-image, .image a[class*="media"], .image picture, .image img, .image')
      || element.querySelector('picture, img');
    const contentEl = element.querySelector('.content.lazyload-child, .content, [class*="content"]:not(.content-container)');

    const textCell = [];
    if (contentEl) {
      // Heading: keep only real headings, skip placeholder "Empty heading" markup.
      const heading = contentEl.querySelector('h1, h2, h3, h4, [class*="title"]');
      if (heading && heading.textContent.replace(/\s+/g, ' ').trim()
        && !/^empty heading$/i.test(heading.textContent.trim())) {
        textCell.push(heading);
      }
      // Body paragraphs with real text.
      const paragraphs = Array.from(contentEl.querySelectorAll(':scope > p, p'))
        .filter((p) => p.textContent.replace(/\s+/g, ' ').trim().length > 0);
      paragraphs.forEach((p) => textCell.push(p));
      // CTA / "Learn more" button.
      const cta = contentEl.querySelector('a.btn-cta, a.button, a[class*="button"]');
      if (cta) textCell.push(cta);
    }

    const row = [];
    row.push(textCell.length ? textCell : '');
    if (mediaCol) row.push(mediaCol);
    cells.push(row);
  } else {
    // -------------------------------------------------------------------------
    // Layout 3: adjustable-two-column-display feature row (content + image),
    // order can be reversed. Source:
    //   .adjustable-two-column-display > .content-container >
    //       .adjustable-two-column-display-content (h2 + p + a.button)
    //       .adjustable-two-column-display-image (img)
    // -------------------------------------------------------------------------
    const contentEl = element.querySelector('.adjustable-two-column-display-content, [class*="display-content"]');
    const imageEl = element.querySelector('.adjustable-two-column-display-image, [class*="display-image"]');

    const contentCell = [];
    if (contentEl) {
      const heading = contentEl.querySelector('h1, h2, h3, h4');
      if (heading) contentCell.push(heading);
      Array.from(contentEl.querySelectorAll('p'))
        .filter((p) => p.textContent.replace(/\s+/g, ' ').trim().length > 0)
        .forEach((p) => contentCell.push(p));
      const cta = contentEl.querySelector('a.button, a[class*="button"], a.btn-cta');
      if (cta) contentCell.push(cta);
    }

    const imageCell = imageEl
      ? (imageEl.querySelector('picture, img') || imageEl)
      : null;

    // Preserve the visual left-to-right order of the two columns from source.
    const container = element.querySelector('.content-container') || element;
    const orderedChildren = Array.from(container.children);
    const contentIndex = contentEl ? orderedChildren.indexOf(contentEl) : -1;
    const imageIndex = imageEl ? orderedChildren.indexOf(imageEl) : -1;

    const row = [];
    if (imageIndex > -1 && imageIndex < contentIndex) {
      if (imageCell) row.push(imageCell);
      row.push(contentCell.length ? contentCell : '');
    } else {
      row.push(contentCell.length ? contentCell : '');
      if (imageCell) row.push(imageCell);
    }
    cells.push(row);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-feature', cells });
  element.replaceWith(block);
}
