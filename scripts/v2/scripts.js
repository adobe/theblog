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
/* global window document Image navigator */

/**
 * log RUM if part of the sample.
 * @param {string} checkpoint identifies the checkpoint in funnel
 * @param {Object} data additional data for RUM sample
 */

// eslint-disable-next-line import/prefer-default-export
function sampleRUM(checkpoint, data = {}) {
  try {
    window.hlx = window.hlx || {};
    if (!window.hlx.rum) {
      const usp = new URLSearchParams(window.location.search);
      const weight = (usp.get('rum') === 'on') ? 1 : 100; // with parameter, weight is 1. Defaults to 100.
      // eslint-disable-next-line no-bitwise
      const hashCode = (s) => s.split('').reduce((a, b) => (((a << 5) - a) + b.charCodeAt(0)) | 0, 0);
      const id = `${hashCode(window.location.href)}-${new Date().getTime()}-${Math.random().toString(16).substr(2, 14)}`;
      const random = Math.random();
      const isSelected = (random * weight < 1);
      // eslint-disable-next-line object-curly-newline
      window.hlx.rum = { weight, id, random, isSelected };
    }
    const { random, weight, id } = window.hlx.rum;
    if (random && (random * weight < 1)) {
      // eslint-disable-next-line object-curly-newline
      const body = JSON.stringify({ weight, id, referer: window.location.href, generation: 'blog-gen3', checkpoint, ...data });
      const url = `https://rum.hlx3.page/.rum/${weight}`;
      // eslint-disable-next-line no-unused-expressions
      navigator.sendBeacon(url, body); // we should probably use XHR instead of fetch
    }
  } catch (e) {
    // somethign went wrong
  }
}

sampleRUM('top');
window.addEventListener('load', () => sampleRUM('load'));
document.addEventListener('click', () => sampleRUM('click'));

/**
 * Loads a JS module.
 * @param {string} src The path to the JS module
 */
function loadJSModule(src) {
  const module = document.createElement('script');
  module.setAttribute('type', 'module');
  module.setAttribute('src', src);
  document.head.appendChild(module);
};

/**
 * Loads a CSS file.
 * @param {string} href The path to the CSS file
 */
function loadCSS(href) {
  const link = document.createElement('link');
  link.setAttribute('rel', 'stylesheet');
  link.setAttribute('href', href);
  document.head.appendChild(link);
};

/**
 * Wraps nodes with a new parent node.
 * @param {node} newparent The new parent node
 * @param {array} nodes The nodes to wrap
 */
 function wrapNodes(newparent, nodes) {	
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
 function wrap(classname, selectors) {	
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
function addClass(selector, cssClass, parent) {
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
 * Returns an image URL with optimization parameters
 * @param {string} url The image URL
 * @param {object} options The configuration options
 */
function getOptimizedImageUrl(url, config) {
  const [path, query] = url.split('?');
  if (!path.endsWith('.gif')) {
    // apply defaults
    config =  {
      auto: 'webp',
      format: 'pjpg',
      optimize: 'medium',
      ...config,
    }
  }
  const opts = new URLSearchParams(query);
  Object.keys(config).forEach(key => config[key] ? opts.set(key, config[key]) : null); 

  // keep only width or height but not both (and let image optimizer do his job)
  if (config.height) {
    opts.delete('width');
  } else {
    if (config.width) {
      opts.delete('height');
    }
  }

  return `${path}?${opts.toString()}`;
}

// Blog config
window.blog = function() {
  const TYPE = {
    HOME: 'home',
    POST: 'post',
    AUTHOR: 'author',
    TOPIC: 'topic',
    PRODUCT: 'product',
    PROMOTION: 'promotion',
    BLANK: 'blank',
  };
  const LANG = {
    EN: 'en',
    DE: 'de',
    FR: 'fr',
    KO: 'ko',
    ES: 'es',
    IT: 'it',
    JP: 'jp',
    BR: 'br',
  };
  const context = '/';
  let language = LANG.EN;
  let pageType = TYPE.HOME;
  const segs = window.location.pathname
    .split('/')
    .filter(seg => seg !== '');
  if (segs.length > 0) {
    if (segs.length >= 1) {
      // language
      for (let [key, value] of Object.entries(LANG)) {
        if (value === segs[0]) {
          language = value;
          break;
        }
      }
    }
    if (segs.length >= 2) {
      // post pages
      if (segs[1] === 'drafts' || segs[1] === 'publish' || segs[1] === 'fpost' || segs[1] === 'documentation' || /\d{4}\/\d{2}\/\d{2}/.test(segs.join('/'))) {
        pageType = TYPE.POST;
      } else {
        for (let [key, value] of Object.entries(TYPE)) {
          if (segs[1].startsWith(value)) {
            pageType = value;
            break;
          }
        }
      }
    }
  }
  // define date locale
  let dateLocale = language;
  if (dateLocale === LANG.EN) {
    dateLocale = 'en-US'; // default to US date format
  }
  if (dateLocale === LANG.BR) {
    dateLocale = 'pt-BR';
  }
  if (dateLocale === LANG.JP) {
    dateLocale = 'ja-JP';
  }
  const pageName = window.location.pathname.split('/').pop().split('.')[0];
  if (pageName === 'uk' || pageName === 'apac') {
    dateLocale = 'en-UK'; // special handling for UK and APAC landing pages
  }

  if (window.isErrorPage) {
    pageType = TYPE.BLANK;
  }
  return { context, language, dateLocale, pageType, TYPE, LANG };
}();

// Prep images for lazy loading and use adequate sizes
let imgCount = 0;
const observer = new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    mutation.addedNodes.forEach(node => {
      // only handle images with src=/hlx_*
      if (node.tagName === 'IMG' && /\/hlx_/.test(node.src)) {
        const img = node;
        let width;
        if (window.blog.pageType === window.blog.TYPE.TOPIC) {
          // full width topic banner
          width = window.innerWidth <= 600 ? 600 :
            window.innerWidth <= 1200 ? 1200 : 2000;
        } else if (window.blog.pageType === window.blog.TYPE.AUTHOR) {
          // author pic
          width = window.innerWidth <= 1200 ? 124 : 224;
        } else {
          // post: hero vs body images
          width = window.innerWidth <= 600 ? 600 :
            imgCount > 0 ? 800 : 1000;
        }            
        width *= window.devicePixelRatio;
        const imgUrl = getOptimizedImageUrl(img.src, { width });
        if (imgCount === 0) {
          img.setAttribute('src', imgUrl);
        } else {
          // lazyload all but hero image
          img.setAttribute('data-src', imgUrl);
          img.removeAttribute('src');
          img.classList.add('lazyload');
        }
        imgCount++;
      }
    });
  });
});
observer.observe(document, { childList: true, subtree: true });

