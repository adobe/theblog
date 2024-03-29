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
  getTaxonomy
} from '/scripts/taxonomy.js';

 /*
 * lazysizes - v5.2.0
 * The MIT License (MIT)
 * Copyright (c) 2015 Alexander Farkas
 */
!function(a,b){var c=b(a,a.document,Date);a.lazySizes=c,"object"==typeof module&&module.exports&&(module.exports=c)}("undefined"!=typeof window?window:{},function(a,b,c){"use strict";var d,e;if(function(){var b,c={lazyClass:"lazyload",loadedClass:"lazyloaded",loadingClass:"lazyloading",preloadClass:"lazypreload",errorClass:"lazyerror",autosizesClass:"lazyautosizes",srcAttr:"data-src",srcsetAttr:"data-srcset",sizesAttr:"data-sizes",minSize:40,customMedia:{},init:!0,expFactor:1.5,hFac:.8,loadMode:2,loadHidden:!0,ricTimeout:0,throttleDelay:125};e=a.lazySizesConfig||a.lazysizesConfig||{};for(b in c)b in e||(e[b]=c[b])}(),!b||!b.getElementsByClassName)return{init:function(){},cfg:e,noSupport:!0};var f=b.documentElement,g=a.HTMLPictureElement,h="addEventListener",i="getAttribute",j=a[h].bind(a),k=a.setTimeout,l=a.requestAnimationFrame||k,m=a.requestIdleCallback,n=/^picture$/i,o=["load","error","lazyincluded","_lazyloaded"],p={},q=Array.prototype.forEach,r=function(a,b){return p[b]||(p[b]=new RegExp("(\\s|^)"+b+"(\\s|$)")),p[b].test(a[i]("class")||"")&&p[b]},s=function(a,b){r(a,b)||a.setAttribute("class",(a[i]("class")||"").trim()+" "+b)},t=function(a,b){var c;(c=r(a,b))&&a.setAttribute("class",(a[i]("class")||"").replace(c," "))},u=function(a,b,c){var d=c?h:"removeEventListener";c&&u(a,b),o.forEach(function(c){a[d](c,b)})},v=function(a,c,e,f,g){var h=b.createEvent("Event");return e||(e={}),e.instance=d,h.initEvent(c,!f,!g),h.detail=e,a.dispatchEvent(h),h},w=function(b,c){var d;!g&&(d=a.picturefill||e.pf)?(c&&c.src&&!b[i]("srcset")&&b.setAttribute("srcset",c.src),d({reevaluate:!0,elements:[b]})):c&&c.src&&(b.src=c.src)},x=function(a,b){return(getComputedStyle(a,null)||{})[b]},y=function(a,b,c){for(c=c||a.offsetWidth;c<e.minSize&&b&&!a._lazysizesWidth;)c=b.offsetWidth,b=b.parentNode;return c},z=function(){var a,c,d=[],e=[],f=d,g=function(){var b=f;for(f=d.length?e:d,a=!0,c=!1;b.length;)b.shift()();a=!1},h=function(d,e){a&&!e?d.apply(this,arguments):(f.push(d),c||(c=!0,(b.hidden?k:l)(g)))};return h._lsFlush=g,h}(),A=function(a,b){return b?function(){z(a)}:function(){var b=this,c=arguments;z(function(){a.apply(b,c)})}},B=function(a){var b,d=0,f=e.throttleDelay,g=e.ricTimeout,h=function(){b=!1,d=c.now(),a()},i=m&&g>49?function(){m(h,{timeout:g}),g!==e.ricTimeout&&(g=e.ricTimeout)}:A(function(){k(h)},!0);return function(a){var e;(a=!0===a)&&(g=33),b||(b=!0,e=f-(c.now()-d),e<0&&(e=0),a||e<9?i():k(i,e))}},C=function(a){var b,d,e=99,f=function(){b=null,a()},g=function(){var a=c.now()-d;a<e?k(g,e-a):(m||f)(f)};return function(){d=c.now(),b||(b=k(g,e))}},D=function(){var g,m,o,p,y,D,F,G,H,I,J,K,L=/^img$/i,M=/^iframe$/i,N="onscroll"in a&&!/(gle|ing)bot/.test(navigator.userAgent),O=0,P=0,Q=0,R=-1,S=function(a){Q--,(!a||Q<0||!a.target)&&(Q=0)},T=function(a){return null==K&&(K="hidden"==x(b.body,"visibility")),K||!("hidden"==x(a.parentNode,"visibility")&&"hidden"==x(a,"visibility"))},U=function(a,c){var d,e=a,g=T(a);for(G-=c,J+=c,H-=c,I+=c;g&&(e=e.offsetParent)&&e!=b.body&&e!=f;)(g=(x(e,"opacity")||1)>0)&&"visible"!=x(e,"overflow")&&(d=e.getBoundingClientRect(),g=I>d.left&&H<d.right&&J>d.top-1&&G<d.bottom+1);return g},V=function(){var a,c,h,j,k,l,n,o,q,r,s,t,u=d.elements;if((p=e.loadMode)&&Q<8&&(a=u.length)){for(c=0,R++;c<a;c++)if(u[c]&&!u[c]._lazyRace)if(!N||d.prematureUnveil&&d.prematureUnveil(u[c]))ba(u[c]);else if((o=u[c][i]("data-expand"))&&(l=1*o)||(l=P),r||(r=!e.expand||e.expand<1?f.clientHeight>500&&f.clientWidth>500?500:370:e.expand,d._defEx=r,s=r*e.expFactor,t=e.hFac,K=null,P<s&&Q<1&&R>2&&p>2&&!b.hidden?(P=s,R=0):P=p>1&&R>1&&Q<6?r:O),q!==l&&(D=innerWidth+l*t,F=innerHeight+l,n=-1*l,q=l),h=u[c].getBoundingClientRect(),(J=h.bottom)>=n&&(G=h.top)<=F&&(I=h.right)>=n*t&&(H=h.left)<=D&&(J||I||H||G)&&(e.loadHidden||T(u[c]))&&(m&&Q<3&&!o&&(p<3||R<4)||U(u[c],l))){if(ba(u[c]),k=!0,Q>9)break}else!k&&m&&!j&&Q<4&&R<4&&p>2&&(g[0]||e.preloadAfterLoad)&&(g[0]||!o&&(J||I||H||G||"auto"!=u[c][i](e.sizesAttr)))&&(j=g[0]||u[c]);j&&!k&&ba(j)}},W=B(V),X=function(a){var b=a.target;if(b._lazyCache)return void delete b._lazyCache;S(a),s(b,e.loadedClass),t(b,e.loadingClass),u(b,Z),v(b,"lazyloaded")},Y=A(X),Z=function(a){Y({target:a.target})},$=function(a,b){try{a.contentWindow.location.replace(b)}catch(c){a.src=b}},_=function(a){var b,c=a[i](e.srcsetAttr);(b=e.customMedia[a[i]("data-media")||a[i]("media")])&&a.setAttribute("media",b),c&&a.setAttribute("srcset",c)},aa=A(function(a,b,c,d,f){var g,h,j,l,m,p;(m=v(a,"lazybeforeunveil",b)).defaultPrevented||(d&&(c?s(a,e.autosizesClass):a.setAttribute("sizes",d)),h=a[i](e.srcsetAttr),g=a[i](e.srcAttr),f&&(j=a.parentNode,l=j&&n.test(j.nodeName||"")),p=b.firesLoad||"src"in a&&(h||g||l),m={target:a},s(a,e.loadingClass),p&&(clearTimeout(o),o=k(S,2500),u(a,Z,!0)),l&&q.call(j.getElementsByTagName("source"),_),h?a.setAttribute("srcset",h):g&&!l&&(M.test(a.nodeName)?$(a,g):a.src=g),f&&(h||l)&&w(a,{src:g})),a._lazyRace&&delete a._lazyRace,t(a,e.lazyClass),z(function(){var b=a.complete&&a.naturalWidth>1;p&&!b||(b&&s(a,"ls-is-cached"),X(m),a._lazyCache=!0,k(function(){"_lazyCache"in a&&delete a._lazyCache},9)),"lazy"==a.loading&&Q--},!0)}),ba=function(a){if(!a._lazyRace){var b,c=L.test(a.nodeName),d=c&&(a[i](e.sizesAttr)||a[i]("sizes")),f="auto"==d;(!f&&m||!c||!a[i]("src")&&!a.srcset||a.complete||r(a,e.errorClass)||!r(a,e.lazyClass))&&(b=v(a,"lazyunveilread").detail,f&&E.updateElem(a,!0,a.offsetWidth),a._lazyRace=!0,Q++,aa(a,b,f,d,c))}},ca=C(function(){e.loadMode=3,W()}),da=function(){3==e.loadMode&&(e.loadMode=2),ca()},ea=function(){if(!m){if(c.now()-y<999)return void k(ea,999);m=!0,e.loadMode=3,W(),j("scroll",da,!0)}};return{_:function(){y=c.now(),d.elements=b.getElementsByClassName(e.lazyClass),g=b.getElementsByClassName(e.lazyClass+" "+e.preloadClass),j("scroll",W,!0),j("resize",W,!0),j("pageshow",function(a){if(a.persisted){var c=b.querySelectorAll("."+e.loadingClass);c.length&&c.forEach&&l(function(){c.forEach(function(a){a.complete&&ba(a)})})}}),a.MutationObserver?new MutationObserver(W).observe(f,{childList:!0,subtree:!0,attributes:!0}):(f[h]("DOMNodeInserted",W,!0),f[h]("DOMAttrModified",W,!0),setInterval(W,999)),j("hashchange",W,!0),["focus","mouseover","click","load","transitionend","animationend"].forEach(function(a){b[h](a,W,!0)}),/d$|^c/.test(b.readyState)?ea():(j("load",ea),b[h]("DOMContentLoaded",W),k(ea,2e4)),d.elements.length?(V(),z._lsFlush()):W()},checkElems:W,unveil:ba,_aLSL:da}}(),E=function(){var a,c=A(function(a,b,c,d){var e,f,g;if(a._lazysizesWidth=d,d+="px",a.setAttribute("sizes",d),n.test(b.nodeName||""))for(e=b.getElementsByTagName("source"),f=0,g=e.length;f<g;f++)e[f].setAttribute("sizes",d);c.detail.dataAttr||w(a,c.detail)}),d=function(a,b,d){var e,f=a.parentNode;f&&(d=y(a,f,d),e=v(a,"lazybeforesizes",{width:d,dataAttr:!!b}),e.defaultPrevented||(d=e.detail.width)&&d!==a._lazysizesWidth&&c(a,f,e,d))},f=function(){var b,c=a.length;if(c)for(b=0;b<c;b++)d(a[b])},g=C(f);return{_:function(){a=b.getElementsByClassName(e.autosizesClass),j("resize",g)},checkElems:g,updateElem:d}}(),F=function(){!F.i&&b.getElementsByClassName&&(F.i=!0,E._(),D._())};return k(function(){e.init&&F()}),d={cfg:e,autoSizer:E,loader:D,init:F,uP:w,aC:s,rC:t,hC:r,fire:v,gW:y,rAF:z}});

