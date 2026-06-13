/**
 * hero-spotlight
 *
 * Full-bleed dark hero with a background video (or image) and an overlay
 * containing a heading, subtext, and a CTA button.
 *
 * Authored structure (.plain.html):
 *   .hero-spotlight
 *     > div > div > a[href$=".mp4"]      (row 1: background media link)
 *     > div > div > h5 + p + p>a         (row 2: overlay content)
 */

const VIDEO_EXT = /\.(mp4|webm|ogg|mov)(\?|$)/i;

function buildVideo(src) {
  const video = document.createElement('video');
  video.setAttribute('autoplay', '');
  video.setAttribute('muted', '');
  video.muted = true;
  video.setAttribute('loop', '');
  video.setAttribute('playsinline', '');
  video.setAttribute('preload', 'auto');
  const source = document.createElement('source');
  source.src = src;
  source.type = 'video/mp4';
  video.append(source);
  return video;
}

export default function decorate(block) {
  const rows = [...block.children];
  const mediaRow = rows[0];
  const contentRow = rows[1] || rows[0];

  // --- Row 1: background media (video or picture) ---
  let hasMedia = false;
  if (mediaRow) {
    const link = mediaRow.querySelector('a');
    const picture = mediaRow.querySelector('picture');

    if (link && VIDEO_EXT.test(link.getAttribute('href') || link.textContent)) {
      const src = link.getAttribute('href') || link.textContent.trim();
      const video = buildVideo(src);
      mediaRow.replaceChildren(video);
      mediaRow.classList.add('hero-spotlight-media');
      hasMedia = true;
    } else if (picture) {
      mediaRow.replaceChildren(picture);
      mediaRow.classList.add('hero-spotlight-media');
      hasMedia = true;
    }
  }

  // --- Row 2: overlay content ---
  if (contentRow && contentRow !== mediaRow) {
    const cell = contentRow.querySelector(':scope > div') || contentRow;
    cell.classList.add('hero-spotlight-content');
    contentRow.classList.add('hero-spotlight-overlay');
  }

  if (!hasMedia) {
    block.classList.add('no-image');
  }
}
