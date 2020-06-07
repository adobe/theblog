import {
  getSection,
  addClass,
  getPostPaths,
  wrapNodes,
  createTag,
  setupSearch,
  itemTransformer,
  addCard,
} from '/scripts/common.js';

/**
 * Sets up the homepage
 */
export function setupHomepage() {
  if (!document.title) {
    document.title = 'The Blog | Welcome to the Adobe Blog';
  }
  const titleSection = getSection(0);
  if (titleSection.innerText.trim() === document.title) {
    titleSection.remove();
  }

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

  setupSearch({
    hitsPerPage: 13,
    extraPaths: newsPaths,
    transformer: (item, index) => {
      item = itemTransformer(item);
      if (index === 0) {
        // use larger hero image on first article
        item.hero = item.hero ? item.hero.replace('?height=512&crop=3:2', '?height=640') : '#';
      }
      return item;
    },
    callback: ({ extraHits }) => {
      // move first card to featured 
      const $firstCard = document.querySelector('.home-page .articles .card');
      if ($firstCard) {
        $firstCard.classList.add('featured');
        wrapNodes(document.querySelector('main'), [$firstCard]);
      }
      // add hits from extra paths to news box
      extraHits
        .map(itemTransformer)
        .forEach((hit) => addCard(hit, document.querySelector('.news-box .deck')));
    }
  });
}

window.addEventListener('load', function() {
  setupHomepage();
});
