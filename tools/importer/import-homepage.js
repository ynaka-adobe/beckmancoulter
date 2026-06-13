/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import cardsProductParser from './parsers/cards-product.js';
import carouselProductParser from './parsers/carousel-product.js';
import columnsFeatureParser from './parsers/columns-feature.js';
import heroSpotlightParser from './parsers/hero-spotlight.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/beckmancoulter-cleanup.js';
import sectionsTransformer from './transformers/beckmancoulter-sections.js';

// PARSER REGISTRY
const parsers = {
  'cards-product': cardsProductParser,
  'carousel-product': carouselProductParser,
  'columns-feature': columnsFeatureParser,
  'hero-spotlight': heroSpotlightParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'homepage',
  description: 'Beckman Coulter homepage with hero, product highlights, and content sections',
  urls: ['https://www.beckmancoulter.com/'],
  blocks: [
    {
      name: 'hero-spotlight',
      instances: ['.video-hero-carousel'],
    },
    {
      name: 'columns-feature',
      instances: ['.quick-links', '.social-proof-card', '.adjustable-two-column-display'],
    },
    {
      name: 'carousel-product',
      instances: ['.product-slider-carousel'],
    },
    {
      name: 'cards-product',
      instances: ['.sublayout-two-column-dynamic', '.sublayout.col-3-default-padding'],
    },
    {
      name: 'section-carousel',
      instances: ['.product-slider-carousel'],
      section: 'navy-blue',
    },
  ],
  sections: [
    {
      id: 'section-1',
      name: 'Hero',
      selector: '.video-hero-carousel',
      style: null,
      blocks: ['hero-spotlight', 'columns-feature'],
      defaultContent: [],
    },
    {
      id: 'section-2',
      name: 'Intro & Media Showcase',
      selector: '.social-proof-section',
      style: null,
      blocks: ['columns-feature'],
      defaultContent: ['h2'],
    },
    {
      id: 'section-3',
      name: 'Feature Rows',
      selector: '.adjustable-two-column-display',
      style: null,
      blocks: ['columns-feature'],
      defaultContent: [],
    },
    {
      id: 'section-4',
      name: 'Comprehensive Diagnostic Solutions Carousel',
      selector: '.product-slider-carousel',
      style: 'navy-blue',
      blocks: ['carousel-product'],
      defaultContent: ['.carousel-heading', '.carousel-subheading'],
    },
    {
      id: 'section-5',
      name: 'DxC 500 Product Cards',
      selector: '.sublayout-two-column-dynamic',
      style: null,
      blocks: ['cards-product'],
      defaultContent: ['h2'],
    },
    {
      id: 'section-6',
      name: 'Learning Cards & Footnote',
      selector: '.sublayout.col-3-default-padding',
      style: null,
      blocks: ['cards-product'],
      defaultContent: ['h2', '.disclaimer-text'],
    },
  ],
};

// TRANSFORMER REGISTRY
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    // Skip section-only mappings (handled by the sections transformer)
    if (blockDef.name.startsWith('section-')) return;

    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;

    const main = document.body;

    // 1. beforeTransform cleanup
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block
    pageBlocks.forEach((block) => {
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform cleanup + section breaks/metadata
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '') || '/index',
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