/**
 * Returns <code>true</code> if host is localhost, else <code.false</code>.
 */
function isLocalhost() {
  return location.hostname === 'localhost' || location.hostname === '127.0.0.1';
}

/**
 * Creates a tag with the given name and attributes.
 * @param {string} name The tag name
 * @param {object} attrs An object containing the attributes
 * @returns The new tag
 */
export function createTag(name, attrs) {
  const el = document.createElement(name);
  if (typeof attrs === 'object') {
    for (let [key, value] of Object.entries(attrs)) {
      el.setAttribute(key, value);
    }
  }
  return el;
}

function supportsWebp() {
  return window.webpSupport;
}

// Google official webp detection
function checkWebpFeature(callback) {
  const webpSupport = sessionStorage.getItem('webpSupport');
  if (!webpSupport) {
    const kTestImages = 'UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA';
    const img = new Image();
    img.onload = () => {
      const result = (img.width > 0) && (img.height > 0);
      window.webpSupport = result;
      sessionStorage.setItem('webpSupport', result);
      callback();
    };
    img.onerror = () => {
      sessionStorage.setItem('webpSupport', false);
      window.webpSupport = false;
      callback();
    };
    img.src = `data:image/webp;base64,${kTestImages}`;
  } else {
    window.webpSupport = (webpSupport === 'true');
    callback();
  }
}

