/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Beckman Coulter section breaks and section metadata.
 *
 * Driven by payload.template.sections from page-templates.json. For each
 * section (processed in reverse so DOM insertion does not shift later
 * sections):
 *   - If the section has a `style`, insert a "Section Metadata" block after
 *     the section element.
 *   - For every non-first section, insert an <hr> section break before the
 *     section element.
 *
 * Section selectors come from the template (which sourced them from the
 * captured DOM in migration-work/cleaned.html):
 *   .video-hero-carousel, .social-proof-section, .adjustable-two-column-display,
 *   .product-slider-carousel, .sublayout-two-column-dynamic, .sublayout.col-3-default-padding
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

export default function transform(hookName, element, payload) {
  if (hookName !== TransformHook.afterTransform) return;

  const template = payload && payload.template;
  const sections = template && Array.isArray(template.sections) ? template.sections : [];
  if (sections.length < 2) return;

  const doc = element.ownerDocument;

  // Process in reverse so inserting nodes does not disturb earlier matches.
  for (let i = sections.length - 1; i >= 0; i -= 1) {
    const section = sections[i];
    if (!section || !section.selector) continue;

    const target = element.querySelector(section.selector);
    if (!target) continue;

    // Section Metadata block (only when a style is defined for the section).
    if (section.style) {
      const metadataBlock = WebImporter.Blocks.createBlock(doc, {
        name: 'Section Metadata',
        cells: {
          style: section.style,
        },
      });
      target.after(metadataBlock);
    }

    // Section break before every section except the first.
    if (i > 0) {
      target.before(doc.createElement('hr'));
    }
  }
}
