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
  getPostPaths,
  wrapNodes,
  createTag,
  addCard,
  fetchArticles,
  fetchArticleIndex,
} from '/scripts/common.js';

/**
 * Sets up the homepage
 */
export async function setupHomepage() {
  if (!document.title) {
    document.title = 'The Blog | Welcome to the Adobe Blog';
  }
  const titleSection = getSection(0);
  if (titleSection.innerText.trim() === document.title) {
    titleSection.remove();
  }

  // add featured placeholder
  const featuredPlaceholder = createTag('div', { 'class': 'featured-placeholder' });
  document.querySelector('main').appendChild(featuredPlaceholder);

  // news box
  let newsPaths;
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
  news.forEach((n) => {
    addCard(n, newsdeck)
  });

  await fetchArticles(() => {
    if (window.blog.page === 0) {
      // move first card to featured on first page
      const $firstCard = document.querySelector('.home-page .articles .card');
      if ($firstCard) {
        $firstCard.classList.add('featured');
        wrapNodes(document.querySelector('main'), [$firstCard]);
        featuredPlaceholder.remove();
      }
    }
  });

}

window.addEventListener('load', function() {
  setupHomepage();
});