export function getOptimizedImageURL(src) {
  const url = new URL(src, window.location.href);
  let result = src;
  const { pathname, search } = url;
  if (pathname.includes('media_')) {
    const usp = new URLSearchParams(search);
    usp.delete('auto');
    if (!supportsWebp()) {
      if (pathname.endsWith('.png')) {
        usp.set('format', 'png');
      } else if (pathname.endsWith('.gif')) {
        usp.set('format', 'gif');
      } else {
        usp.set('format', 'pjpg');
      }
    } else {
      usp.set('format', 'webply');
    }
    result = `${src.split('?')[0]}?${usp.toString()}`;
  }
  return (result);
}

function resetAttribute($elem, attrib) {
  const src = $elem.getAttribute(attrib);
  if (src) {
    const oSrc = getOptimizedImageURL(src);
    if (oSrc !== src) {
      $elem.setAttribute(attrib, oSrc);
    }
  }
}

export function webpPolyfill(element) {
  if (!supportsWebp()) {
    element.querySelectorAll('img').forEach(($img) => {
      resetAttribute($img, 'src');
    });
    element.querySelectorAll('picture source').forEach(($source) => {
      resetAttribute($source, 'srcset');
    });
  }
}

export function loadScript(url, callback, type) {
  const $head = document.querySelector('head');
  const $script = createTag('script', { src: url });
  if (type) {
    $script.setAttribute('type', type);
  }
  $head.append($script);
  $script.onload = callback;
  return $script;
}

/**
 * Wraps nodes with a new parent node.
 * @param {node} newparent The new parent node
 * @param {array} nodes The nodes to wrap
 */
export function wrapNodes(newparent, nodes) {
  nodes.forEach((el, index) => {
    newparent.appendChild(el.cloneNode(true));
    if (newparent.children.length !== 1) {
      el.parentNode.removeChild(el);
    } else {
      el.parentNode.replaceChild(newparent, el);
    }
  });
}

/**
 * Uses a selector to find and wrap nodes with a new parent element,
 * which will get the specified CSS class.
 * @param {string} classname The CSS class for the wrapping node
 * @param {array|string} selectors The selectors for the affected nodes
 */
export function wrap(classname, selectors) {
  if (!Array.isArray(selectors)) {
    selectors=[selectors];
  }
  const div = document.createElement('div');
  div.className = classname;

  selectors.forEach((selector) => {
    const elems = document.querySelectorAll(selector);
    wrapNodes(div, elems);
  });
}

/**
 * Adds a CSS class to either the nodes found using the selector,
 * or one of their parent nodes.
 * @param {string} selector The selector for the affected nodes
 * @param {string} cssClass The CSS class to add
 * @param {number} parent The number of parent nodes to climb
 */
export function addClass(selector, cssClass, parent) {
  document.querySelectorAll(selector).forEach((el) => {
    if (el) {
      var up=parent;
      while (up) {
        el = el.parentNode;
        up--;
      }
      el.classList.add(cssClass);
    }
  });
}

/**
 * Sets the lang attribute on the <html> tag.
 */
function setDocumentLanguage() {
  // set document language
  if (window.blog && window.blog.language) {
    document.documentElement.setAttribute('lang', window.blog.language);
  }
}

/**
 * Removes header and footer if empty.
 */
