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
  if (window.isErrorPage) {
    pageType = TYPE.BLANK;
  }
  return { context, language, pageType, TYPE, LANG };
}();

// Adobe config
window.fedsMapping = {
  ko: 'kr'
};

window.fedsConfig = {
  locale: window.fedsMapping[window.blog.language] || window.blog.language,
  content: {
    experience: 'acom',
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

/**
 * Set up a click event on Region Picker
 */
function handleDropdownRegion() {
  const currentLocale = window.blog.language;
  const regionsNameList = [
    {
      lang: 'en_apac',
      localeName: 'APAC (English)',
      localeHome: `${window.location.origin}/en/apac.html`,
    },
    {
      lang: "ko",
      localeName: "Korea (한국어)",
      localeHome: `${window.location.origin}/ko/ko.html`,
    },
    {
      lang: "en_uk",
      localeName: "UK (English)",
      localeHome: `${window.location.origin}/en/uk.html`,
    },
    {
      lang: "en",
      localeName: "USA (English)",
      localeHome: `${window.location.origin}/`,
    }
  ];

  // Change Icon from Feds
  const FEDSRegionPickerIcon = document.querySelector('.feds-regionPicker-icon');
  if (FEDSRegionPickerIcon) {
      FEDSRegionPickerIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 19 19">
      <path class="b" d="M9.514.925A8.666,8.666,0,0,0,.925,9.514,8.666,8.666,0,0,0,9.514,18.1,8.669,8.669,0,0,0,18.1,9.514,8.669,8.669,0,0,0,9.514.925Zm7.3,10.152a7.378,7.378,0,0,1-.354,1.14c-.035.088-.059.18-.1.266a7.49,7.49,0,0,1-.65,1.2c-.018.027-.042.05-.061.077a7.523,7.523,0,0,1-.817.991c-.049.053-.106.095-.16.145a7.5,7.5,0,0,1-.981.809l-.013.009A7.429,7.429,0,0,1,9.7,16.96c2.626-1.979,2.305-3.138,3.793-4.793.5-.664-1.493-.83-3.152-1.493-2.157-1-1.33.664-2.987-1.162-1-1.162-1.33-2.819,1.659-1.493.332.332.5-1.162,1.162-1.991.331-.331.331-.663.5-1.161a1.092,1.092,0,0,0-2.157.166c0,.332-1.162-1.991-.332-1.991a5.893,5.893,0,0,1-1.659-.332c.156-.08.319-.143.479-.208a7.361,7.361,0,0,1,2.422-.454.776.776,0,0,1,.086,0c.166-.166-1,1.162-.664,1.162s2.323.5,2.157.664c.57-1-.206-1.624-1.067-1.782a7.388,7.388,0,0,1,3.313,1c.18.11.372.2.543.325.063.045.116.1.179.147a6.831,6.831,0,0,1,1.017.978c-.332.166-.332.663-.166,1,.33.33.334.331.988,0,.106.167.191.347.283.522-.1.039-.138.138-.276.138a2.665,2.665,0,0,0-.83,1.825c0,2.655.664,1.659,1.493,1.991a.6.6,0,0,0,.432.16,7.6,7.6,0,0,1-.078.769C16.828,10.986,16.822,11.032,16.812,11.077ZM6.828,16.463A8.035,8.035,0,0,1,2.047,9.514a7.387,7.387,0,0,1,.118-1.22c.026-.156.048-.312.084-.465A7.419,7.419,0,0,1,2.532,6.9c.079-.21.169-.416.266-.617.068-.143.146-.279.224-.417a7.463,7.463,0,0,1,.6-.9c.1-.129.206-.26.312-.383.141-.16.281-.319.436-.469a7.417,7.417,0,0,1,.668-.554c.155,1.483-1.16,2.314-.664,3.967.664,2.157,1.493,1.162,2.489,2.655C8.01,11.824,9.8,14.608,8.869,16.918A7.4,7.4,0,0,1,6.828,16.463Z" transform="translate(0.059 0.059)"/>
      </svg>`;
  }
  
  // Add Region Dropdown Container before Feds Footer
  const fedsFooter = document.querySelector('#feds-footer');
  if (fedsFooter) {
    const regionDropdownContainer = document.createElement('div');
    regionDropdownContainer.classList.add('region-dropdown');
    regionDropdownContainer.innerHTML = `<ul class="region-dropdown-list"></ul>`;
    fedsFooter.parentElement.insertBefore(regionDropdownContainer, fedsFooter);
  }

  // Automatically build the dropdown based on Locale List
  const dropdownRegionList = document.querySelector('.region-dropdown-list');
  if (dropdownRegionList) {
    for (const {lang: locale, localeName: localeName, localeHome: localeHome} of regionsNameList) {
      dropdownRegionList.insertAdjacentHTML('afterbegin', `<li><a class="region-dropdown-picker" href="${localeHome}" title="${localeName}" data-lang="${locale}">${localeName}</a></li>`);
    }
  }
  
  const regionDropdownButton =  document.querySelector('.feds-regionPicker');
  if (regionDropdownButton) {
    regionDropdownButton.addEventListener('click', (event) => {
      event.preventDefault();
      toggleDropdownModal();
    });
  }

  // Hide region modal if clicked outside
  document.addEventListener('click', function (event) {
    const regionDropdownButton =  document.querySelector('.feds-regionPicker');
    if (regionDropdownButton || HTMLElement) {
      if (!event.target.closest('.region-dropdown') && !event.target.closest('.feds-regionPicker')) {
        hideDropdownModal();
      }
    }
  });
}

function showDropdownModal() {
  const regionDropdownModal  = document.querySelector('.region-dropdown');
  const regionDropdownButton =  document.querySelector('.feds-regionPicker');
  if (regionDropdownModal) {
    regionDropdownModal.style.left = regionDropdownButton.getBoundingClientRect().left + window.scrollX + 'px';
    regionDropdownModal.style.top = window.scrollY + regionDropdownButton.getBoundingClientRect().top - regionDropdownModal.getBoundingClientRect().height + 'px';
    regionDropdownModal.classList.add('visible');
  }
 }
 
 function hideDropdownModal() {
  const regionDropdownModal = document.querySelector('.region-dropdown');
  if (regionDropdownModal) {
      regionDropdownModal.classList.remove('visible');
  }
 }

function toggleDropdownModal() {
  const regionDropdownModal  = document.querySelector('.region-dropdown');
  if (regionDropdownModal) {
    if (regionDropdownModal.classList.contains('visible')) {
      hideDropdownModal();
    } else {
      showDropdownModal();
    }
  }
}

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

// Load page specific code
loadCSS(`/style/${window.blog.pageType}.css`);
loadJSModule(`/scripts/${window.blog.pageType}.js`);

// Load language specific CSS overlays
loadCSS(`/dict.${window.blog.language}.css`);

// Check if FEDS is available before loading the Dropdown Selector
if (typeof feds === 'object' && typeof feds.events === 'object' && feds.events.experience === true) {
  handleDropdownRegion();  
} else {
  window.addEventListener('feds.events.experience.loaded', handleDropdownRegion);
}

