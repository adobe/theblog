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
  fetchArticles,
  getSection,
  addClass,
  getLink,
  wrap,
  createTag,
} from '/scripts/common.js';

/**
 * Reformats a date string from "01-15-2020" to "January 15, 2020"
 * @param {string} date The date string to format
 * @returns {string} The formatted date
 */
function formatLocalDate(date) {
  const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
  ];  
  const dateObj = date.split('-');

  return monthNames[parseInt(dateObj[0])-1] + " " + dateObj[1] + ", " + dateObj[2];
}

/**
 * Extracts metadata from the page and adds it to the head.
 */
export function handleMetadata() {
  // store author and date
  const r = /^By (.*)\n*(.*)$/gmi.exec(getSection(2).innerText);
  window.blog.author = r && r.length > 0 ? r[1] : '';
  const d = r && r.length > 1 ? /\d{2}[.\/-]\d{2}[.\/-]\d{4}/.exec(r[2]) : null;
  window.blog.date = d && d.length > 0 ? formatLocalDate(d[0]) : '';
  // store topics
  const last = getSection();
  let topics, topicContainer;
  Array.from(last.children).forEach((i) => {
    const r = /^Topics\: ?(.*)$/gmi.exec(i.innerText);
    if (r && r.length > 0) {
      topics = r[1].split(/\,\s*/);
      topicContainer = i;
    }
  });
  window.blog.topics = topics
    ? topics.filter((topic) => topic.length > 0)
    : [];
  if (topicContainer) {
    topicContainer.remove();
  }
  // store products
  let products, productContainer;
  Array.from(last.children).forEach((i) => {
    const r = /^Products\: ?(.*)$/gmi.exec(i.innerText);
    if (r && r.length > 0) {
      products = r[1].split(/\,\s*/);
      productContainer = i;
    }
  });
  window.blog.products = products
  ? products.filter((product) => product.length > 0)
  : [];
  if (productContainer) {
    productContainer.remove();
  }
  if (last.innerText.trim() === '') {
    last.remove(); // remove empty last div
  }

  const md = [{
    property: 'og:locale',
    content: window.blog.language,
  },{
    property: 'article:published_time',
    content: window.blog.date ? new Date(window.blog.date).toISOString() : '',
  }];
  // add topics and products as article:tags
  [...window.blog.topics].forEach((topic) => md.push({
      property: 'article:tag',
      content: topic,
  }));
  [...window.blog.products].forEach((product) => md.push({
    property: 'article:tag',
    content: `Adobe ${product}`,
  }));
  // add meta tags to DOM
  const frag = document.createDocumentFragment();
  md.forEach((meta) => {
    frag.appendChild(createTag('meta', { property: meta.property, content: meta.content }));
  });
  document.head.append(frag);
}

/**
 * Decorates the post page with CSS classes
 */
export function decoratePostPage(){
  addClass('.post-page main>div:first-of-type', 'post-title');
  addClass('.post-page main>div:nth-of-type(2)', 'hero-image');
  addClass('.post-page main>div:nth-of-type(3)', 'post-author');
  addClass('.post-page main>div:nth-of-type(4)', 'post-body');
  addClass('.post-page main>div.post-body>p>img', 'images', 1);
  wrap('post-header',['main>div.category','main>div.post-title', 'main>div.post-author']);
  wrap('embed-promotions',['main>div.post-body>div.default:not(.banner)']);
  wrap('embed-promotions-text',['.embed-promotions>div>*:not(:first-child)']);
  addImageClasses();
}

/**
 * Adds CSS classes to images appearing within text
 */
export function addImageClasses() {
  document.querySelectorAll('.post-page .post-body img').forEach(($e) => {
    let hasText = false;
    $e.parentNode.childNodes.forEach(($c) => {
      if ($c.nodeName == '#text') hasText=true;
    })
    if (hasText) $e.parentNode.classList.add('left');
  })
}

/**
 * Fetches the author details from the author page and adds them to the post header
 */
export function fetchAuthor() {
  if (!window.blog.author) return;
  const authorSection = document.querySelector('.post-author');
  if (authorSection) {
    // clear the content of the div and replace by avatar and text
    authorSection.innerHTML = '';
    const xhr = new XMLHttpRequest();
    const fileName = window.blog.author.replace(/\s/gm, '-').toLowerCase();
    const pageURL = getLink(window.blog.TYPE.AUTHOR, window.blog.author);
    xhr.open('GET', pageURL);
    xhr.onload = function() {
      if (xhr.status != 200 || xhr.status != 304) {
        // try to get <main> elements and find author image
        const groups = /(^\s*<main>)((.|\n)*?)<\/main>/gm.exec(xhr.responseText);
        if (!groups) return;
        let main = groups.length > 2 ? groups[2] : null;
        if (main) {
          main = main.replace(fileName, '../authors/' + fileName);

          const avatarURL = /<img src="(.*?)">/.exec(main)[1];
          const authorDiv = document.createElement('div');
          authorDiv.innerHTML = `<div class="author-summary"><img class="lazyload" data-src="${avatarURL}?width=128&crop=1:1&auto=webp">
            <div><span class="post-author"><a href="${pageURL}">${window.blog.author}</a></span>
            <span class="post-date">${window.blog.date}</span></div></div>`;
          authorDiv.classList.add('author');
          authorSection.appendChild(authorDiv);
        }
      } else {
        console.log('Author not found...', xhr.response);
      }
    };
    xhr.send();
  }
}

