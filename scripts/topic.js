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
  wrap,
  wrapNodes,
  createTag,
  extractTopicsAndProducts,
} from '/scripts/common.js';
import {
  addFilters,
} from '/scripts/filters.js';

/**
 * Detects if there are featured posts
 */
function detectFeaturedPosts() {
  window.blog.hasFeaturedPost = !!document.querySelector('h2#featured-posts');
}

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
    titleSection.classList.add('has-image');
    img.parentNode.remove();
  }
  // if banner image inserted above the title, move title up into first div
  const title = document.querySelector('main h1');
  if (title.parentNode !== titleSection) {
    wrapNodes(titleSection, [title]);
  }
  wrap('topic-title-container', '.topic-page .topic-title > *');
}

window.addEventListener('load', async function() {
  detectFeaturedPosts();
  extractTopicsAndProducts();
  decorateTopicPage();
  await addFilters((filters) => {
    // apply selected filters
    applyFilters(filters);
  });
  //move first card to featured
  fetchArticles({
    callback: (hits) => {
      if (window.blog.hasFeaturedPost) {
        const $card = document.querySelector('main .card');
        if ($card) {
          const $hero = $card.querySelector('.hero img');
          $hero.setAttribute(
            'data-src',
            getOptimizedImageUrl($hero.getAttribute('data-src'), {
              height: 349,
            }),
          );
          document.querySelector('.topic-title').appendChild($card);
        }
      }
    }
  });
});

(new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    mutation.addedNodes.forEach(node => {
      if (window.blog.userFilters
        && node.tagName === 'DIV'
        && node.classList.contains('articles-empty')) {
        // decorate empty page if there are user filters set
        node.classList.add('user-filters');
        node.appendChild(createTag('div', { class: 'user-help' }));

      }
    });
  });
})).observe(document.querySelector('main'), { childList: true, subtree: true });
