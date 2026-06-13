/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-spotlight.
 * Base block: hero
 * Source: https://www.beckmancoulter.com/ (.video-hero-carousel)
 * Generated: 2026-06-13
 *
 * Full-bleed video hero. Produces:
 *   Row 1: block name (hero-spotlight)
 *   Row 2: background media (video poster image; video source link preserved if present)
 *   Row 3: content (heading + location subtext + "Read more" CTA)
 */
export default function parse(element, { document }) {
  // --- Background media (optional) ---
  // Source uses a <video> with a poster <img> inside #video-tag-thumbnail.
  // EDS hero backgrounds are image-driven; prefer the poster image, and also
  // preserve the video source as a link when available.
  const posterImg = element.querySelector(
    '#video-tag-thumbnail img, .item-container img, img[class*="thumbnail"]'
  );
  const videoSource = element.querySelector(
    'video source[src], video[src]'
  );
  const videoSrc = videoSource
    ? videoSource.getAttribute('src') || videoSource.getAttribute('href')
    : null;

  // --- Heading (required) ---
  const heading = element.querySelector(
    '.banner-heading h5, .banner-heading h1, .banner-heading h2, .heading-container h1, .heading-container h2, [class*="banner-heading"] h1, [class*="banner-heading"] h2'
  );

  // --- Location / subtext (optional) ---
  const details = element.querySelector(
    '.banner-details p, .banner-details, [class*="banner-details"] p'
  );

  // --- CTA links (optional, may be multiple) ---
  const ctaLinks = Array.from(
    element.querySelectorAll(
      '.carousel-button-wrapper a[href], a.media-link-image[href], a.ui.button[href]'
    )
  ).filter((a) => a.getAttribute('href'));

  const cells = [];

  // Background media row
  const bgCell = [];
  if (posterImg) bgCell.push(posterImg);
  if (videoSrc) {
    const videoLink = document.createElement('a');
    videoLink.href = videoSrc;
    videoLink.textContent = videoSrc;
    bgCell.push(videoLink);
  }
  if (bgCell.length) cells.push([bgCell]);

  // Content row
  const contentCell = [];
  if (heading) contentCell.push(heading);
  if (details) contentCell.push(details);
  contentCell.push(...ctaLinks);
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'hero-spotlight',
    cells,
  });
  element.replaceWith(block);
}
