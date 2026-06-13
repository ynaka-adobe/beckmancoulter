/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-product.
 * Base block: carousel.
 * Source URL: https://www.beckmancoulter.com/
 * Generated: 2026-06-13
 *
 * Target structure (per blocks/carousel-product/carousel-product.js decorator):
 * one row per slide, each row has two columns:
 *   - column 0: slide image (carousel-product-slide-image)
 *   - column 1: slide content/title link (carousel-product-slide-content)
 *
 * Source structure: an owl-carousel where each slide is `.owl-item > .item`.
 * Each slide has:
 *   - image link: `a.product-slider-img > img`
 *   - title/link: `.subheading a.product-slider-img-link` wrapping an `<h5>`
 * One slide is a vidyard video instead of an image link; for those we fall back
 * to the embedded poster image (`img.vidyard-player-embed` / any iframe poster).
 */
export default function parse(element, { document }) {
  const cells = [];

  // Each slide is the inner `.item` of an `.owl-item`. Use `.item` directly so
  // we never double-count the wrapping `.owl-item`.
  const slides = element.querySelectorAll('.owl-stage .item, .owl-item .item');
  const seen = new Set();

  slides.forEach((slide) => {
    if (seen.has(slide)) return;
    seen.add(slide);

    // --- Image (column 0) ---
    // Primary: dedicated image link `a.product-slider-img > img`.
    // Fallbacks: any direct image, or a video poster image for video slides.
    let image = slide.querySelector('a.product-slider-img img, img.product-slider-img');
    if (!image) {
      image = slide.querySelector('.vidyard-player-embed, .vidyard-player-container img, img');
    }

    // --- Title / link (column 1) ---
    // The clickable title lives in `.subheading > a.product-slider-img-link`,
    // which wraps an `<h5>`. Prefer the anchor so the link is preserved.
    const titleLink = slide.querySelector('.subheading a.product-slider-img-link');
    const heading = slide.querySelector('.subheading h5, .subheading h1, .subheading h2, .subheading h3, .subheading h4, .subheading h6');

    const contentCell = [];
    if (titleLink) {
      contentCell.push(titleLink);
    } else if (heading) {
      contentCell.push(heading);
    }

    // Only emit a slide row if it has at least an image or title content.
    if (!image && contentCell.length === 0) return;

    cells.push([image || '', contentCell.length ? contentCell : '']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-product', cells });
  element.replaceWith(block);
}