function removeHeaderAndFooter() {
  // workaound until the ESI is fixed
  const header = document.querySelector("header");
  const footer = document.querySelector("footer");
  if (header && header.innerHTML == "/header.plain.html") header.innerHTML = "";
  if (footer && footer.innerHTML == "/footer.plain.html") footer.innerHTML = "";
}

/**
 * Transforms a given path for use on a card.
 * @param {string} path The original path
 * @returns {string} The card path
 */
function getCardPath(path) {
  return path ? path.toLowerCase().replace(/[^a-z\d_\/\.]/g,'-') : '';
}

/**
 * Returns the section with a given index, or the last section if index is undefined.
 * @param {number} index The section index
 * @returns {element} The section
 */
export function getSection(index) {
  const nodes = Array.from(document.querySelectorAll("main > div"));
  if (nodes.length === 0) {
    // create a section
    nodes.push(document.querySelector('main').appendChild(
      createTag('div')));
  }
  return index !== undefined && nodes.length > index ? nodes[index] : nodes[nodes.length - 1];
}

/**
 * Returns a relative URL using the specified type and name,
 * prefixed with context and language.
 * @param {string} type The type of the target page
 * @param {*} name The name of the target page
 * @returns {string} The URL
 */
export function getLink(type, name) {
  if (!type.endsWith('s')) type += 's';
  const fileName = name
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/\s/gm, '-') // replace whitespace with -
    .replace(/\&amp;/gm,'') // remove encoded ampersands
    .replace(/\&/gm,'')  // remove unencoded ampersands
    .replace(/\./gm,'') // remove dots
    .replace(/\-\-+/g,'-'); // remove multiple dashes
  return `${window.blog.context}${window.blog.language}/${type}/${fileName}.html`;
}

/**
 * Retrieves an index path from an element.
 * @param {element} el The element
 */
export function getIndexPath(el) {
  if (typeof el === 'string') {
    el = document.querySelector(el);
  }
  // fall back to last section
  el = el || getSection();

  const r = /^Index\: ?(.*)$/gmi.exec(el.innerText);
  if (r && r.length > 0) {
    el.remove();
    return r[1].trim();
  }
  return null;
}

/**
 * Retrieves article paths from an element or one of its parent elements.
 * @param {element} el The element
 * @param {number} parent The number of parent elements to climb
 * @param {boolean} removeContainer <code>true</code> if the container should be removed
 *                                  when done, else <code>false</code> (default)
 * @returns {array} The article paths
 */
export function getPostPaths(el, parent, removeContainer) {
  const paths=[];
  if (typeof el === 'string') {
    el = document.querySelector(el);
  }
  if (el) {
    let up = parent;
    while (up) {
      el = el.parentNode;
      up -= 1;
    }
    el.querySelectorAll('a').forEach((e) => {
      if (!e.textContent.startsWith('http')) return;
      const url = new URL(e.getAttribute('href'));
      let path = url.pathname;
      const p = path.split('/');
      if (p.length >= 3 && p[2] !== 'drafts' && p[2] !== 'publish') {
        // add /publish/ if missing
        p.splice(2, 0, 'publish');
        path = p.join('/');
      }
      if (!path.endsWith('.html')) path+='.html';
      paths.push(path);
    });
    if (removeContainer) {
      el.remove();
    }
  }
  return paths;
}

/**
 * Formats the article date for the card using the date locale
 * matching the content displayed.
 * @param {number} date The date to format in milliseconds
 * @returns {string} The formatted card date
 */
export function formatLocalCardDate(date) {
  let dateString = new Date(date).toLocaleDateString(window.blog.dateLocale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  });
  if (window.blog.dateLocale === 'en-US') {
    // stylize US date format with dashes instead of slashes
    dateString = dateString.replace(/\//g, '-');
  }
  return dateString;
}

/**
 * Prepares a query hit object for use as a card.
 * @param {object} item The query hit object
 * @returns {object} The processed query hit object
 */
export async function itemTransformer(item = {}) {
  const path = getCardPath(item.path);
  const taxonomy = await getTaxonomy(window.blog.language);
  const itemParams = {
    hero: item.hero
      ? getOptimizedImageUrl(item.hero, {
        height: 512,
        crop: '3:2',
      })
      : '#',
    date: item.date ? formatLocalCardDate(item.date * 1000) : '',
    authorUrl: item.author ? getLink(window.blog.TYPE.AUTHOR, item.author) : '',
    topic: item.topics && item.topics.length > 0 ? item.topics[0] : '',
    topicUrl: item.topics && item.topics.length > 0 ? taxonomy.getLink(item.topics[0]) || getLink(window.blog.TYPE.TOPIC, item.topics[0]) : '',
    path,
  }
  return Object.assign({}, item, itemParams);
};

/**
 * Creates a card using the specified query hit object and
 * adds it to the specified container.
 * @param {object} hit The query hit with the card data.
 * @param {element} $container The container element to add the card to
 * @returns {element} The card element
 */
