/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import {
  wrap,
  addClass,
  setAttributes,
  getSection,
  fetchArticles,
} from '/scripts/common.js';

/**
 * Creates an SVG tag using the specified ID.
 * @param {string} id The ID
 * @returns {element} The SVG tag
 */
function createSVG(id) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttributeNS('http://www.w3.org/1999/xlink','href',`/icons.svg#${id}`);
  svg.appendChild(use);
  return svg;
}

/**
 * Decorates the author page with CSS classes
 */
function decorateAuthorPage(){
  wrap('bio', '.author-page main > div:first-of-type > *');
  addClass('.bio > p:first-of-type', 'frame');
  wrap('summary', [
    '.bio > h2',
    '.bio > p:not(.frame), .bio > ul',
  ]);
}

/**
 * Returns social link details based on the specified URL.
 * @param {string} url The social URL
 * @returns {object} The social link details
 */
function getSocialLinkDetails(url) {
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
function addSocialLinks(source, target) {
  if (!source) {
    source = getSection(); // get the last section of the current document
  }
  if (!target) {
    target = source.parentNode;
  }
  if (source) {
    source.querySelectorAll('p').forEach((p) => {
      if (p.innerText !== 'Social:') return;
      const list = p.nextSibling;
      if (!list || list.tagName !== 'UL') return;
      list.classList.add('social');
      list.querySelectorAll('a').forEach((e) => {
        if (e.textContent !== e.href) {
          // ignore links with different texts
          return;
        }
        const { title, type, className } = getSocialLinkDetails(e.href);
        if (type === 'unknown') {
          // remove links with unknown type
          e.remove();
          return;
        }
        e.innerHTML = '';
        e.appendChild(createSVG(type))
        e.setAttribute('title', title);
        e.setAttribute('itemprop', 'mainEntityOfPage');
        e.className = className;
      });
      p.remove();
    });
  }
}

function addSchema() {
  // Author
  const schema = document.querySelector('.summary p') ? 'Person' : 'Organization';
  setAttributes('main', { itemscope: '', itemtype: `http://schema.org/${schema}` });
  setAttributes('.bio .frame img', { itemprop: 'image' });
  setAttributes('.summary h2', { itemprop: 'name' });
  setAttributes('.summary p', { itemprop: 'description' });
}

window.addEventListener('load', function() {
  decorateAuthorPage();
  addSocialLinks();
  fetchArticles();
  addSchema();
});
