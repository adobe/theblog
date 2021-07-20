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
/* global fetch document */

import { createTag } from '../../scripts/v2/common.js';

function isSelected(navItem, nav) {
  return (false);
}
function getSubmenu(submenu) {
  const submenuEl = createTag('div', { class: 'submenu' });
  submenu.forEach((e) => {
    const navItemEl = createTag('span');
    navItemEl.innerHTML = `<a href="${e.href}">${e.text}</a>`;
    submenuEl.appendChild(navItemEl);
  });
}

function getGnav(nav) {
  const gnav = createTag('div', { class: 'gnav' });
  const html = `
    <div class="gnav-top">
      <div class="gnav-left">
        <div class="gnav-hamburger" tabindex="0"></div>
        <div class="gnav-logo"><a href="${nav.logo.href}"><img loading="lazy" src="/blocks/gnav/adobe-logo.svg"></a><span class="gnav-adobe">${nav.logo.text}</span></a></div>
        <div class="gnav-section"></div>
          </div>
      <div class="gnav-center">
        <div class="gnav-logo"><a href="${nav.logo.href}"><img loading="lazy" src="/blocks/gnav/adobe-logo.svg"></a></div>
      </div>
      <div class="gnav-right">
          <div class="gnav-search" tabindex="0"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" focusable="false">
          <path d="M14 2A8 8 0 0 0 7.4 14.5L2.4 19.4a1.5 1.5 0 0 0 2.1 2.1L9.5 16.6A8 8 0 1 0 14 2Zm0 14.1A6.1 6.1 0 1 1 20.1 10 6.1 6.1 0 0 1 14 16.1Z"></path>
      </svg></div>
          <div class="gnav-signin"><a href="${nav.signIn.href}">${nav.signIn.text}</a></div>
        </div>
      </div>`;

  gnav.innerHTML = html;
  const sectionEl = gnav.querySelector('.gnav-top .gnav-section');

  nav.top.forEach((e) => {
    const selected = isSelected(e, nav);
    const navItemEl = createTag('span'); 
    if (selected) navItemEl.classList.add('selected');
    if (e.href) {
      navItemEl.innerHTML = `<a href="${e.href}">${e.text}</a>`;
    } else if (e.type === 'button') {
      navItemEl.innerHTML = `<a href="#" class="gnav-button gnav-primary">${e.text}</a>`;
    } else {
      navItemEl.classList.add('gnav-drop');
      navItemEl.setAttribute('tabindex', '0');
      navItemEl.innerHTML = `${e.text}`;
      if (e.submenu) {
        // getSubmenu(e.submenu);
      }
      navItemEl.addEventListener('click', () => {
      });
    }
    sectionEl.appendChild(navItemEl);
  });

  return (gnav);
}

async function markupToNav(url) {
  const resp = await fetch(`${url}.plain.html`);
  const html = await resp.text();
  const $header = createTag('header');
  $header.innerHTML = html;
  const nav = {
    top: [],
  };
  $header.querySelectorAll('h2').forEach((h2) => {
    
  });
  return nav;
}

export async function decorateGNav(blockEl, url) {
  let nav = await markupToNav(url);

  nav = {
    signIn: {
      text: 'Sign In',
      href: 'https://www.adobe.com/',
    },
    logo: {
      text: 'Adobe Blog',
      href: 'https://blog.adobe.com/',
    },
    top: [
      {
        text: 'News',
        href: 'https://blog.adobe.com/en/topics/news.html',
      },
      {
        text: 'Insights & Inspiration',
        submenu: [
          {
            text: 'Creativity',
            href: 'https://blog.adobe.com/en/topics/creativity.html',
          },
          {
            text: 'Creativity',
            href: 'https://blog.adobe.com/en/topics/creativity.html',
          },
          {
            text: 'Creativity',
            href: 'https://blog.adobe.com/en/topics/creativity.html',
          },
          {
            text: 'Creativity',
            href: 'https://blog.adobe.com/en/topics/creativity.html',
          },
        ],
      },
      {
        text: 'Responsibility',
        submenu: [
          {
            text: 'Creativity',
            href: 'https://blog.adobe.com/en/topics/creativity.html',
          },
        ],
      },
      {
        text: 'Adobe Life',
        submenu: [
          {
            text: 'Creativity',
            href: 'https://blog.adobe.com/en/topics/creativity.html',
          },
        ],
      },
    ],
  };

  blockEl.appendChild(getGnav(nav));
}

export default function decorate(blockEl) {
  const url = blockEl.getAttribute('data-gnav-source');
  decorateGNav(blockEl, url);
}