export function addCard(hit, $container) {
  const $item = createTag('div', {'class': 'card'});
  $item.innerHTML = `
  <div class="hero">
    <a href="/${hit.path}" title="${hit.title}" tabindex="-1"><img class="lazyload" src="#" data-src="${hit.hero}" alt="${hit.title}"></a>
  </div>
  <div class="content">
    <p class="topic"><a href="${hit.topicUrl}" title="${hit.topic}">${hit.topic}</a></p>
    <h2><a href="/${hit.path}" title="${hit.title}">${hit.title}</a></h2>
    <p class="teaser"><a href="/${hit.path}" title="${hit.teaser}" tabindex="-1">${hit.teaser}</a></p>
    <p class="date">${hit.date}</p>
  </div>`;
  $container.appendChild($item);
  return $item;
}

async function addArticlesToDeck(hits, omitEmpty, transformer, hasMore, setFocus) {
    // console.log('adding articles to page', window.blog.page);
    let $deck = document.querySelector('.articles .deck');
    if (!$deck) {
      if (hits.length || !omitEmpty) {
        // add card container
        $deck = createTag('div', { 'class': 'deck' });
        const $container = createTag('div', { 'class': 'articles' });
        $container.appendChild($deck);
        document.querySelector('main').appendChild($container);
      }
    }

    if (!hits.length) {
      if (!omitEmpty) {
        $deck.innerHTML = '<div class="articles-empty"><div>';
      }
    } else {
      // add hits to card container
      if (!window.blog.page) $deck.innerHTML = '';
      hits = await Promise.all(hits.map(transformer));
      hits.forEach((hit, i) => {
          const $card=addCard(hit, $deck);
          if (!i && setFocus) $card.querySelector('a').focus();
        });

      let $more = $deck.parentNode.querySelector('.load-more');
      if (hasMore) {
        if (!$more) {
          // add button to load more
          const $more = createTag('a', { 'class': 'action primary load-more', role: 'button', tabindex: '0'});
          $more.addEventListener('click', fetchArticles);
          $more.addEventListener('keydown', (evt) => {
            if (evt.keyCode == 13 || evt.keyCode == 32) $more.click();
          });
          $deck.parentNode.appendChild($more);
          const title = window.getComputedStyle($more, ':before').getPropertyValue('content');
          if (title !== 'normal') {
            $more.setAttribute('title', title.substring(1, title.length-1));
          }
        }
      } else if ($more) {
        $more.remove();
      }
    }
}

/**
 * Find overlaps between base topics or products and topics to match.
 * @param {array} baseTopics The base topics
 * @param {array} baseProducts The base products
 * @param {array} topicsToMatch The topics to match
 * @return {boolean} <code>true</code> if there are matching topics,
 * else <code>false</code>
 */
function findMatches(baseTopics, baseProducts, topicsToMatch) {
  // try matching product names with and without adobe prefix, de-duped
  const productsToMatch = Array.from(new Set(topicsToMatch
    .concat(topicsToMatch
      .map(product => product.replace('adobe ', '')))));

  const matchedTopics = baseTopics
    .filter(topic => topicsToMatch.includes(topic));
  const matchedProducts = baseProducts
    .filter(product => productsToMatch.includes(product));

    // return true if match(es) found in either base topics or products
  return matchedProducts.length > 0 || matchedTopics.length > 0;
}

async function translateTable(pages, index) {
  const taxonomy = await getTaxonomy(window.blog.language);
  pages.forEach((e) => {
    let r=e;
    // exclude invalid paths
    if (!r.path || r.path === 0 || r.path === '') return;
    let products=JSON.parse(r.products);
    let topics=JSON.parse(r.topics);
    if (!Array.isArray(products)) products=[];
    if (!Array.isArray(topics)) topics=[];
    // also append parents

    r.topics = topics;
    topics.forEach((topic) => {
      r.topics = r.topics.concat(taxonomy.getParents(topic));
    });

    r.products = products;
    products.forEach((product) => {
      r.products = r.products.concat(taxonomy.getParents(product, taxonomy.PRODUCTS));
    });


    // filter duplicates
    r.topics = Array.from(new Set(r.topics));
    r.products = Array.from(new Set(r.products));

    if (r.path.startsWith('/')) r.path=r.path.substring(1);

    index.pathLookup[r.path]=r;
    index.articles.push (r);
  })
  if (pages.length<256) index.done=true;
}

export async function fetchArticleIndex(offset) {
  if (!window.blog.articleIndex) window.blog.articleIndex={pathLookup:{},articles:[], done: false};
  var index=window.blog.articleIndex;
  // console.log(`fetching article index: at ${index.articles.length} entries, new offset=${offset}`)
  if (index.done) return;

  const indexPath = window.blog.indexPath || `/${window.blog.language}/query-index.json`;
  const queryParams = new URLSearchParams(indexPath.split('?')[1]);
  queryParams.set('limit', 256);
  queryParams.set('offset', offset);
  let response=await fetch(`${indexPath.split('?')[0]}?${queryParams.toString()}`);

  if (response.ok) {
    const json = await response.json();
    const data = Array.isArray(json) ? json : json.data;
    await translateTable(data,window.blog.articleIndex);
  } else {
    // stop because of error
    console.log('error fetching index segment');
    index.done=true;
  }
  console.log(`fetched article index: at ${index.articles.length} entries, ${index.done?'':'not'} done.`)
}

