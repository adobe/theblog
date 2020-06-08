import {
  addClass,
  fetchArticles,
} from '/scripts/common.js';

/**
 * Decorates the topic page with CSS classes
 */
export function decorateTopicPage() {
  addClass('.topic-page main>div:first-of-type', 'topic-title');
  const img = document.querySelector('main img');
  if (img) {
    const title = document.querySelector('.topic-title');
    title.style.background=`url(${img.getAttribute('src')}) no-repeat center center`;
    title.style.backgroundSize=`cover`;
  }
}

window.addEventListener('load', function() {
  decorateTopicPage();
  fetchArticles();
});
