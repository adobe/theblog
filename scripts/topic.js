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
  addClass,
  fetchArticles,
  applyFilters,
  wrapNodes,
  createTag,
} from '/scripts/common.js';
import {
  addFilters,
  clearAllFilters,
} from '/scripts/filters.js';

/**
 * Decorates the topic page with CSS classes
 */
function decorateTopicPage() {
  addClass('.topic-page main>div:first-of-type', 'topic-title');
  const img = document.querySelector('main img');
  const titleSection = document.querySelector('.topic-title');
  if (img) {
    titleSection.style.background=`url(${img.getAttribute('src')}) no-repeat center center`;
    titleSection.style.backgroundSize=`cover`;
    img.parentNode.remove();
  }
  // if banner image inserted above the title, move title up into first div
  const title = document.querySelector('main h1');
  if (title.parentNode !== titleSection) {
    wrapNodes(titleSection, [title]);
  }
}

window.addEventListener('load', async function() {
  decorateTopicPage();
  await addFilters((filters) => {
    // apply selected filters
    applyFilters(filters);
  });
  fetchArticles();
});

(new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    mutation.addedNodes.forEach(node => {
      if (window.blog.userFilters
        && node.tagName === 'DIV'
        && node.classList.contains('articles-empty')) {
        // decorate empty page if there are user filters set
        node.classList.add('user-filters');
        const clearAllBtn = document.querySelector('.filter-bar > a.action.clear-all').cloneNode();
        node
          .appendChild(createTag('div', { class: 'user-help' }))
          .appendChild(clearAllBtn);
        clearAllBtn.addEventListener('click', (event) => {
          event.stopPropagation();
          clearAllFilters(applyFilters);
        });
        clearAllBtn.addEventListener('keyup', (event) => {
          if (event.key === 'Enter') {
            clearAllFilters(applyFilters);
          }
        });
        clearAllBtn.focus();
      }
    });
  });
})).observe(document.querySelector('main'), { childList: true, subtree: true });