async function fetchHits(filters, limit, cursor) {

  if (!window.blog.articleIndex) {
    await fetchArticleIndex(0);
  }

  const index=window.blog.articleIndex;
  const articles=window.blog.articleIndex.articles;
  const pathLookup=window.blog.articleIndex.pathLookup;

  let hits=[];
  if (filters.paths) {
    for (let j=0; j<filters.paths.length; j++) {
      const p=filters.paths[j];

      /* extending articles recommended articles */
      if (filters.pathsOnly) {
        while (!index.done && (articles[articles.length-1].path>p.substring(1))) {
          await fetchArticleIndex(articles.length);
        }
      }
     if (pathLookup[p.substring(1)]) hits.push(pathLookup[p.substring(1)]);
   };
  }

  let i=cursor;
  if (!filters.pathsOnly) {
    for (;i<articles.length;i++) {
      const e = articles[i];
      const articleTopics = Array.isArray(e.topics)
        ? e.topics.map(t => t.toLowerCase())
        : [];
      const articleProducts = Array.isArray(e.products)
        ? e.products.map(p => p.toLowerCase())
        : [];
      let matched = true;

      if (filters.author && (e.author!=filters.author)) {
        matched = false;
      }

      if (filters.topics) {
        filters.topics = Array.isArray(filters.topics) ? filters.topics : [filters.topics];
        matched = findMatches(articleTopics, articleProducts, filters.topics);
      }

      if ((filters.author || filters.topics) && matched) {
        // main topic, child topics or author must have matched
        // before refining with user topics or products
        let userTopicsMatched = false;
        let productsMatched = false;
        if (filters.userTopics) {
          userTopicsMatched = findMatches(articleTopics, [], filters.userTopics);
        }
        if (filters.products) {
          productsMatched = findMatches([], articleProducts, filters.products);
        }
        if (filters.userTopics && filters.products) {
          // if user topics AND products, both must match
          matched = userTopicsMatched && productsMatched;
        } else if (filters.userTopics || filters.products) {
          // if user topics OR products, one of them must match
          matched = userTopicsMatched || productsMatched;;
        }
      }

      //check if path is already in a card
      if (document.querySelector(`.card a[href='/${getCardPath(e.path)}']`)) matched=false;
      if (hits.find(h => h.path == e.path)) matched=false;

      if (filters.exclude) {
        if (findMatches(articleTopics, articleProducts, filters.exclude)) {
          matched = false;
        }
      }

      if (matched) {
        if (hits.length==limit) {
          break;
        }
        hits.push(e);
      }
      if (i==articles.length-1 && !index.done) {
        await fetchArticleIndex(articles.length);
      }
    }

  }

  let result={hits: hits};
  if (i && i<articles.length) {
    result.cursor=i;
  }

  return result;
}

/**
 * Fetches articles based on the page type.
 * @param {function} callback The function to call with <code>hits</code> array when done
 */
export async function fetchArticles({
  filters = {},
  omitEmpty = false,
  pageSize = 12,
  transformer = itemTransformer,
  callback,
} = {}) {
  if (window.blog.pageType === window.blog.TYPE.POST) {
    omitEmpty = true; // don't display anything if no results
    pageSize = 12;
    filters.paths = getPostPaths('h2#featured-posts', 1, true);
    filters.pathsOnly = true;
  } else if (window.blog.pageType === window.blog.TYPE.TOPIC) {
    const taxonomy = await getTaxonomy(window.blog.language);
    const currentTopic = Array.isArray(window.blog.topics) && window.blog.topics.length > 0
      ? window.blog.topics[0]
      : document.title.trim();
    const topic = taxonomy.lookup(currentTopic);
    let topics = topic ? [topic.name].concat(topic.children) : [];
    filters.topics = topics.map(topic => topic.toLowerCase());
    filters.paths = getPostPaths('h2#featured-posts', 1, true);
    if (window.blog.userFilters) {
      Object.keys(window.blog.userFilters).forEach((cat) => {
        // lowercase all user filters
        const userFiltersByCategory = window.blog.userFilters[cat].map(prod => prod.toLowerCase());
        if (cat === taxonomy.PRODUCTS) {
          // special handling for products category
          filters.products = userFiltersByCategory;
        } else {
          // add all others as userTopics
          filters.userTopics = (filters.userTopics || []).concat(userFiltersByCategory);
        }
      });
    }
  } else if (window.blog.pageType === window.blog.TYPE.AUTHOR) {
    filters.author = document.title.split(',')[0];
  } else if (window.blog.pageType === window.blog.TYPE.HOME) {
    filters.paths = getPostPaths('h2#featured-posts', 1, true);

    if (window.blog.topics && window.blog.topics.length > 0) {
      filters.topics = window.blog.topics.map(t => t.toLowerCase());
    }

    if (window.blog.products && window.blog.products.length > 0) {
      filters.products = window.blog.products.map(p => p.toLowerCase());
    }

    if (window.blog.exclude && window.blog.exclude.length > 0) {
      filters.exclude = window.blog.exclude.map(p => p.toLowerCase());
    }
  }
  window.blog.page = window.blog.page === undefined ? 0 : window.blog.page + 1;
  if (!(filters.pathsOnly && filters.paths.length==0)) {
    const result=await fetchHits(filters, pageSize, window.blog.cursor?window.blog.cursor:0);
    const hits=result.hits;
    const setFocus=window.blog.page?true:false;
    window.blog.cursor=result.cursor;

    await addArticlesToDeck(hits, omitEmpty, transformer, result.cursor, setFocus);
    if (typeof callback === 'function') callback(hits);

  }
}

