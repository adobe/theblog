/*
 * Copyright 2021 Adobe. All rights reserved.
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
  createTag,
  wrap,
  wrapNodes,
  getSection,
} from '/scripts/common.js';

async function decoratePromotionPage() {
  document.body.classList.add('post-page');
  // wrap section with embed container
  wrap('embed embed-internal embed-internal-adobesensei embed-internal-products embed-internal-promotions',
    'main>div');
  // add post sections
  ['post-header', 'post-author', 'hero-image', 'post-body'].forEach((cl) => {
    document.querySelector('main').appendChild(createTag('div', { class: cl }));
  });
  // move promotion to post body
  document.querySelector('.post-body').appendChild(document.querySelector('.embed-internal-promotions'));
  // decorate promotion
  const $e = document.querySelector('.post-body .embed-internal>div:not(.banner)');
  $e.parentNode.classList.add('embed-internal-promotions');
  const children = Array.from($e.childNodes);
  children.shift();
  const parent = createTag('div', { 'class' : 'embed-promotions-text' });
  wrapNodes(parent, children);
}

function addDependencies() {
  window.hlx = window.hlx || {};
  window.hlx.dependencies = [
    window.location.pathname.replace('.html', '.embed.html'),
    window.location.pathname.toLowerCase().replace('.html', '.embed.html'),
  ];
}

window.addEventListener('load', () => {
  loadCSS('/style/post.css');
  decoratePromotionPage();
  addDependencies();
});