/**
 * Adds the primary topic as category to the post header
 */
export function addCategory() {
  if (!window.blog.topics || window.blog.topics.length === 0) return;
  const topic = window.blog.topics[0];
  const categoryWrap = document.createElement('div');
  const href = getLink(window.blog.TYPE.TOPIC, topic.replace(/\s/gm, '-').toLowerCase());
  categoryWrap.className = 'default category';
  categoryWrap.innerHTML = `<a href="${href}" title="${topic}">${topic}</a>`;
  document.querySelector('main').appendChild(categoryWrap);
}

/**
 * Adds buttons for all topics to the bottom of the post
 */
export function addTopics() {
  if (!window.blog.topics || window.blog.topics.length === 0) return;
  const topicsWrap = createTag('div', { 'class' : 'default topics' });
  window.blog.topics.forEach((topic) => {
    const btn = createTag('a', {
      href: getLink(window.blog.TYPE.TOPIC, topic.replace(/\s/gm, '-').toLowerCase()),
      title: topic,
    });
    btn.innerText = topic;
    topicsWrap.appendChild(btn);
  });
  document.querySelector('main').appendChild(topicsWrap);
}

/**
 * Adds product details to the post.
 */
export function addProducts() {
  if (!window.blog.products || window.blog.products.length === 0) return;
  let html='<div class="prod-design">';
  const productsWrap = createTag('div', { 'class': 'default products' });
  window.blog.products.forEach((product) => {
    const productRef = product.replace(/\s/gm, '-').toLowerCase();
    html += `<div>
    <a title=Adobe ${product} href="https://www.adobe.com/${productRef}.html"><img alt={product} src="/icons/${productRef}.svg"></a>
    <p>Adobe ${product}</p>
    <p><a class="learn-more" href="https://www.adobe.com/${productRef}.html"></a></p>
    </div>`;

  });
  html += '</div>';
  productsWrap.innerHTML = html;
  document.querySelector('main').appendChild(productsWrap);
}

/**
 * Loads the GetSocial sharing tool
 */
export function loadGetSocial() {
  const po = createTag('script', {
    type: 'text/javascript',
    async: true,
    src: 'https://api.at.getsocial.io/get/v1/7a87046a/gs_async.js',
  });
  document.head.appendChild(po);
}

/**
 * Shapes promotional banners
 */
export function shapeBanners() {
  const banners = document.querySelectorAll('div.banner');
  banners.forEach((banner) => {
    // remove surrounding p
    banner.querySelectorAll('img, a').forEach((node) => {
      const p = node.parentNode;
      p.parentNode.insertBefore(node, p);
      p.remove();
    });

    const left = document.createElement('div');
    const right = document.createElement('div');
    left.classList.add('banner-left');
    right.classList.add('banner-right');

    banner.append(left);
    banner.append(right);

    let backgroundImg;
    let logoImg;
    const imgs = banner.querySelectorAll('img');

    if (imgs.length == 2) {
      // easy case, 2 images in the banner
      backgroundImg = imgs[0];
      logoImg = imgs[1];
    } else {
      if (imgs.length == 1) {
        // need to find: img before a -> background or img after a -> logo
        for (let i = 0; i < banner.childNodes.length; i++) {
          const node = banner.childNodes[i];
          if (node.tagName === 'A') {
            // reached the a
            logoImg = imgs[0];
            break;
          }
          if (node === imgs[0]) {
            // still before a
            backgroundImg = imgs[0];
            break;
          }
        }
      }
    }

    if (backgroundImg) {
      banner.style['background-image'] = `url(${backgroundImg.dataset.src})`;
      backgroundImg.remove();
    }

    if (logoImg) {
      left.append(logoImg);
    }

    const title = banner.querySelector('h1');
    if (title) {
      left.append(title);
    }
    const p = banner.querySelector('p');
    if (p) {
      right.append(p);
    }

    const cta = banner.querySelector('a');
    if(cta) {
      right.append(cta);
    }
  });
}

window.addEventListener('load', function() {
  handleMetadata();
  addCategory();
  decoratePostPage();
  fetchAuthor();
  addTopics();
  // addProducts();
  loadGetSocial();
  shapeBanners();
  fetchArticles();
});
