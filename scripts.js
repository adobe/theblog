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


function checkDX(tags) {
  const dxtags=`Experience Cloud, Experience Manager, Magento Commerce, Marketo Engage, Target, Commerce Cloud, Campaign, Audience Manager, Analytics, Advertising Cloud,
      Travel & Hospitality, Media & Entertainment, Financial Services, Government, Non-profits, Other, Healthcare, High Tech, Retail, Telecom, Manufacturing, Education,
      B2B, Social, Personalization, Campaign Management, Content Management, Email Marketing, Commerce, Analytics, Advertising, Digital Transformation`;
  const dx=dxtags.split(',').map(e => e.trim());
  let found=false;
  tags.split(',').forEach((p) => {
    p=p.trim();
    if (dx.includes(p)) found=true;
  });
  return found;
}

/**
 * sets marketing tech context
 */

function setMarTechContext() {
  var env='dev';
  var hostname=window.location.hostname;
  if (hostname.includes('staging')) env='stage';
  if (hostname == 'blog.adobe.com') env='production';

  var isDX=false;
  document.querySelectorAll('main>div:last-of-type>p').forEach(($p) => {
    if ($p.innerHTML.includes('Products:') || $p.innerHTML.includes('Topics:')) {
      if (checkDX($p.innerHTML.split(':')[1])) {
        isDX=true;
      }
    }
  });

  var accounts='';
  if (isDX) {
    if (env == 'production') {
      accounts='adbadobedxprod';
    }
    if (env == 'stage') {
      accounts='adbadobedxqa';
    }
  }

  window.marketingtech = {
    adobe: {
      launch: {
        property: 'global',
        environment: env  // “production” for prod/live site or “stage” for qa/staging site
      },
      analytics: {
        additionalAccounts: accounts // additional report suites to send data to “,” separated  Ex: 'RS1,RS2'
      },
      target: true,    // if target needs to be enabled else false
      audienceManager: true    // if audience manager needs to be enabled else false
    }
  };
  // console.log(window.marketingtech)
}

/**
 * sets digital data
 */

function setDigitalData() {
  var langMap={'en': 'en-US'};
  var lang=window.blog.language;
  if (langMap[lang]) lang=langMap[lang];
  digitalData._set('page.pageInfo.language', lang);
  // console.log(lang);
}



/**
 * Return the correct CMP integration ID based on the domain name
 */
function getOtDomainId() {
  const domains = {
    'adobe.com': '7a5eb705-95ed-4cc4-a11d-0cc5760e93db',
    'hlx.page': '3a6a37fe-9e07-4aa9-8640-8f358a623271',
    'project-helix.page': '45a95a10-dff7-4048-a2f3-a235b5ec0492',
    'helix-demo.xyz': 'ff276bfd-1218-4a19-88d4-392a537b6ce3',
    'adobeaemcloud.com': '70cd62b6-0fe3-4e20-8788-ef0435b8cdb1',
  };
  const currentDomain = Object.keys(domains).find(domain => window.location.host.indexOf(domain) > -1);

  return `${domains[currentDomain] || domains[Object.keys(domains)[0]]}`;
};

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

// Adobe config
window.fedsMapping = {
  ko: 'kr'
};

window.fedsConfig = {
  locale: window.fedsMapping[window.blog.language] || window.blog.language,
  content: {
    experience: 'blogs/blog-gnav',
  },
  search: {
    context: 'blogs',
    passExperienceName: true,
  },
  disableSticky: false,
  privacy: {
    otDomainId: getOtDomainId(),
    footerLinkSelector: '[data-feds-action="open-adchoices-modal"]',
  },
};

window.adobeid = {
  client_id: 'theblog-helix',
  scope: 'AdobeID,openid',
  locale: window.blog.language,
};

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

// Load page specific code
loadCSS(`/style/${window.blog.pageType}.css`);
loadJSModule(`/scripts/${window.blog.pageType}.js`);

// Load language specific CSS overlays
loadCSS(`/i18n/dict.${window.blog.language}.css`);