/**
 * Applies the specified filters to the query result
 * @param {array} filters The filters to apply
 */
export function applyFilters(filters) {
  window.blog.cursor = 0;
  let $deck = document.querySelector('.articles .deck');
  if ($deck) $deck.parentNode.remove();
  window.blog.userFilters = Object.keys(filters).length ? filters : false;
  fetchArticles();
}

/**
 * Extracts the topics and products from the last section of a page
 */
export function extractTopicsAndProducts() {
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

  // raw topics (i.e as written in the source document)
  window.blog.topics = topics;

  let products, productContainer;
  Array.from(last.children).forEach((i) => {
    const r = /^Products\: ?(.*)$/gmi.exec(i.innerText);
    if (r && r.length > 0) {
      products = r[1].split(/\,\s*/);
      productContainer = i;
    }
  });

  // raw products (i.e as written in the source document)
  window.blog.products = products
    ? products.filter((product) => product.length > 0)
    : [];

  if (productContainer) {
    productContainer.remove();
  }

  let exclude, excludeContainer;
  Array.from(last.children).forEach((i) => {
    const r = /^Exclude\: ?(.*)$/gmi.exec(i.innerText);
    if (r && r.length > 0) {
      exclude = r[1].split(/\,\s*/);
      excludeContainer = i;
    }
  });

  window.blog.exclude = exclude;

  if (excludeContainer) {
    excludeContainer.remove();
  }

  if (last.innerText.trim() === '') {
    last.remove(); // remove empty last div
  }
}

/**
 * Set up click event on Region Picker Feds
 * Builds Dropdown Based on Region List
 * Get selected region from Dropdown Selector
 */
function handleDropdownRegion() {
  const regionsNameList = [
    {
      lang: "de",
      name: "Deutsch",
      home: `/de/`,
    },
    {
      lang: "es",
      name: "Español",
      home: `/es/`,
    },
    {
      lang: 'en_apac',
      name: 'APAC (English)',
      home: `/en/apac.html`,
    },
    {
      lang: "en_uk",
      name: "UK (English)",
      home: `/en/uk.html`,
    },
    {
      lang: "en",
      name: "US (English)",
      home: `/`,
    },{
      lang: "fr",
      name: "Français",
      home: `/fr/`,
    },{
      lang: "it",
      name: "Italiano",
      home: `/it/`,
    },{
      lang: "jp",
      name: "日本",
      home: `/jp/`,
    },{
      lang: "ko",
      name: "한국어",
      home: `/ko/`,
    },{
      lang: "br",
      name: "Português",
      home: `/br/`,
    }
  ];

  function createDropdownModal(fedsFooterButton) {
    // Add Region Dropdown Container before Feds Footer
    const regionDropdownContainer = document.createElement('div');
    regionDropdownContainer.classList.add('region-dropdown');
    regionDropdownContainer.innerHTML = `<ul class="region-dropdown-list"></ul>`;
    fedsFooterButton.parentNode.parentNode.appendChild(regionDropdownContainer);

    // Get actual selected Region
    const getSelectedRegion = () => {
      const regionByPath = regionsNameList.find(r => r.home === location.pathname);
      // check if Region name matches the blog.language example 'en' in order to show the Region Name in the buttom
      const regionByLang = regionsNameList.find(r => r.lang === window.blog.language);
      let regionLang;
      let regionName;
      if (!regionByPath) {
        // region array is empty, we are not on a region page -> check the sessionStorage, if no value, use blog.language
        regionLang = sessionStorage.getItem('blog-selected-language') || window.blog.language;
        // in order to show the Region name either from SessionStorage language or blog.language in our region button
        if (regionLang !== window.blog.language) {
          // if the selected Region lang do not match the blog.language we get the Region name based on the sessionStorage saved Language Value
          const storedLanguage = regionsNameList.find(r => r.lang === regionLang);
          regionName = storedLanguage.name;
        } else {
          // else we get the Region name base on the blog.language and after have find the same language in our RegionListName
          if (regionByLang !== undefined) {
              regionName = regionByLang.name;
          }
        }
      } else {
        regionLang = regionByPath.lang;
        regionName = regionByPath.name;
        // sessionStorage will be used only if current Region lang is not same as blog.lang as en_apac or en_uk
        // where blog.lang will still being en
        if (regionByPath.lang !== window.blog.language) {
          sessionStorage.setItem('blog-selected-language', regionByPath.lang);
        }
      }
      return {regionLang, regionName};
    }

    const dropdownRegionList = document.querySelector('.region-dropdown-list');
    const {regionLang, regionName} = getSelectedRegion();

    // Change Region name value from Feds Region Picker Button adding the actual Region Name
    const FEDSregionPickerText = document.querySelector('.feds-regionPicker-text');
    if (FEDSregionPickerText && regionName !== undefined) {
        FEDSregionPickerText.innerText = regionName;
    }

    // Automatically build the dropdown based on Region List
    if (dropdownRegionList) {
      for (const {lang, name, home} of regionsNameList) {
        const selected = regionLang === lang;
        dropdownRegionList.insertAdjacentHTML('beforeend', `<li><a class="region-dropdown-picker ${selected ? 'selected' : ''}" href="${home}" title="${name}" data-lang="${lang}">${name}</a></li>`);
      }
    }

    // Hide region modal if clicked outside
    document.addEventListener('click', function (event) {
      if (regionDropdownButton || HTMLElement) {
        if (!event.target.closest('.region-dropdown') && !event.target.closest('.feds-regionPicker')) {
          hideDropdownModal();
        }
      }
    });

    // Keyboard access for Region Picker
    if (regionDropdownButton) {
      document.body.addEventListener('keyup', (event) => {
        if (event.key === 'Escape') {
            hideDropdownModal();
        }
      });
    }

    const dropdownLinkList = document.querySelector('.region-dropdown-picker').parentElement;
    regionDropdownButton.addEventListener('keyup', (event) => {
      if (event.key === 'Enter') {
        if (regionDropdownModal.classList.contains('visible')) {
          dropdownLinkList.firstElementChild.focus();
        }
      }
    });

    // As we are attaching the Dropdown on top of the Button region Picker
    // this position will be updated if the window change
    window.addEventListener('resize', () => {
      positionDropdownModal();
    });
    return regionDropdownContainer;
  }

  /**
   * Position Dropdown on top of Feds Footer Button
   */
  function positionDropdownModal() {
    const regionDropdownModal = document.querySelector('.region-dropdown');
    const regionDropdownButton = document.querySelector('.feds-regionPicker');
    if (regionDropdownModal) {
      regionDropdownModal.style.left = regionDropdownButton.getBoundingClientRect().left + window.scrollX + 'px';
      regionDropdownModal.style.top = (window.scrollY + regionDropdownButton.getBoundingClientRect().top) - 15 - regionDropdownModal.getBoundingClientRect().height + 'px';    }
  }

  function showDropdownModal() {
    const regionDropdownModal = document.querySelector('.region-dropdown');
    if (regionDropdownModal) {
      positionDropdownModal();
      regionDropdownModal.classList.add('visible');
    }
  }

  function hideDropdownModal() {
    const regionDropdownModal = document.querySelector('.region-dropdown');
    if (regionDropdownModal) {
        regionDropdownModal.classList.remove('visible');
    }
  }

  function toggleDropdownModal(regionDropdownButton) {
    let regionDropdownModal = document.querySelector('.region-dropdown');
    if (!regionDropdownModal) {
      regionDropdownModal = createDropdownModal(regionDropdownButton);
    }
    if (regionDropdownModal.classList.contains('visible')) {
      hideDropdownModal();
    } else {
      showDropdownModal();
    }
  }

  const regionDropdownButton = document.querySelector('.feds-regionPicker');
  if (regionDropdownButton) {
    regionDropdownButton.addEventListener('click', (event) => {
      event.preventDefault();
      toggleDropdownModal(event.target);
    });
  }
}

