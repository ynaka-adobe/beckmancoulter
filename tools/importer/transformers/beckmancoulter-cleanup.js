/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Beckman Coulter site-wide cleanup.
 *
 * Removes non-authorable site chrome so the import contains only the
 * page-level authorable content that lives under #main-container.
 *
 * All selectors below were verified against migration-work/cleaned.html
 * (the captured DOM of https://www.beckmancoulter.com/). None are guessed.
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // UserWay accessibility widget and skip-links (block/overlay chrome).
    // Found in captured HTML: <div class="uw-sl">, <div class="uwy userway_p5 uts">,
    // ids #uw-skip-to-main / #uw-enable-visibility / #uw-open-accessibility / #userwayAccessibilityIcon
    WebImporter.DOMUtils.remove(element, [
      '.uwy',
      '.uw-sl',
      '.uw-s10-reading-guide',
      '.uw-s12-tooltip',
      '[id^="userway"]',
      '[id^="uw-"]',
      '[class*="userway"]',
    ]);

    // Country/language selection modal (overlay that can block parsing).
    // Found in captured HTML: <div class="ui modal country-language-modal">
    WebImporter.DOMUtils.remove(element, ['.country-language-modal']);
  }

  if (hookName === TransformHook.afterTransform) {
    // Header / universal navigation chrome.
    // Found in captured HTML: <div class="diagnostics-container"> is the page
    // shell wrapper that also CONTAINS #main-container and the footer, so it
    // must NOT be removed. Verified by balanced-tag matching against
    // migration-work/cleaned.html: .diagnostics-container closes AFTER
    // #main-container, while the header chrome below all close BEFORE it.
    // Found in captured HTML: <div class="nav-container">,
    // <div class="site-banner-messages">,
    // <div id="universal-navigation" class="universal-navigation">
    WebImporter.DOMUtils.remove(element, [
      '.nav-container',
      '#universal-navigation',
      '.universal-navigation',
      '.site-banner-messages',
    ]);

    // Global search box (Coveo) and its spacer.
    // Found in captured HTML: <div class="global-search-spacer">,
    // <div class="coveo-global-search">, <div id="GlobalSearchboxInterface_container">
    WebImporter.DOMUtils.remove(element, [
      '.coveo-global-search',
      '.global-search-spacer',
      '.coveo-search-section',
    ]);

    // Footer chrome.
    // Found in captured HTML: <div class="footer-container"> wrapping
    // <div class="universal-footer"> and <div class="universal-footer-text">
    WebImporter.DOMUtils.remove(element, [
      '.footer-container',
      '.universal-footer',
      '.universal-footer-text',
      '.mob-footer-div',
    ]);

    // Safe leftover element cleanup (non-authorable references).
    WebImporter.DOMUtils.remove(element, [
      'link',
      'noscript',
      'script',
      'style',
      'iframe',
    ]);
  }
}
