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

  // store products as topics
  let products, productContainer;
  Array.from(last.children).forEach((i) => {
    const r = /^Products\: ?(.*)$/gmi.exec(i.innerText);
    if (r && r.length > 0) {
      products = r[1].split(/\,\s*/);
      productContainer = i;
    }
  });
  window.blog.topics = window.blog.topics.concat(products
    ? products.filter((product) => product.length > 0)
    : []);
  if (productContainer) {
    productContainer.remove();
  }
  if (last.innerText.trim() === '') {
    last.remove(); // remove empty last div
  }

  addMetaTags([{
    property: 'og:locale',
    content: window.blog.language,
  },{
    property: 'article:published_time',
    content: window.blog.date ? new Date(window.blog.date).toISOString() : '',
  }]);
}

/**
 * Retrieves parents of specified topic from the taxonomy.
 */
function getParentTopics(taxonomy, topics) {
  let parentTopics = [];
  topics.forEach((topic) => {
    const parents = taxonomy.getParents(topic);
    if (parents && parents.length > 0) {
      parentTopics = parentTopics.concat(parents);
    }
  });
  return parentTopics;
}

/**
 * Finds user facing topics to display, and adds both user and non user facing topics as meta tags.
 */
async function handleAsyncMetadata() {
  const taxonomy = await getTaxonomy();
  
  // de-dupe UFT, NUFT + parents
  const allTopics = Array.from(new Set([
    ...window.blog.topics,
    ...getParentTopics(taxonomy, window.blog.topics),
  ]));

  // add all topics as article:tags
  addMetaTags(allTopics
    .filter((topic) => !taxonomy.skipMeta(topic))
    .map((topic) => {
      return {
        property: 'article:tag',
        content: topic,
      }
    }));

  // filter out NUFT
  window.blog.topics = allTopics
    .filter(topic => taxonomy.isUFT(topic));
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
    const filename=(segs[segs.length-1].split('.')[0]).toLowerCase().replace(/[^a-z\d_\/\.]/g,'-');
    const url=`https://blog.adobe.com/${segs[1]}${datePath}/${filename}.html`;
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
 */	
function checkAndAddMatch(matches, contender) {	
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
  if (collisions.length === 0) {	
    // no intersecting existing matches, add contender	
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
    const articleBody = document.querySelector('main').textContent.toLowerCase();
    const keywords = (Array.isArray(json) ? json : json.data)
      // scan article to filter keywords down to relevant ones
      .filter(({ Keyword }) => articleBody.indexOf(Keyword.toLowerCase()) !== -1)
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

    // find exact text node matches and insert links (exclude headings and anchors)
    document.querySelectorAll('main > div > *:not(h1):not(h2):not(h3):not(h4):not(h5):not(a)').forEach((p) => {
      if (keywords.length === 0) return;
      const textNodes = Array.from(p.childNodes)
        // filter out non text nodes  
        .filter(node => node.nodeType === Node.TEXT_NODE)
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
              });
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
              });
              a.appendChild(document.createTextNode(text.substring(start, end)));
              p.insertBefore(a, textNode.nextSibling);
              p.insertBefore(document.createTextNode(text.substring(end)), a.nextSibling);
              textNode.nodeValue = text.substring(0, start);
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
  if (!window.blog.topics || window.blog.topics.length === 0) return;
  const topic = window.blog.topics[0];
  const categoryWrap = document.createElement('div');
  const taxonomy = await getTaxonomy();
  const href = taxonomy.getLink(topic) || getLink(window.blog.TYPE.TOPIC, topic.replace(/\s/gm, '-').toLowerCase());
  categoryWrap.className = 'category';
  categoryWrap.innerHTML = `<a href="${href}" title="${topic}">${topic}</a>`;
  document.querySelector('main .post-header').prepend(categoryWrap);
}

/**
 * Adds buttons for all topics to the bottom of the post
 */
async function addTopics() {
  if (!window.blog.topics || window.blog.topics.length === 0) return;
  const topicsWrap = createTag('div', { 'class' : 'topics' });
  const taxonomy = await getTaxonomy();
  // use alphabetically sorted copy
  Array.from(window.blog.topics).sort((a, b) => a.localeCompare(b)).forEach((topic) => {
    const href = taxonomy.getLink(topic) || getLink(window.blog.TYPE.TOPIC, topic.replace(/\s/gm, '-').toLowerCase());
    const btn = createTag('a', {
      href,
      title: topic,
    });
    btn.innerText = topic;
    topicsWrap.appendChild(btn);
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
    $a.innerHTML='';
    $a.appendChild($img);
    $p.remove();
  });
}

function decorateLinkedImages() {
  document.querySelectorAll('.linked-image img').forEach(($img) => {
    const $div=$img.closest('.linked-image');
    const $p=$img.parentNode;
    const $a=$div.querySelector('a');
    $a.innerHTML='';
    $a.appendChild($img);
    $p.remove();
    $div.className='images';
  });
}

function decorateEmbeds() {

  document.querySelectorAll('.block-embed a[href]').forEach(($a) => {
    const url=new URL($a.href);
    const usp=new URLSearchParams(url.search);
    let embedHTML='';
    let type='';

    if ($a.href.startsWith('https://video.tv.adobe.com/v/')) {
      embedHTML=`
        <div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
        <iframe src="${$a.href}" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" allowfullscreen="" scrolling="no" allow="encrypted-media" title="content from adobe" loading="lazy">
        </iframe>
        </div>`
        type='adobe-tv';
    }
    
    if ($a.href.startsWith('https://www.youtube.com/watch')) {
      const vid=usp.get('v');
      
      type='youtube';
      embedHTML=`<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
        <iframe src="https://www.youtube.com/embed/${vid}?rel=0&amp;v=${vid}" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" allowfullscreen="" scrolling="no" allow="encrypted-media; accelerometer; gyroscope; picture-in-picture" title="content from youtube" loading="lazy"></iframe>
        </div>
      `;
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
  document.querySelectorAll('.animation a[href]').forEach(($a) => {
    let href=$a.getAttribute('href');
    const url=new URL(href);
    const helixId=url.pathname.split('/')[2];
    const $parent=$a.parentNode;

    $parent.classList.add('images');

    if (href.endsWith('.mp4')) {
      const $video=createTag('video', {playsinline:'', autoplay:'', loop:'', muted:''});
      if (href.startsWith('https://hlx.blob.core.windows.net/external/')) {
        href='/hlx_'+href.split('/')[4].replace('#image','');
      }
      $video.innerHTML=`<source src="${href}" type="video/mp4">`;
      $a.parentNode.replaceChild($video, $a);
      $video.addEventListener('canplay', (evt) => { 
        $video.muted=true;
        $video.play() });
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

window.addEventListener('load', async function() {
  decoratePostPage();
  handleImmediateMetadata();
  decorateImages();
  decorateTables();
  decorateAnimations();
  decorateEmbeds();
  decorateLinkedImages();
  decorateInfographic();
  addInterLinks().then(() => handleLinks());
  addPredictedPublishURL();
  await addCategory();
  fetchAuthor();
  await handleAsyncMetadata();
  await addTopics();
  loadGetSocial();
  shapeBanners();
  fetchArticles();
});
