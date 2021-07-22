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
/* global fetch window */

import { createTag } from '../../scripts/v2/common.js';

function getRelativeURL(href) {
  const url = new URL(href, window.location);
  if (url.hostname.includes('blog.adobe.com')
  || url.hostname.includes('.page')
  || url.hostname.includes('.live')
  || url.hostname.includes('localhost')) {
    return (url.pathname);
  } else {
    return (href);
  }
}

function isSelected(navItem) {
  if (navItem.submenu) {
    const matches = navItem.submenu.filter((e) => {
      const navpath = new URL(e.href, window.location).pathname;
      return (navpath === window.location.pathname);
    });
    if (matches.length) return (true);
  }
  if (navItem.href) {
    const navpath = new URL(navItem.href, window.location).pathname;
    return (navpath === window.location.pathname);
  } else {
    return false;
  }
}

function getSubmenu(submenu) {
  const submenuEl = createTag('div', { class: 'gnav-submenu' });
  submenu.forEach((e) => {
    const navItemEl = createTag('div');
    navItemEl.innerHTML = `<a href="${e.href}">${e.text}</a>`;
    submenuEl.appendChild(navItemEl);
  });
  return submenuEl;
}

function getGnav(nav) {
  const gnav = createTag('div', { class: 'gnav' });
  const html = `
        <div class="gnav-hamburger" tabindex="0"></div>
        <div class="gnav-logo"><a href="${nav.logo.href}"><img loading="lazy" src="/blocks/gnav/adobe-logo.svg"></a><span class="gnav-adobe">${nav.logo.text}</span></a></div>
        <div class="gnav-section"></div>
        </div>
        <div class="gnav-search" tabindex="0"><svg xmlns="http://www.w3.org/2000/svg" id="gnav-search-icon" width="20" height="20" viewBox="0 0 24 24" focusable="false">
            <path d="M14 2A8 8 0 0 0 7.4 14.5L2.4 19.4a1.5 1.5 0 0 0 2.1 2.1L9.5 16.6A8 8 0 1 0 14 2Zm0 14.1A6.1 6.1 0 1 1 20.1 10 6.1 6.1 0 0 1 14 16.1Z"></path>
          </svg><div class="gnav-search-box"></div>
        </div>
        <div class="gnav-signin"><a href="${nav.signIn.href}">${nav.signIn.text}</a></div>`;

  gnav.innerHTML = html;
  const hamburger = gnav.querySelector('.gnav-hamburger');
  hamburger.addEventListener('click', () => {
    const expanded = gnav.getAttribute('aria-expanded') === 'true';
    gnav.setAttribute('aria-expanded', !expanded);
  });

  const sectionEl = gnav.querySelector('.gnav-section');

  nav.top.forEach((e) => {
    const selected = isSelected(e);
    const navItemEl = createTag('span');
    if (selected) navItemEl.classList.add('gnav-selected');
    if (e.href) {
      navItemEl.innerHTML = `<a href="${e.href}">${e.text}</a>`;
    } else if (e.type === 'button') {
      navItemEl.innerHTML = `<a href="#" class="gnav-button gnav-primary">${e.text}</a>`;
    } else {
      navItemEl.classList.add('gnav-drop');
      navItemEl.setAttribute('tabindex', '0');
      navItemEl.innerHTML = `${e.text}`;
      if (e.submenu) {
        const submenuEl = getSubmenu(e.submenu);
        navItemEl.appendChild(submenuEl);
        navItemEl.addEventListener('click', () => {
          const expanded = navItemEl.getAttribute('aria-expanded') === 'true';
          [...sectionEl.children].forEach((ni) => {
            ni.setAttribute('aria-expanded', 'false');
          });
          navItemEl.setAttribute('aria-expanded', !expanded);
        });
      }
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
  const nav = {};
  nav.top = [...$header.querySelectorAll(':scope > div h2')].map((h2) => {
    const navItem = {};
    const div = h2.closest('div');
    navItem.text = h2.textContent;
    const h2a = h2.closest('a') || h2.querySelector('a');
    if (h2a) {
      navItem.href = getRelativeURL(h2a.href);
    }
    if (div.querySelector('li')) {
      navItem.submenu = [...div.querySelectorAll('li')].map((li) => {
        const a = li.querySelector('a');
        const ni = {
          text: li.textContent,
        };
        if (a) ni.href = getRelativeURL(a.href);
        return (ni);
      });
    }
    return (navItem);
  });
  const logo = nav.top.shift();
  nav.logo = logo;
  return nav;
}

export async function decorateGNav(blockEl, url) {
  const nav = await markupToNav(url);

  nav.signIn = {
    text: 'Sign In',
    href: 'https://www.adobe.com/',
  };
  /*

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
  */

  blockEl.appendChild(getGnav(nav));
}

export default function decorate(blockEl) {
  const url = blockEl.getAttribute('data-gnav-source');
  decorateGNav(blockEl, url);
}
