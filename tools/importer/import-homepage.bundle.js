/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/cards-product.js
  function parse(element, { document }) {
    const cells = [];
    const teasers = Array.from(element.querySelectorAll(".showcase-teaser"));
    const fluidCards = Array.from(element.querySelectorAll(".ui.fluid.card, .linear-icon-card"));
    if (teasers.length) {
      teasers.forEach((teaser) => {
        const title = teaser.querySelector("h4");
        const titleText = title ? title.textContent.replace(/\s+/g, " ").trim() : "";
        let img = teaser.querySelector("img");
        if (!img) {
          const styleAttr = teaser.getAttribute("style") || "";
          const match = styleAttr.match(/url\((['"]?)(https?:[^'")]+)\1\)/i);
          if (match && match[2]) {
            img = document.createElement("img");
            img.setAttribute("src", match[2]);
          }
        }
        if (img && !img.getAttribute("alt")) {
          img.setAttribute("alt", titleText || "card image");
        }
        const textContent = [];
        const badge = teaser.querySelector(".card-tag span");
        if (badge && badge.textContent.trim()) {
          const badgeP = document.createElement("p");
          badgeP.textContent = badge.textContent.trim();
          textContent.push(badgeP);
        }
        if (titleText) {
          const heading = document.createElement("h3");
          heading.textContent = titleText;
          textContent.push(heading);
        }
        const cta = teaser.querySelector('a.button, a[class*="button"], a[href]');
        if (cta && cta.textContent.trim()) textContent.push(cta);
        if (img || textContent.length) {
          cells.push([img, textContent]);
        }
      });
    } else if (fluidCards.length) {
      fluidCards.forEach((card) => {
        const icon = card.querySelector('span.lnr, [class*="lnr"], .ui.image span');
        const textContent = [];
        const header = card.querySelector(".card-header-text, a.header");
        if (header && header.textContent.trim()) {
          const heading = document.createElement("h3");
          const headingLink = document.createElement("a");
          if (header.getAttribute("href")) headingLink.setAttribute("href", header.getAttribute("href"));
          headingLink.textContent = header.textContent.trim();
          heading.appendChild(headingLink);
          textContent.push(heading);
        }
        const desc = card.querySelector(".card-content-text p, .card-content-text");
        if (desc && desc.textContent.trim()) {
          const descP = document.createElement("p");
          descP.textContent = desc.textContent.trim();
          textContent.push(descP);
        }
        const cta = card.querySelector(".explore-link a, a.btn-cta, .description a[href]");
        if (cta && cta.textContent.trim()) textContent.push(cta);
        if (icon || textContent.length) {
          cells.push([icon || "", textContent]);
        }
      });
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-product", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-product.js
  function parse2(element, { document }) {
    const cells = [];
    const slides = element.querySelectorAll(".owl-stage .item, .owl-item .item");
    const seen = /* @__PURE__ */ new Set();
    slides.forEach((slide) => {
      if (seen.has(slide)) return;
      seen.add(slide);
      let image = slide.querySelector("a.product-slider-img img, img.product-slider-img");
      if (!image) {
        image = slide.querySelector(".vidyard-player-embed, .vidyard-player-container img, img");
      }
      const titleLink = slide.querySelector(".subheading a.product-slider-img-link");
      const heading = slide.querySelector(".subheading h5, .subheading h1, .subheading h2, .subheading h3, .subheading h4, .subheading h6");
      const contentCell = [];
      if (titleLink) {
        contentCell.push(titleLink);
      } else if (heading) {
        contentCell.push(heading);
      }
      if (!image && contentCell.length === 0) return;
      cells.push([image || "", contentCell.length ? contentCell : ""]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-product", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-feature.js
  function parse3(element, { document }) {
    const cells = [];
    if (element.matches(".quick-links") || element.classList.contains("quick-links")) {
      const links = Array.from(element.querySelectorAll(":scope > a, a"));
      if (links.length) {
        cells.push(links.map((link) => link));
      }
    } else if (element.matches(".social-proof-card") || element.classList.contains("social-proof-card")) {
      const mediaCol = element.querySelector('.image a.media-link-image, .image a[class*="media"], .image picture, .image img, .image') || element.querySelector("picture, img");
      const contentEl = element.querySelector('.content.lazyload-child, .content, [class*="content"]:not(.content-container)');
      const textCell = [];
      if (contentEl) {
        const heading = contentEl.querySelector('h1, h2, h3, h4, [class*="title"]');
        if (heading && heading.textContent.replace(/\s+/g, " ").trim() && !/^empty heading$/i.test(heading.textContent.trim())) {
          textCell.push(heading);
        }
        const paragraphs = Array.from(contentEl.querySelectorAll(":scope > p, p")).filter((p) => p.textContent.replace(/\s+/g, " ").trim().length > 0);
        paragraphs.forEach((p) => textCell.push(p));
        const cta = contentEl.querySelector('a.btn-cta, a.button, a[class*="button"]');
        if (cta) textCell.push(cta);
      }
      const row = [];
      row.push(textCell.length ? textCell : "");
      if (mediaCol) row.push(mediaCol);
      cells.push(row);
    } else {
      const contentEl = element.querySelector('.adjustable-two-column-display-content, [class*="display-content"]');
      const imageEl = element.querySelector('.adjustable-two-column-display-image, [class*="display-image"]');
      const contentCell = [];
      if (contentEl) {
        const heading = contentEl.querySelector("h1, h2, h3, h4");
        if (heading) contentCell.push(heading);
        Array.from(contentEl.querySelectorAll("p")).filter((p) => p.textContent.replace(/\s+/g, " ").trim().length > 0).forEach((p) => contentCell.push(p));
        const cta = contentEl.querySelector('a.button, a[class*="button"], a.btn-cta');
        if (cta) contentCell.push(cta);
      }
      const imageCell = imageEl ? imageEl.querySelector("picture, img") || imageEl : null;
      const container = element.querySelector(".content-container") || element;
      const orderedChildren = Array.from(container.children);
      const contentIndex = contentEl ? orderedChildren.indexOf(contentEl) : -1;
      const imageIndex = imageEl ? orderedChildren.indexOf(imageEl) : -1;
      const row = [];
      if (imageIndex > -1 && imageIndex < contentIndex) {
        if (imageCell) row.push(imageCell);
        row.push(contentCell.length ? contentCell : "");
      } else {
        row.push(contentCell.length ? contentCell : "");
        if (imageCell) row.push(imageCell);
      }
      cells.push(row);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-feature", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/hero-spotlight.js
  function parse4(element, { document }) {
    const posterImg = element.querySelector(
      '#video-tag-thumbnail img, .item-container img, img[class*="thumbnail"]'
    );
    const videoSource = element.querySelector(
      "video source[src], video[src]"
    );
    const videoSrc = videoSource ? videoSource.getAttribute("src") || videoSource.getAttribute("href") : null;
    const heading = element.querySelector(
      '.banner-heading h5, .banner-heading h1, .banner-heading h2, .heading-container h1, .heading-container h2, [class*="banner-heading"] h1, [class*="banner-heading"] h2'
    );
    const details = element.querySelector(
      '.banner-details p, .banner-details, [class*="banner-details"] p'
    );
    const ctaLinks = Array.from(
      element.querySelectorAll(
        ".carousel-button-wrapper a[href], a.media-link-image[href], a.ui.button[href]"
      )
    ).filter((a) => a.getAttribute("href"));
    const cells = [];
    const bgCell = [];
    if (posterImg) bgCell.push(posterImg);
    if (videoSrc) {
      const videoLink = document.createElement("a");
      videoLink.href = videoSrc;
      videoLink.textContent = videoSrc;
      bgCell.push(videoLink);
    }
    if (bgCell.length) cells.push([bgCell]);
    const contentCell = [];
    if (heading) contentCell.push(heading);
    if (details) contentCell.push(details);
    contentCell.push(...ctaLinks);
    cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document, {
      name: "hero-spotlight",
      cells
    });
    element.replaceWith(block);
  }

  // tools/importer/transformers/beckmancoulter-cleanup.js
  var TransformHook = {
    beforeTransform: "beforeTransform",
    afterTransform: "afterTransform"
  };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        ".uwy",
        ".uw-sl",
        ".uw-s10-reading-guide",
        ".uw-s12-tooltip",
        '[id^="userway"]',
        '[id^="uw-"]',
        '[class*="userway"]'
      ]);
      WebImporter.DOMUtils.remove(element, [".country-language-modal"]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        ".nav-container",
        "#universal-navigation",
        ".universal-navigation",
        ".site-banner-messages"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".coveo-global-search",
        ".global-search-spacer",
        ".coveo-search-section"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".footer-container",
        ".universal-footer",
        ".universal-footer-text",
        ".mob-footer-div"
      ]);
      WebImporter.DOMUtils.remove(element, [
        "link",
        "noscript",
        "script",
        "style",
        "iframe"
      ]);
    }
  }

  // tools/importer/transformers/beckmancoulter-sections.js
  var TransformHook2 = {
    beforeTransform: "beforeTransform",
    afterTransform: "afterTransform"
  };
  function transform2(hookName, element, payload) {
    if (hookName !== TransformHook2.afterTransform) return;
    const template = payload && payload.template;
    const sections = template && Array.isArray(template.sections) ? template.sections : [];
    if (sections.length < 2) return;
    const doc = element.ownerDocument;
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section || !section.selector) continue;
      const target = element.querySelector(section.selector);
      if (!target) continue;
      if (section.style) {
        const metadataBlock = WebImporter.Blocks.createBlock(doc, {
          name: "Section Metadata",
          cells: {
            style: section.style
          }
        });
        target.after(metadataBlock);
      }
      if (i > 0) {
        target.before(doc.createElement("hr"));
      }
    }
  }

  // tools/importer/import-homepage.js
  var parsers = {
    "cards-product": parse,
    "carousel-product": parse2,
    "columns-feature": parse3,
    "hero-spotlight": parse4
  };
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "Beckman Coulter homepage with hero, product highlights, and content sections",
    urls: ["https://www.beckmancoulter.com/"],
    blocks: [
      {
        name: "hero-spotlight",
        instances: [".video-hero-carousel"]
      },
      {
        name: "columns-feature",
        instances: [".quick-links", ".social-proof-card", ".adjustable-two-column-display"]
      },
      {
        name: "carousel-product",
        instances: [".product-slider-carousel"]
      },
      {
        name: "cards-product",
        instances: [".sublayout-two-column-dynamic", ".sublayout.col-3-default-padding"]
      },
      {
        name: "section-carousel",
        instances: [".product-slider-carousel"],
        section: "navy-blue"
      }
    ],
    sections: [
      {
        id: "section-1",
        name: "Hero",
        selector: ".video-hero-carousel",
        style: null,
        blocks: ["hero-spotlight", "columns-feature"],
        defaultContent: []
      },
      {
        id: "section-2",
        name: "Intro & Media Showcase",
        selector: ".social-proof-section",
        style: null,
        blocks: ["columns-feature"],
        defaultContent: ["h2"]
      },
      {
        id: "section-3",
        name: "Feature Rows",
        selector: ".adjustable-two-column-display",
        style: null,
        blocks: ["columns-feature"],
        defaultContent: []
      },
      {
        id: "section-4",
        name: "Comprehensive Diagnostic Solutions Carousel",
        selector: ".product-slider-carousel",
        style: "navy-blue",
        blocks: ["carousel-product"],
        defaultContent: [".carousel-heading", ".carousel-subheading"]
      },
      {
        id: "section-5",
        name: "DxC 500 Product Cards",
        selector: ".sublayout-two-column-dynamic",
        style: null,
        blocks: ["cards-product"],
        defaultContent: ["h2"]
      },
      {
        id: "section-6",
        name: "Learning Cards & Footnote",
        selector: ".sublayout.col-3-default-padding",
        style: null,
        blocks: ["cards-product"],
        defaultContent: ["h2", ".disclaimer-text"]
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      if (blockDef.name.startsWith("section-")) return;
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
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_homepage_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "") || "/index"
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_homepage_exports);
})();
