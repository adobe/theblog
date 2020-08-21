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

import {
  getTaxonomy
} from '/scripts/taxonomy.js';

import { 
  wrapNodes 
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
 * Extracts metadata from the page and adds it to the head. No fetch or async task running.
 */
function handleImmediateMetadata() {
  // store author and date
  const authorSection = document.querySelector('.post-author');
  if (authorSection) {
    const r = /^By (.*)\n*(.*)$/gmi.exec(authorSection.innerText);
    window.blog.author = r && r.length > 0 ? r[1] : '';
    const d = r && r.length > 1 ? /\d{2}[.\/-]\d{2}[.\/-]\d{4}/.exec(r[2]) : null;
    window.blog.date = d && d.length > 0 ? formatLocalDate(d[0]) : '';
    if (window.blog.date) window.blog.rawDate = d[0];
  }
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
  topics = topics
    ? topics.filter((topic) => topic.length > 0)
    : [];
  if (topicContainer) {
    topicContainer.remove();
  }

  window.blog.topics = topics;

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

async function handleAsyncMetadata() {
  const topics = window.blog.topics;

  const taxonomy = await getTaxonomy();
  window.blog.topics = []; // UFT + parents only
  window.blog.tags = []; // UFT and NUFT + parents

  topics.forEach((topic) => {
    if (taxonomy.isUFT(topic)) {
      window.blog.topics.push(topic);
    }
    window.blog.tags.push(topic);
  });

  // handle parents afterward so that all leafs stay first
  topics.forEach((topic) => {
    const parents = taxonomy.getParents(topic);
    if (taxonomy.isUFT(topic)) {
      window.blog.topics = window.blog.topics.concat(parents);
    }
    window.blog.tags = window.blog.tags.concat(parents);
  });

  // remove duplicates
  window.blog.topics = Array.from(new Set(window.blog.topics));
  window.blog.tags = Array.from(new Set(window.blog.tags));
}

function addTargetToExternalLinks() {
  document.querySelectorAll('main a[href]').forEach(($a) => {
    const href=$a.getAttribute('href');
    if (href.indexOf('//')>=0) {
      $a.setAttribute('rel','noopener');
      $a.setAttribute('target','_blank');
    }
  })
}

function addPredictedPublishURL() {
  const segs=window.location.pathname.split('/');
  if (segs[2]=='drafts') {
    let datePath = '';
    if (window.blog.rawDate) {
      const datesplits = window.blog.rawDate.split('-');
      if (datesplits.length > 2) {
        datePath = `/${datesplits[2]}/${datesplits[0]}/${datesplits[1]}`;
      }
    }
    const $predURL=createTag('div', {class:'predicted-url'});
    const url=`https://blog.adobe.com/${segs[1]}${datePath}/${segs[segs.length-1].split('.')[0]}.html`;
    $predURL.innerHTML=`Predicted Publish URL: ${url}`;
    document.querySelector('main').insertBefore($predURL, getSection(0));
  }
}

function toClassName(name) {
  return (name.toLowerCase().replace(/[^0-9a-z]/gi, '-'))
}

/**
 * Decorates tables to divs with CSS classes
 */

function decorateTables() {
  document.querySelectorAll('main div.post-body table').forEach(($table) => {
      const $cols=$table.querySelectorAll('thead tr th');
      const cols=Array.from($cols).map((e) => toClassName(e.innerHTML));
      const $rows=$table.querySelectorAll('tbody tr');
      let $div={};

      if (cols.length==1 && $rows.length==1) {
          $div=createTag('div', {class:`${cols[0]}`});
          $div.innerHTML=$rows[0].querySelector('td').innerHTML;
      } else {
          $div=turnTableIntoCards($table, cols) 
      }
      $table.parentNode.replaceChild($div, $table);
  });
}

function turnTableIntoCards($table, cols) {
  const $rows=$table.querySelectorAll('tbody tr');
  const $cards=createTag('div', {class:`post-blocks ${cols.join('-')}`})
  $rows.forEach(($tr) => {
      const $card=createTag('div', {class:'post-block'})
      $tr.querySelectorAll('td').forEach(($td, i) => {
          const $div=createTag('div', {class: cols[i]});
          const $a=$td.querySelector('a[href]');
          if ($a && $a.getAttribute('href').startsWith('https://www.youtube.com/')) {
              const yturl=new URL($a.getAttribute('href'));
              const vid=yturl.searchParams.get('v');
              $div.innerHTML=`<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;"><iframe src="https://www.youtube.com/embed/${vid}?rel=0" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" allowfullscreen scrolling="no" allow="encrypted-media; accelerometer; gyroscope; picture-in-picture"></iframe></div>`;
          } else {
              $div.innerHTML=$td.innerHTML;
          }
          $card.append($div);
      });
      $cards.append($card);
  });
  return ($cards);
}

/**
 * Temporary empty <p> fix for table cells
 */

function fixTableCleanup() {
  document.querySelectorAll('.post-body td p:empty').forEach($p=>$p.remove());
  document.querySelectorAll('.post-body td>img').forEach(($img) => {
    const $p=createTag('p');
    $p.appendChild($img.cloneNode(true));
    $img.parentNode.replaceChild($p,$img);
  })
  document.querySelectorAll('.post-body td>em').forEach(($em) => {
    const $p=createTag('p');
    $p.appendChild($em.cloneNode(true));
    $em.parentNode.replaceChild($p,$em);
  })
}

/**
 * Decorates the post page with CSS classes
 */
function decoratePostPage(){
  addClass('.post-page main>div:first-of-type', 'post-title');
  addClass('.post-page main>div:nth-of-type(2)', 'hero-image');
  addClass('.post-page main>div:nth-of-type(3)', 'post-author');
   // hide author name
  addClass('.post-author', 'hide');
  addClass('.post-page main>div:nth-of-type(4)', 'post-body');
  addClass('.post-page main>div.post-body>p>img', 'images', 1);

  // fix tables
  fixTableCleanup();

  // hide product / topics section
  const last = getSection();
  if (!last.classList.contains('post-body')) {
    last.classList.add('hide');
  }
  const $main=document.querySelector('main');
  const $postAuthor=document.querySelector('.post-author');
  const $heroImage=document.querySelector('.hero-image');

  if ($postAuthor && $heroImage) $main.insertBefore($postAuthor,$heroImage);

  wrap('post-header',['main>div.category','main>div.post-title']);

  document.querySelectorAll('.embed-internal-undefined>div:not(.banner), .embed-internal-promotions>div:not(.banner)').forEach(($e) => {
    const children = Array.from($e.childNodes);
    children.shift();
    const parent = createTag('div', { 'class' : 'embed-promotions-text' });
    wrapNodes(parent, children);
  });

  document.querySelectorAll('.banner').forEach(($e) => {
    $e.parentNode.classList.add('embed-banner');
  });
}


/**
 * Adds pull quotes appearing in post body
 */
function decoratePullQuotes() {
  document.querySelectorAll('.post-page .post-body p').forEach(($e) => {
    if ($e.innerHTML.substr(0,1) == '“' && $e.innerHTML.endsWith('”')) {
      const $prev1=$e.previousElementSibling;
      if ($prev1 && $prev1.classList.contains('legend')) {
        const $prev2=$prev1.previousElementSibling;
        if ($prev2 && $prev2.classList.contains('images')) {
          const $pullquote=createTag('div', {class: 'pullquote'});
          $pullquote.appendChild($prev2);
          const $h2=createTag('h2');
          $h2.innerHTML=$e.innerHTML
          $pullquote.appendChild($h2);
          $pullquote.appendChild($prev1);
          $e.parentNode.replaceChild($pullquote, $e);
        }
      }
    } 
  })
}

/**
 * Adds CSS classes to images appearing within text
 */
function decorateImages() {
  document.querySelectorAll('.post-page .post-body img').forEach(($e) => {
    let hasText = false;
    $e.parentNode.childNodes.forEach(($c) => {
      if ($c.nodeName == '#text') hasText=true;
    })
    if (hasText) $e.parentNode.classList.add('left');
    const $next=$e.parentNode.nextElementSibling;
    if ($next && $next.tagName=='P') {
      const inner=$next.innerHTML.trim();
      let punctCount=0;
      let italicMarker=false;
      let slashMarker=false;

      punctCount+=(inner.split('.').length-1);
      punctCount+=(inner.split('?').length-1);
      punctCount+=(inner.split('!').length-1);
      if (inner.startsWith('<em>')) {
        italicMarker=true;
      }
      if (inner.startsWith('/')) {
        slashMarker=true;
        $next.innerHTML=inner.substr(1);
      }

      let maxlength=200;

      // date cutoff for italic only image captions
      if (new Date(window.blog.date)>=new Date('August 21, 2020')) {
        maxlength=0;
      }

      if ((punctCount<=1 && inner.length<maxlength && inner.endsWith('.')) || italicMarker) {
        if (!slashMarker) $next.classList.add('legend');
      }
    }
  })
}

/**
 * Fixes accidental relative links
 */
function fixLinks() {
  document.querySelectorAll('main a').forEach((a) => {
    const href = a.getAttribute('href');
    if (!href) return;
    if (!href.startsWith('http') && !href.startsWith('#')) {
      a.href = `https://${href}`;
    }
  });
}

/**
 * Fetches the author details from the author page and adds them to the post header
 */
function fetchAuthor() {
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
        try {
          // try to get <main> elements and find author image
          const groups = /(^\s*<main>)((.|\n)*?)<\/main>/gm.exec(xhr.responseText);
          if (!groups) return;
          let main = groups.length > 2 ? groups[2] : null;
          if (main) {
            main = main.replace(fileName, '../authors/' + fileName);

            const avatarURL = /<img src="(.*?)"/.exec(main)[1];
            const authorDiv = document.createElement('div');
            authorDiv.innerHTML = `<div class="author-summary"><img class="lazyload" alt="${window.blog.author}" title="${window.blog.author}" data-src="${avatarURL}?width=128&crop=1:1&auto=webp">
              <div><span class="post-author"><a href="${pageURL}">${window.blog.author}</a></span>
              <span class="post-date">${window.blog.date}</span></div></div>`;
            authorDiv.classList.add('author');
            authorSection.appendChild(authorDiv);
            authorSection.classList.remove('hide');
          }
        } catch(e) {
          console.error('Error while extracting author info', e);
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
function addCategory() {
  if (!window.blog.topics || window.blog.topics.length === 0) return;
  const topic = window.blog.topics[0];
  const categoryWrap = document.createElement('div');
  const href = getLink(window.blog.TYPE.TOPIC, topic.replace(/\s/gm, '-').toLowerCase());
  categoryWrap.className = 'default category';
  categoryWrap.innerHTML = `<a href="${href}" title="${topic}">${topic}</a>`;
  document.querySelector('main .post-header').prepend(categoryWrap);
}

/**
 * Adds buttons for all topics to the bottom of the post
 */
function addTopics() {
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
function addProducts() {
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
function loadGetSocial() {
  if (window.location.pathname.includes('/drafts/')
    || window.location.pathname.includes('/documentation/')) return;
  const po = createTag('script', {
    type: 'text/javascript',
    async: true,
    src: 'https://api.at.getsocial.io/get/v1/7a87046a/gs_async.js',
  });
  document.head.appendChild(po);

  document.addEventListener('gs:load', () => {
    if (typeof window.GS === 'object' && window.GS.isMobile) {
      const footer = document.querySelector('footer');
      if (footer instanceof HTMLElement) {
        footer.classList.add('mobile-footer');
      }
    }
  });
}

/**
 * Shapes promotional banners
 */
function shapeBanners() {
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

window.addEventListener('load', async function() {
  decoratePostPage();
  handleImmediateMetadata();
  decorateImages();
  decorateTables();
  addTargetToExternalLinks();
  fixLinks();
  addPredictedPublishURL();
  addCategory();
  fetchAuthor();
  await handleAsyncMetadata();
  addTopics();
  // addProducts();
  loadGetSocial();
  shapeBanners();
  fetchArticles();
});