export async function globalPostLCP() {
  loadCSS('/style/v2/lazy-styles.css');
  const martechUrl = '/scripts/martech.js';
  const usp = new URLSearchParams(window.location.search);
  const martech = usp.get('martech');

  if (!(martech === 'off' || document.querySelector(`head script[src="${martechUrl}"]`))) {
    let ms = 0;
    const delay = usp.get('delay');
    if (delay) ms = +delay;
    setTimeout(() => {
      loadScript(martechUrl, null, 'module');
    }, ms);
  }

  /**
   * Check if FEDS is available before loading the Dropdown Selector
   */
  if (typeof feds === 'object' && typeof feds.events === 'object' && feds.events.experience === true) {
    handleDropdownRegion();
  } else {
    window.addEventListener('feds.events.experience.loaded', handleDropdownRegion);
  }
}

function decoratePage() {
  setDocumentLanguage();
  removeHeaderAndFooter();
  checkWebpFeature(() => {
    webpPolyfill(document);
  });
};

decoratePage();

/**
 * Loads JS and CSS for a block.
 * @param {Element} $block The block element
 */
 export async function loadBlock($block) {
  const blockName = $block.getAttribute('data-block-name');
  try {
    const mod = await import(`/blocks/${blockName}/${blockName}.js`);
    if (mod.default) {
      await mod.default($block, blockName, document);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(`failed to load module for ${blockName}`, err);
  }

  loadCSS(`/blocks/${blockName}/${blockName}.css`);
}

/**
 * Builds a block DOM Element from a two dimensional array
 * @param {string} blockName name of the block
 * @param {any} content two dimensional array or string or object of content
 */
 export function buildBlock(blockName, content) {
  const table = Array.isArray(content) ? content : [[content]];
  const blockEl = document.createElement('div');
  // build image block nested div structure
  blockEl.classList.add(blockName);
  table.forEach((row) => {
    const rowEl = document.createElement('div');
    row.forEach((col) => {
      const colEl = document.createElement('div');
      const vals = col.elems ? col.elems : [col];
      vals.forEach((val) => {
        if (val) {
          if (typeof val === 'string') {
            colEl.innerHTML += val;
          } else {
            colEl.appendChild(val);
          }
        }
      });
      rowEl.appendChild(colEl);
    });
    blockEl.appendChild(rowEl);
  });
  return (blockEl);
}


/**
 * Retrieves the content of a metadata tag.
 * @param {string} name The metadata name (or property)
 * @returns {string} The metadata value
 */
 export function getMetadata(name) {
  const attr = name && name.includes(':') ? 'property' : 'name';
  const $meta = document.head.querySelector(`meta[${attr}="${name}"]`);
  return $meta && $meta.content;
}
