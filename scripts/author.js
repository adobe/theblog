import {
  wrap,
  addClass,
  getSection,
  createTag,
  fetchArticles,
} from '/scripts/common.js';

/**
 * Creates an SVG tag using the specified ID.
 * @param {string} id The ID
 * @returns {element} The SVG tag
 */
export function createSVG(id) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttributeNS('http://www.w3.org/1999/xlink','href',`/icons.svg#${id}`);
  svg.appendChild(use);
  return svg;
}

/**
 * Decorates the author page with CSS classes
 */
export function decorateAuthorPage(){
  wrap('bio', '.author-page main > div:first-of-type > *');
  addClass('.bio > p:first-of-type', 'frame');
  wrap('summary', [
    '.bio > h2',
    '.bio > p:not(.frame)',
  ]);
}

/**
 * Returns social link details based on the specified URL.
 * @param {string} url The social URL
 * @returns {object} The social link details
 */
export function getSocialLinkDetails(url) {
  let title;
  [
    'Twitter',
    'LinkedIn',
    'Facebook',
    'YouTube',
  ].forEach((t) => {
    if (!title && url.indexOf(t.toLowerCase()) > 0) {
      title = t;
    }
  });
  if (!title) title = 'Unknown';
  const type = title.toLowerCase();
  return {
    title,
    type,
    className: `social-${type}`,
  };
}

/**
 * Extracts social links from the specified source element,
 * wraps them in a container element and adds them to the
 * specified target element.
 * @param {element} source The source element
 * @param {element} target Te target element
 */
export function addSocialLinks(source, target) {
  if (!source) {
    source = getSection(); // get the last section of the current document
  }
  if (!target) {
    target = source.parentNode;
  }
  if (source) {
    const r = /^Social\: (.*)$/gmi.exec(source.innerText);
    const links = r && r.length > 0 ? r[1].split(',') : null;
    if (links) {
      source.innerHTML = source.innerHTML.replace(/<p>Social\: .*<\/p>/gi, '');
      const list = createTag('ul', { 'class': 'social' });
      links.forEach((href) => {
        href = href.trim();
        if (!href) return;
        const { title, type, className } = getSocialLinkDetails(href);
        const item = createTag('li');
        const link = createTag('a', {
          'class': className,
          title,
          href,
        });
        link.appendChild(createSVG(type));
        item.appendChild(link);
        list.appendChild(item);
      });
      document.querySelector('.summary').appendChild(list);
    }
  }
}

window.addEventListener('load', function() {
  decorateAuthorPage();
  addSocialLinks();
  fetchArticles();
});
