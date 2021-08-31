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
  wrapNodes,
  createTag,
  extractTopicsAndProducts,
} from '/scripts/common.js';

import {
  getTaxonomy
} from '/scripts/taxonomy.js';

const DEFAULT_AVATAR = '/media_942ea2ad17270c65cda838d52145ec5b26704d41.png';

/**
 * Formats the document-provided date (e.g. "01-15-2020") using the
 * date locale matching the content displayed (e.g. "January 15, 2020").
 *
 * Note: we deliberately omit the { timeZone: 'UTC' } used when formatting a numeric
 * date as it leads to wrong date output (e.g. 03-11-2021 becomes 12 March 2021).
 *
 * @param {string} date The date string to format
 * @returns {string} The formatted date
 */
function formatLocalDate(date) {
  const dateString = new Date(date.replace(/-/g, '/')).toLocaleDateString(window.blog.dateLocale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return dateString;
}

/**
 * Adds meta tags to the head element.
 */
function addMetaTags(md) {
  const frag = document.createDocumentFragment();
  md.forEach(meta => frag.appendChild(createTag('meta', meta)));
  document.head.append(frag);
}

/**
 * Extracts metadata from the page and adds it to the head. No fetch or async task running.
 */
function handleImmediateMetadata() {
  // store author and date
  const authorSection = document.querySelector('.post-author');
  if (authorSection) {
    const r = /^[bB]y(.*)\n*(.*)$/gmi.exec(authorSection.innerText);
    window.blog.author = r && r.length > 0 ? r[1].trim() : '';
    const d = r && r.length > 1 ? /\d{2}[.\/-]\d{2}[.\/-]\d{4}/.exec(r[2]) : null;
    const authorLink = authorSection.querySelector('a');
    if (authorLink && authorLink.href && authorLink.href.includes('/authors/')) {
      window.blog.authorPath = new URL(authorLink.href).pathname;
    }
    window.blog.date = d && d.length > 0 ? formatLocalDate(d[0]) : '';
    if (window.blog.date) window.blog.rawDate = d[0];
  }

  extractTopicsAndProducts();

  addMetaTags([{
    property: 'og:locale',
    content: window.blog.language,
  },{
    property: 'article:published_time',
    content: window.blog.rawDate ? new Date(window.blog.rawDate.replace(/-/g, '/')).toISOString() : '',
  }]);
}

/**
 * Finds user facing topics to display, and adds both user and non user facing topics as meta tags.
 */
async function handleAsyncMetadata() {
  const taxonomy = await getTaxonomy(window.blog.language);

  const allTopics = Array.from(new Set([
    ...window.blog.topics,
    ...taxonomy.getParents(window.blog.topics),
  ]));

  const allProducts = Array.from(new Set([
    ...window.blog.products,
    ...taxonomy.getParents(window.blog.products, taxonomy.PRODUCTS),
  ]));


  // de-dupe UFT, NUFT + parents
  const allTags = Array.from(new Set([
    ...allTopics,
    ...allProducts,
  ]));

  // add all tags as article:tags
  addMetaTags(allTags
    .filter((topic) => !taxonomy.skipMeta(topic))
    .map((topic) => {
      return {
        property: 'article:tag',
        content: topic,
      }
    }));

  // topics + parents
  window.blog.allTopics = allTopics;

  // products + parents
  window.blog.allProducts = allProducts;

  // UFT topics + parents
  window.blog.allVisibleTopics = allTopics
    .filter(topic => taxonomy.isUFT(topic));

  // UFT products + parents
  window.blog.allVisibleProducts = allProducts
    .filter(topic => taxonomy.isUFT(topic, taxonomy.PRODUCTS));

  // UFT topics + products + parents
  window.blog.allVisibleTags = Array.from(new Set([
    ...window.blog.allVisibleTopics,
    ...window.blog.allVisibleProducts,
  ]));
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
 * Add post-blocks class to blocks and add missing <p>s
 */
function fixPostBlocks() {
  ['.image-50-image-50'].forEach((block) => {
    document.querySelectorAll(block).forEach(($el) => {
      $el.classList.add('post-blocks');
      for (let i = 0; i < $el.children.length; i += 1) {
        $el.children[i].classList.add('post-block');
      }
    });
  });

  // embed youtube (don't know if this is still required; commenting for now.)
  // document.querySelectorAll('.post-block > div a[href]').forEach(($a) => {
  //   const href = $a.getAttribute('href');
  //   if (href.startsWith('https://www.youtube.com/')) {
  //     const yturl = new URL(href);
  //     const vid=yturl.searchParams.get('v');
  //     $a.parentNode.innerHTML = `<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;"><iframe src="https://www.youtube.com/embed/${vid}?rel=0" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" allowfullscreen scrolling="no" allow="encrypted-media; accelerometer; gyroscope; picture-in-picture"></iframe></div>`;
  //   }
  // });

  // remove empty paragraphs
  document.querySelectorAll('.post-block > div > p:empty').forEach($p=>$p.remove());

  // wrap pictures with <p>
  document.querySelectorAll('.post-block div > picture').forEach(($img) => {
    const $p=createTag('p');
    $p.appendChild($img.cloneNode(true));
    $img.parentNode.replaceChild($p,$img);
  })

  // wrap em with <p>
  document.querySelectorAll('.post-block div>em').forEach(($em) => {
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
  addClass('.post-page main>div.post-body>p>picture', 'images', 1);

  // fix tables
  fixPostBlocks();
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

  document.querySelectorAll('.post-body .embed-internal>div:not(.banner)').forEach(($e) => {
    $e.parentNode.classList.add('embed-internal-promotions');
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
  document.querySelectorAll('.post-page .post-body picture').forEach(($e) => {
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
 * Checks if a given match intersects with an existing match
 * before adding it to the list of matches. In case of an
 * intersection, the more specific (i.e. longer) match wins.
 * @param {array} matches The existing matches
 * @param {object} contender The match to check and add
 * @param {number} maxMatches The maximum number of matches
 */
export function checkAndAddMatch(matches, contender, maxMatches) {
  const collisions = matches
    // check for intersections
    .filter((match) => {
      if (contender.end < match.start || contender.start > match.end) {
        // no intersection with existing match
        return false;
      }
      // contender starts or ends within existing match
      return true;
    });
  if (collisions.length === 0 && matches.length < maxMatches) {
    // no intersecting existing matches, add contender if max not yet reached
    matches.push(contender);
  }
}

/**
 * Loops through a list of keywords and looks for matches in the article text.
 * The first occurrence of each keyword will be replaced with a link.
 */
async function addInterLinks() {
  if (window.blog.topics.includes('no-interlinks')) return;
  const response = await fetch(`/${window.blog.language}/keywords.json`);
  if (response.ok) {
    const json = await response.json();
    const articleBody = document.querySelector('main .post-body');
    const articleText = articleBody.textContent.toLowerCase();
    // set article link limit: 1 every 100 words
    const articleLinks = articleBody.querySelectorAll('a').length;
    const articleWords = articleText.split(/\s/).length;
    const maxLinks = (Math.floor(articleWords/100)) - articleLinks;
    let linkCount = 0;
    if (maxLinks <= 0) return;
    const keywords = (Array.isArray(json) ? json : json.data)
      // scan article to filter keywords down to relevant ones
      .filter(({ Keyword }) => articleText.indexOf(Keyword.toLowerCase()) !== -1)
      // sort matches by length descending
      .sort((a, b) => {
        return b.Keyword.length - a.Keyword.length;
      })
      // prepare regexps
      .map((item) => {
        return {
          regexp: new RegExp(`\\b(${item.Keyword.replace(/[\/\\^$*+?.()|[\]{}]/g, '\\$&')})\\b`, 'iu'),
          ...item,
        }
      });
    if (keywords.length === 0) return;

    // find exact text node matches and insert links (exclude headings and anchors)
    document.querySelectorAll('main .post-body > *:not(h1):not(h2):not(h3):not(h4):not(h5):not(a):not(.legend)').forEach((p) => {
      if (keywords.length === 0) return;
      if (linkCount === maxLinks) {
        keywords.splice(0, keywords.length); // clear rest
        return;
      }
      // set par link limit: 1 every 40 words
      const parLinks = p.querySelectorAll('a').length;
      const parWords = p.textContent.split(/\s/).length;
      const maxParLinks = Math.floor(parWords/40) - parLinks;
      if (maxParLinks <= 0) return;

      Array.from(p.childNodes)
        // filter out non text nodes
        .filter((node) => node.nodeType === Node.TEXT_NODE)
        .forEach((textNode) => {
          const matches = [];
          // find case-insensitive matches inside text node
          keywords.forEach((item) => {
            const match = item.regexp.exec(textNode.nodeValue);
            if (match) {
              checkAndAddMatch(matches, {
                item,
                start: match.index,
                end: match.index + item.Keyword.length,
              }, maxParLinks);
            }
          });
          matches
            // sort matches by start index descending
            .sort((a, b) => {
              return b.start - a.start;
            })
            // split text node and insert link with matched text
            .forEach(({ item, start, end }) => {
              const text = textNode.nodeValue;
              const a = createTag('a', {
                title: item.Keyword,
                href: item.URL,
                class: 'interlink',
              });
              a.appendChild(document.createTextNode(text.substring(start, end)));
              p.insertBefore(a, textNode.nextSibling);
              p.insertBefore(document.createTextNode(text.substring(end)), a.nextSibling);
              textNode.nodeValue = text.substring(0, start);
              linkCount += 1;
              // remove matched link from interlinks
              keywords.splice(keywords.indexOf(item), 1);
            });
        });
    });
  }
}



/**
 * Checks for accidental relative links and makes sure
 * external URLs open in a new window with no opener
 * (security best practice).
 */
function handleLinks() {
  document.querySelectorAll('main .post-body a, main .hero-image a').forEach((a) => {
    const href = a.getAttribute('href');
    if (!href) return;
    // sanity check URL
    if (!href.startsWith('https://')
      && !href.startsWith('http://')
      && !href.startsWith('ftp://')
      && !href.startsWith('mailto:')
      && !href.startsWith('#')
      && !href.startsWith('/')) {
          a.setAttribute('href', `https://${href}`);
    }
    // absolute URL opens in new tab with no opener
    if (href.includes('//')) {
      a.setAttribute('rel','noopener');
      a.setAttribute('target','_blank');
    }
  });
}

/**
 * Fetches the author details from the author page and adds them to the post header
 */
function fetchAuthor() {
  if (!window.blog.author && !window.blog.date) return;
  const authorSection = document.querySelector('.post-author');
  if (authorSection) {
    // clear the content of the div and replace by avatar and text
    authorSection.innerHTML = '';

    if (!window.blog.author) {
      const authorDiv = document.createElement('div');
      authorDiv.innerHTML = `<div class="author-summary">
        <div><span class="post-author"></span>
        <span class="post-date">${window.blog.date || ''}</span></div></div>`;
      authorDiv.classList.add('author');
      authorSection.appendChild(authorDiv);
      authorSection.classList.remove('hide');
      return;
    }

    const xhr = new XMLHttpRequest();
    const fileName = window.blog.author.replace(/\s/gm, '-').toLowerCase();
    const pageURL = window.blog.authorPath || getLink(window.blog.TYPE.AUTHOR, window.blog.author);
    xhr.open('GET', pageURL);
    xhr.onload = function() {
      try {
        let avatarURL = DEFAULT_AVATAR;
        // try to get <main> elements and find author image
        const groups = /(^\s*<main>)((.|\n)*?)<\/main>/gm.exec(xhr.responseText) || [];
        let main = groups.length > 2 ? groups[2] : null;
        if (main) {
          main = main.replace(fileName, '../authors/' + fileName);
          const img = /<img src="(.*?)"/.exec(main);
          if (img && img.length > 0 && img[1]) {
            avatarURL = img[1];
          }
        }
        avatarURL = getOptimizedImageUrl(avatarURL, { width: 128, crop: '1:1' });
        const authorDiv = document.createElement('div');
        authorDiv.innerHTML = `<div class="author-summary">
          <img class="lazyload" alt="${window.blog.author}" title="${window.blog.author}" data-src="${avatarURL}">
          <div><span class="post-author">
            ${xhr.status < 400 ? `<a href="${pageURL}" title="${window.blog.author}">` : ''}
              ${window.blog.author}
            ${xhr.status < 400 ? '</a>' : ''}
          </span>
          <span class="post-date">${window.blog.date || ''}</span></div></div>`;
        authorDiv.classList.add('author');
        authorSection.appendChild(authorDiv);
        authorSection.classList.remove('hide');
      } catch(e) {
        console.error('Error while extracting author info', e);
      }
    };
    xhr.send();
  }
}

/**
 * Adds the primary topic as category to the post header
 */
async function addCategory() {
  if (!window.blog.allVisibleTopics || window.blog.allVisibleTopics.length === 0) return;
  const topic = window.blog.allVisibleTopics[0];
  const categoryWrap = document.createElement('div');
  const taxonomy = await getTaxonomy(window.blog.language);
  const href = taxonomy.getLink(topic) || getLink(window.blog.TYPE.TOPIC, topic.replace(/\s/gm, '-').toLowerCase());
  categoryWrap.className = 'category';
  categoryWrap.innerHTML = `<a href="${href}" title="${topic}">${topic}</a>`;
  document.querySelector('main .post-header').prepend(categoryWrap);
}

/**
 * Adds buttons for all topics to the bottom of the post
 */
async function addTopics() {
  if (!window.blog.allVisibleTags || window.blog.allVisibleTags.length === 0) return;
  const topicsWrap = createTag('div', { 'class' : 'topics' });
  const taxonomy = await getTaxonomy(window.blog.language);
  // use alphabetically sorted copy
  Array.from(window.blog.allVisibleTags).sort((a, b) => a.localeCompare(b)).forEach((topic) => {
    const item = taxonomy.lookup(topic);
    if (item) {
      const href = item.link || getLink(window.blog.TYPE.TOPIC, item.name.replace(/\s/gm, '-').toLowerCase());
      const btn = createTag('a', {
        href,
        title: topic,
      });
      btn.innerText = topic;
      topicsWrap.appendChild(btn);
    }
  });
  document.querySelector('main').appendChild(topicsWrap);
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

function decorateInfographic() {
  document.querySelectorAll('.infographic img').forEach(($img) => {
    const $div=$img.closest('.infographic');
    const $p=$img.parentNode;
    const $a=$div.querySelector('a');
    if ($a) {
      $a.innerHTML='';
      $a.appendChild($img);
      $p.remove();
    }
  });
}

function decorateLinkedImages() {
  document.querySelectorAll('.linked-image img').forEach(($img) => {
    const $div=$img.closest('.linked-image');
    const $p=$img.parentNode;
    const $a=$div.querySelector('a');
    if ($a) {
      $a.innerHTML='';
      $a.appendChild($img);
      $p.remove();
    }
    $div.className='images';
  });
}
function decorateCaptions() {
  document.querySelectorAll('.caption').forEach(($caption) => {
    // clean empty paragraphs
    $caption.querySelectorAll('p:empty').forEach($p=>$p.remove());
    const $pCheck = $caption.querySelector('p');
    if ($pCheck) {
      $caption.querySelectorAll('p').forEach(($p) => {
        $p.classList.add('legend');
      })
    } else {
      const $p=createTag('p', {class: 'legend'});
      $p.innerHTML=$caption.innerHTML;
      $caption.innerHTML='';
      $caption.appendChild($p);
    }

  })
}

function isEmbedUrl(url, urlList){
  return urlList && urlList.find((link) => url.startsWith(link));
}

function decorateEmbeds() {

  const urlList = {
    'youtube': ['https://www.youtube.com/watch', 'https://www.youtu.be', 'https://youtu.be', 'https://www.youtube.com/embed'],
    'vimeo': ['https://www.vimeo.com', 'https://player.vimeo.com/video/', 'https://vimeo.com'],
    'instagram': ['https://www.instagram.com/'],
    'adobe': ['https://video.tv.adobe.com/v/'],
    'twitter': ['https://twitter.com', 'https://www.twitter.com']
  }

  document.querySelectorAll('.block-embed a[href]').forEach(($a) => {
    const url = new URL($a.href.replace(/\/$/, ''));
    const usp=new URLSearchParams(url.search);
    const hostname = url.hostname;
    let firstLvl = hostname.split('.').reverse()[1];
    let embedHTML='';
    let type='';

    firstLvl = firstLvl === 'youtu' ? 'youtube' : firstLvl;
    if (firstLvl === 'youtube' && isEmbedUrl($a.href, urlList[firstLvl])) {
      let vid=usp.get('v');
      if(!vid){
        const videoId = url.pathname.split('/').slice(-1)[0];
        const qpIndex = videoId.indexOf('?');
        vid = qpIndex > 0 ? videoId.subst(0, qpIndex+1) : videoId;
      }
      embedHTML=`<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
      <iframe src="https://www.youtube.com/embed/${vid}?rel=0&amp;v=${vid}" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" allowfullscreen="" scrolling="no" allow="encrypted-media; accelerometer; gyroscope; picture-in-picture" title="content from youtube" loading="lazy"></iframe>
      </div>
    `
      type = 'youtube';
    }

    if(firstLvl === 'instagram' && isEmbedUrl($a.href, urlList[firstLvl])) {
      const location = window.location.href;
      embedHTML=`
        <div style="width: 100%; position: relative; padding-bottom: 56.25%; display: flex; justify-content: center">
        <iframe class="instagram-media instagram-media-rendered" id="instagram-embed-0" src="${url.href}/embed/?cr=1&amp;v=13&amp;wp=1316&amp;rd=${location.endsWith('.html') ? location : location + '.html'}"
        allowtransparency="true" allowfullscreen="true" frameborder="0" height="530" style="background: white; border-radius: 3px; border: 1px solid rgb(219, 219, 219);
        box-shadow: none; display: block;">
        </iframe>
        </div>`;
      type='instagram';
    }

    const vimeoPlayerFlag = url.href.startsWith('https://player.vimeo.com/video/');
    if (firstLvl === 'vimeo' && isEmbedUrl($a.href, urlList[firstLvl])) {
      const linkArr = url.href.split('/');
      const video = linkArr ? linkArr[3] : linkArr;
      embedHTML=`
        <div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
        <iframe src="${vimeoPlayerFlag ? url.href : `https://player.vimeo.com/video/${video}`}?byline=0&badge=0&portrait=0&title=0" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;"
        allowfullscreen="" scrolling="no" allow="encrypted-media" title="content from vimeo" loading="lazy">
        </iframe>
        </div>`
        type='vimeo-player';
    }

    if (firstLvl === 'adobe' && isEmbedUrl($a.href, urlList[firstLvl])) {
      embedHTML=`
        <div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
        <iframe src="${url.href}" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" allowfullscreen=""
        scrolling="no" allow="encrypted-media" title="content from adobe" loading="lazy">
        </iframe>
        </div>`
        type='adobe-tv';
    }

    if(firstLvl === 'twitter' && isEmbedUrl($a.href, urlList[firstLvl])) {
      embedHTML = `
        <blockquote class="twitter-tweet" data-dnt="true" align="center">
        <a href="${url}"></a></blockquote>
      `
      loadScript("https://platform.twitter.com/widgets.js");
      type = 'twitter';
    }

    if (type) {
      const $embed=createTag('div', {class: `embed embed-oembed embed-${type}`});
      const $div=$a.closest('.block-embed');
      $embed.innerHTML=embedHTML;
      $div.parentElement.replaceChild($embed, $div);
    }

  })

  document.querySelectorAll('.post-page .post-body .embed').forEach(($e) => {
    const $next=$e.nextElementSibling;
    if ($next && $next.tagName=='P') {
      const inner=$next.innerHTML.trim();
      if (inner.startsWith('<em>')) {
        $next.classList.add('legend');
        }
      }
  })

}

function decorateAnimations() {
  document.querySelectorAll('.animation a[href], .video a[href]').forEach(($a) => {
    let href=$a.getAttribute('href');
    const url=new URL(href);
    const helixId=url.pathname.split('/')[2];
    const $parent=$a.parentNode;

    $parent.classList.add('images');

    if (href.endsWith('.mp4')) {
      const isAnimation=$a.closest('.animation')?true:false;

      let attribs={controls:''};
      if (isAnimation) {
        attribs={playsinline:'', autoplay:'', loop:'', muted:''};
      }
      const $poster=$a.closest('div').querySelector('img');
      if ($poster) {
        attribs.poster=$poster.src;
        $poster.remove();
      }

      const $video=createTag('video', attribs);
      if (href.startsWith('https://hlx.blob.core.windows.net/external/')) {
        href='/media_'+href.split('/')[4].replace('#image','');
      }
      $video.innerHTML=`<source src="${href}" type="video/mp4">`;
      $a.parentNode.replaceChild($video, $a);
      if (isAnimation) {
          $video.addEventListener('canplay', (evt) => {
            $video.muted=true;
            $video.play() });
      }
    }

    if (href.endsWith('.gif')) {
      $a.parentNode.replaceChild(createTag('img',{src: `/media_${helixId}.gif`}), $a);
    }

    const $next=$parent.nextElementSibling;
    if ($next && $next.tagName=='P' && $next.innerHTML.trim().startsWith('<em>')) $next.classList.add('legend');
  });

  const $heroAnimation = document.querySelector('.hero-animation a[href]');
  if ($heroAnimation) {
    const href=$heroAnimation.getAttribute('href');
    const $video=createTag('video', {playsinline:'', autoplay:'', loop:'', muted:''});
    $video.innerHTML=`<source src="${href}" type="video/mp4">`;
    $heroAnimation.parentElement.remove();
    const $heroImg=document.querySelector('main .hero-image img');
    $heroImg.parentNode.replaceChild($video, $heroImg);

    $video.addEventListener('canplay', (evt) => {
      $video.muted=true;
      $video.play() });
  }
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

async function decoratePromotions() {
  document.querySelectorAll('main .promotion').forEach(async ($promotion) => {
    const $a = $promotion.querySelector('a');
    if ($a && $a.href) {
      const promoURL = new URL($a.href).pathname.split('.')[0];
      const resp = await fetch(`${promoURL}.plain.html`);
      const main = await resp.text();
      const $promo = createTag('div', {class: 'embed embed-internal embed-internal-promotions'});
      $promo.innerHTML = `<div><div class="embed-promotions-text">${main}</div></div>`;
      const $img = $promo.querySelector('img');
      $img.src = $img.src + '?auto=webp&format=pjpg&optimize=medium&width=160';
      $img.setAttribute('loading', 'lazy');
      $promo.children[0].prepend($img.parentNode);
      console.log($promo.innerHTML);
      $promotion.parentElement.replaceChild($promo, $promotion);
    }
  });
}

function addPublishDependencies() {
  const path = window.location.pathname;
  if (!/\d{4}\/\d{2}\/\d{2}/.test(path)) {
    // skip posts without date in URL
    return;
  }
  // sidekick will publish post paths with /publish only
  // also add the path without /publish for legacy reasons
  window.hlx = window.hlx || {};
  window.hlx.dependencies = [path.replace('/publish/', '/')];
}


window.addEventListener('load', async function() {
  decoratePostPage();
  handleImmediateMetadata();
  decorateImages();
  decorateTables();
  decorateAnimations();
  decorateEmbeds();
  decorateLinkedImages();
  decorateInfographic();
  decorateCaptions();
  addInterLinks().then(() => handleLinks());
  fetchAuthor();
  await handleAsyncMetadata();
  await addCategory();
  await addTopics();
  decoratePromotions();
  loadGetSocial();
  shapeBanners();
  fetchArticles();
  addPublishDependencies();
});