function checkRedirect() {
  /* client side redirect, to be removed asap when server rule is activated */
  if (window.location.href.includes('://blogs')) window.location.href = window.location.href.replace('://blogs', '://blog');
};

checkRedirect();

function postLCP() {
  sampleRUM('lcp');

  document.body.classList.add('appear');

  // Load page specific code
  loadCSS(`/style/v2/${window.blog.pageType}.css`);
  loadJSModule(`/scripts/v2/${window.blog.pageType}.js`);

  // Load language specific CSS overlays
  loadCSS(`/i18n/dict.${window.blog.language}.css`);
}

const handleLCPPerType = {};

/* post-page pre lcp handlers*/
handleLCPPerType[window.blog.TYPE.POST] = {};

handleLCPPerType[window.blog.TYPE.POST].decoratePage = () => {
  const prepareCategory = () => {
    const categoryWrap = document.createElement('div');
    categoryWrap.className = 'category';
    document.querySelector('main .post-header').prepend(categoryWrap);
  }

  addClass('.post-page main>div:first-of-type', 'post-title');
  addClass('.post-page main>div:nth-of-type(2)', 'hero-image');
  addClass('.post-page main>div:nth-of-type(3)', 'post-author');
   // hide author name
  addClass('.post-author', 'invisible');
  addClass('.post-page main>div:nth-of-type(4)', 'post-body');
  addClass('.post-page main>div.post-body>p>picture', 'images', 1);

  wrap('post-header',['main>div.category','main>div.post-title']);

  prepareCategory();

  const $main=document.querySelector('main');
  const $postAuthor=document.querySelector('.post-author');
  const $heroImage=document.querySelector('.hero-image');

  if ($postAuthor && $heroImage) $main.insertBefore($postAuthor,$heroImage);
};

handleLCPPerType[window.blog.TYPE.POST].computeLCPCandidate = () => {
  const $lcpCandidate = document.querySelector('main .hero-image img');
  if ($lcpCandidate) {
    if ($lcpCandidate.complete) {
      postLCP();
    } else {
      $lcpCandidate.addEventListener('load', function lcpLoad() {
        $lcpCandidate.removeEventListener('load', lcpLoad);
        // console.log('removing event listener after load');
        postLCP();
      });
      $lcpCandidate.addEventListener('error', function lcpError() {
        $lcpCandidate.removeEventListener('error', lcpError);
        // console.log('removing event listener after error');
        postLCP();
      });
    }
  } else {
    postLCP();
  }
};

/**
 * Adds page type as body class.
 */
 function addPageTypeAsBodyClass() {
  document.body.classList.add(`${window.blog.pageType}-page`);
}

function decoratePage() {
  addPageTypeAsBodyClass();
  const handler = handleLCPPerType[window.blog.pageType];
  if (handler) {
    handler.decoratePage();
    handler.computeLCPCandidate();
  } else {
    postLCP();
  }
}

decoratePage();
