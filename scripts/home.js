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
  getSection,
  addClass,
  getIndexPath,
  getPostPaths,
  wrapNodes,
  createTag,
  addCard,
  fetchArticles,
  fetchArticleIndex,
  itemTransformer,
  extractTopicsAndProducts,
} from '/scripts/common.js';

const NUM_PURGED_INDEX_SEGMENTS = 10;

/**
 * Sets up the homepage
 */
async function setupHomepage() {
  if (!document.title) {
    document.title = 'The Blog | Welcome to the Adobe Blog';
  }
  const titleSection = getSection(0);
  if (titleSection.innerText.trim() === document.title) {
    titleSection.remove();
  }

  window.blog.indexPath = getIndexPath();

  // add featured placeholder
  const featuredPlaceholder = createTag('div', { 'class': 'featured-placeholder' });
  const $main=document.querySelector('main');
  $main.insertBefore(featuredPlaceholder, $main.childNodes[0]);

  // news box
  let newsPaths=[];
  addClass('h2#news', 'news-box', 1);
  const newsBox = document.querySelector('.news-box');
  if (newsBox) {
    newsPaths = getPostPaths('.news-box');
    document.querySelectorAll('.news-box a').forEach((el) => {
      if (!el.textContent.startsWith('http')) {
        el.classList.add('action', 'primary');
        el.title = el.textContent;
      }
    });
    // remove marker
    newsBox.querySelector('h2').remove();
    // remove link list
    Array.from(newsBox.children).forEach((child) => {
      if (child.tagName === 'OL' || child.tagName === 'UL') {
        child.remove();
      }
    });
    // add news content container
    wrapNodes(createTag('div', { 'class': 'content' }), document.querySelectorAll('.news-box > *'));
    // add button class to last paragraph with a link
    addClass('.news-box .content > p:last-of-type a', 'button', 1);
    // add news card container
    newsBox.appendChild(createTag('div', { class: 'deck' }));
  }

  await fetchArticleIndex(0);

  const pathLookup = window.blog.articleIndex.pathLookup;
  let news=[];
  newsPaths.forEach((n) => {
    if (pathLookup[n.substr(1)])
    news.push(pathLookup[n.substr(1)]);
  });

  const newsdeck=document.querySelector('.news-box .deck');
  news = await Promise.all(news.map(itemTransformer));
  news.forEach((n) => {
    n.hero= getOptimizedImageUrl(n.hero, { height: 260 });
    addCard(n, newsdeck)
  });

  extractTopicsAndProducts();

  await fetchArticles({
    pageSize: 13,
    callback: () => {
      if (window.blog.page === 0) {
        // move first card to featured on first page
        const $firstCard = document.querySelector('.home-page .articles .card');
        if ($firstCard) {
          $firstCard.classList.add('featured');
          const hero = $firstCard.querySelector('.hero img');
          hero.setAttribute('data-src', getOptimizedImageUrl(hero.getAttribute('data-src'), { height: 640, crop: '' }));
          const $main=document.querySelector('main');
          $main.insertBefore($firstCard,featuredPlaceholder);
          featuredPlaceholder.remove();
        }
      }
    }
  });

  // add publish dependencies
  window.hlx = window.hlx || {};
  window.hlx.dependencies = [];
  const limit = 256;
  let offset = 0;
  while (offset < limit * NUM_PURGED_INDEX_SEGMENTS) {
    window.hlx.dependencies.push(`/${window.blog.language}/query-index.json?limit=${limit}&offset=${offset}`);
    offset += 256;
  }

}

window.addEventListener('load', function() {
  setupHomepage();
});
