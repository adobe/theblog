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

const DEFAULT_AVATAR = '/hlx_942ea2ad17270c65cda838d52145ec5b26704d41.png';

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
    window.blog.date = d && d.length > 0 ? formatLocalDate(d[0]) : '';
    if (window.blog.date) window.blog.rawDate = d[0];
  }
  
  extractTopicsAndProducts();

  addMetaTags([{
    property: 'og:locale',
    content: window.blog.language,
  },{
    property: 'article:published_time',
    content: window.blog.date ? new Date(window.blog.date).toISOString() : '',
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
  const response = await fetch('/en/keywords.json');
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
    const pageURL = getLink(window.blog.TYPE.AUTHOR, window.blog.author);
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
    const $pCheck = $caption.querySelector('p');
    if ($pCheck) {
      $caption('p').forEach(($p) => {
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
function decorateEmbeds() {

  document.querySelectorAll('.block-embed a[href]').forEach(($a) => {
    const url=$a.href.replace(/\/$/, '');
    const usp=new URLSearchParams(url.search);
    let embedHTML='';
    let type='';

    if ($a.href.startsWith('https://www.youtube.com/watch')) {
      const vid=usp.get('v');
      embedHTML=`<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
        <iframe src="https://www.youtube.com/embed/${vid}?rel=0&amp;v=${vid}" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" allowfullscreen="" scrolling="no" allow="encrypted-media; accelerometer; gyroscope; picture-in-picture" title="content from youtube" loading="lazy"></iframe>
        </div>
      `;
      type = 'youtube';
    }

    if($a.href.startsWith('https://www.instagram.com/')) {
      const location = window.location.href;
      embedHTML=`
        <div>
        <blockquote class="instagram-media" data-instgrm-permalink="${url}/?utm_source=ig_embed&amp;utm_campaign=loading" data-instgrm-version="13" 
        style=" background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 1px; max-width:658px; min-width:326px; padding:0; width:99.375%; width:-webkit-calc(100% - 2px); width:calc(100% - 2px);">
        <div style="padding:16px;"> <a href="https://www.instagram.com/p/B-VZv2YH3BG/?utm_source=ig_embed&amp;utm_campaign=loading" style=" background:#FFFFFF; line-height:0; padding:0 0; text-align:center; text-decoration:none; width:100%;" target="_blank"> <div style=" display: flex; flex-direction: row; align-items: center;"> 
        <div style="background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 40px; margin-right: 14px; width: 40px;"></div> 
        <div style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center;"> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; margin-bottom: 6px; width: 100px;"></div> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; width: 60px;"></div></div></div>
        <div style="padding: 19% 0;"></div> <div style="display:block; height:50px; margin:0 auto 12px; width:50px;"><svg width="50px" height="50px" viewBox="0 0 60 60" version="1.1" 
        xmlns="https://www.w3.org/2000/svg" xmlns:xlink="https://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-511.000000, -20.000000)" fill="#000000"><g>
        <path d="M556.869,30.41 C554.814,30.41 553.148,32.076 553.148,34.131 C553.148,36.186 554.814,37.852 556.869,37.852 C558.924,37.852 560.59,36.186 560.59,34.131 C560.59,32.076 558.924,30.41 556.869,30.41 M541,60.657 C535.114,60.657 530.342,55.887 530.342,50 C530.342,44.114 535.114,39.342 541,39.342 C546.887,39.342 551.658,44.114 551.658,50 C551.658,55.887
         546.887,60.657 541,60.657 M541,33.886 C532.1,33.886 524.886,41.1 524.886,50 C524.886,58.899 532.1,66.113 541,66.113 C549.9,66.113 557.115,58.899 557.115,50 C557.115,41.1 549.9,33.886 541,33.886 M565.378,62.101 C565.244,65.022 564.756,66.606 564.346,67.663 C563.803,69.06 563.154,70.057 562.106,71.106 C561.058,72.155 560.06,72.803 558.662,73.347 C557.607,73.757 
         556.021,74.244 553.102,74.378 C549.944,74.521 548.997,74.552 541,74.552 C533.003,74.552 532.056,74.521 528.898,74.378 C525.979,74.244 524.393,73.757 523.338,73.347 C521.94,72.803 520.942,72.155 519.894,71.106 C518.846,70.057 518.197,69.06 517.654,67.663 C517.244,66.606 516.755,65.022 516.623,62.101 C516.479,58.943 516.448,57.996 516.448,50 C516.448,42.003 516.479,41.056 
         516.623,37.899 C516.755,34.978 517.244,33.391 517.654,32.338 C518.197,30.938 518.846,29.942 519.894,28.894 C520.942,27.846 521.94,27.196 523.338,26.654 C524.393,26.244 525.979,25.756 528.898,25.623 C532.057,25.479 533.004,25.448 541,25.448 C548.997,25.448 549.943,25.479 553.102,25.623 C556.021,25.756 557.607,26.244 558.662,26.654 C560.06,27.196 561.058,27.846 562.106,28.894 
         C563.154,29.942 563.803,30.938 564.346,32.338 C564.756,33.391 565.244,34.978 565.378,37.899 C565.522,41.056 565.552,42.003 565.552,50 C565.552,57.996 565.522,58.943 565.378,62.101 M570.82,37.631 C570.674,34.438 570.167,32.258 569.425,30.349 C568.659,28.377 567.633,26.702 565.965,25.035 C564.297,23.368 562.623,22.342 560.652,21.575 C558.743,20.834 556.562,20.326 553.369,20.18 
         C550.169,20.033 549.148,20 541,20 C532.853,20 531.831,20.033 528.631,20.18 C525.438,20.326 523.257,20.834 521.349,21.575 C519.376,22.342 517.703,23.368 516.035,25.035 C514.368,26.702 513.342,28.377 512.574,30.349 C511.834,32.258 511.326,34.438 511.181,37.631 C511.035,40.831 511,41.851 511,50 C511,58.147 511.035,59.17 511.181,62.369 C511.326,65.562 511.834,67.743 512.574,69.651 
         C513.342,71.625 514.368,73.296 516.035,74.965 C517.703,76.634 519.376,77.658 521.349,78.425 C523.257,79.167 525.438,79.673 528.631,79.82 C531.831,79.965 532.853,80.001 541,80.001 C549.148,80.001 550.169,79.965 553.369,79.82 C556.562,79.673 558.743,79.167 560.652,78.425 C562.623,77.658 564.297,76.634 565.965,74.965 C567.633,73.296 568.659,71.625 569.425,69.651 C570.167,67.743 570.674,
         65.562 570.82,62.369 C570.966,59.17 571,58.147 571,50 C571,41.851 570.966,40.831 570.82,37.631"></path></g></g></g></svg></div><div style="padding-top: 8px;"> <div style=" color:#3897f0; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:550; line-height:18px;"> View this post on Instagram</div></div><div style="padding: 12.5% 0;"></div> <div style="display: 
         flex; flex-direction: row; margin-bottom: 14px; align-items: center;"><div> <div style="background-color: #F4F4F4; border-radius: 50%; height: 12.5px; width: 12.5px; transform: translateX(0px) translateY(7px);"></div> <div style="background-color: #F4F4F4; height: 12.5px; transform: rotate(-45deg) translateX(3px) translateY(1px); width: 12.5px; flex-grow: 0; margin-right: 14px; margin-left: 2px;">
         </div> <div style="background-color: #F4F4F4; border-radius: 50%; height: 12.5px; width: 12.5px; transform: translateX(9px) translateY(-18px);"></div></div>
        <div style="margin-left: 8px;"> <div style=" background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 20px; width: 20px;"></div> <div style=" width: 0; height: 0; border-top: 2px solid transparent; border-left: 6px solid #f4f4f4; border-bottom: 2px solid transparent; transform: translateX(16px) translateY(-4px) rotate(30deg)"></div></div><div style="margin-left: auto;"> <div style=" width: 0px; 
        border-top: 8px solid #F4F4F4; border-right: 8px solid transparent; transform: translateY(16px);"></div> <div style=" background-color: #F4F4F4; flex-grow: 0; height: 12px; width: 16px; transform: translateY(-4px);"></div> <div style=" width: 0; height: 0; border-top: 8px solid #F4F4F4; border-left: 8px solid transparent; transform: translateY(-4px) translateX(8px);"></div></div></div> <div style="display: flex; 
        flex-direction: column; flex-grow: 1; justify-content: center; margin-bottom: 24px;"> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; margin-bottom: 6px; width: 224px;"></div> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; width: 144px;"></div></div></a><p style=" color:#c9c8cd; font-family:Arial,sans-serif; font-size:14px; line-height:17px; 
        margin-bottom:0; margin-top:8px; overflow:hidden; padding:8px 0 7px; text-align:center; text-overflow:ellipsis; white-space:nowrap;"><a href="https://www.instagram.com/p/B-VZv2YH3BG/?utm_source=ig_embed&amp;utm_campaign=loading" style=" color:#c9c8cd; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:normal; line-height:17px; text-decoration:none;" target="_blank">A post shared by Erin Kim (@langmunt)</a></p></div></blockquote>
        <script async src="//platform.instagram.com/en_US/embeds.js"></script>
        </div>`;
      type='instagram';
    }

    const vimeoPlayerFlag = $a.href.startsWith('https://player.vimeo.com/video/');
    if (vimeoPlayerFlag || $a.href.startsWith('https://vimeo.com')) {
      const linkArr = $a.href.split('/');
      const video = linkArr ? linkArr[3] : linkArr;
      embedHTML=`
        <div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
        <iframe src="${vimeoPlayerFlag ? url : `https://player.vimeo.com/video/${video}`}?byline=0&badge=0&portrait=0&title=0" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" 
        allowfullscreen="" scrolling="no" allow="encrypted-media" title="content from vimeo" loading="lazy">
        </iframe>
        </div>`
        type='vimeo-player';
    }

    if ($a.href.startsWith('https://video.tv.adobe.com/v/')) {
      embedHTML=`
        <div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
        <iframe src="${url}" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" allowfullscreen="" 
        scrolling="no" allow="encrypted-media" title="content from adobe" loading="lazy">
        </iframe>
        </div>`
        type='adobe-tv';
    }
 
    if (type) {
      const $embed=createTag('div', {class: `embed embed-oembed embed-${type}`});
      const $div=$a.closest('div');
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
        href='/hlx_'+href.split('/')[4].replace('#image','');
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
      $a.parentNode.replaceChild(createTag('img',{src: `/hlx_${helixId}.gif`}), $a);  
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
  loadGetSocial();
  shapeBanners();
  fetchArticles();
  addPublishDependencies();
});
