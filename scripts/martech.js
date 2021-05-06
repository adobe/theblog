/*
 * Copyright 2021 Adobe. All rights reserved.
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
  loadScript
} from '/scripts/common-v2.js';

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
}

setMarTechContext();

window.targetGlobalSettings = {
  bodyHidingEnabled: false,
};

loadScript('https://www.adobe.com/marketingtech/main.min.js', () => {
  setDigitalData();
});

loadScript('https://www.adobe.com/etc.clientlibs/globalnav/clientlibs/base/feds.js').id = 'feds-script';
loadScript('https://static.adobelogin.com/imslib/imslib.min.js');

