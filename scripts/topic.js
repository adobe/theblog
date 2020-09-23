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
  if (img) {
    const title = document.querySelector('.topic-title');
    title.style.background=`url(${img.getAttribute('src')}) no-repeat center center`;
    title.style.backgroundSize=`cover`;
  }
}

window.addEventListener('load', async function() {
  decorateTopicPage();
  await addFilters((filters) => {
    // apply selected filters
    applyFilters(filters);
    // decorate empty page
    setTimeout(() => {
      const empty = document.querySelector('.articles-empty');
      if (empty && window.blog.userFilters) {
        const clearAllBtn = document.querySelector('.filter-bar > a.action.clear-all').cloneNode();
        empty.classList.add('user-filters');
        empty
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
    }, 250);
  });
  fetchArticles();
});
