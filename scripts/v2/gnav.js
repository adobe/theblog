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
/* global fetch */

import { createTag } from './common.js';

function getGnavPlaceholder(nav) {
  let html = `<div id="feds-header">
      </div>
      <div id="header-placeholder" class="placeholder">
      <div class="mobile">
        <div class="hamburger"></div>
        <div class="logo"><img loading="lazy" src="/express/gnav-placeholder/adobe-logo.svg"></div>
        <div class="signin">${nav.signIn}</div>
      </div>
      <div class="desktop">
        <div class="top">
          <div class="left">
            <div class="logo"><img loading="lazy" src="/express/gnav-placeholder/adobe-logo.svg"><span class="adobe">Adobe</span></div>
            <div class="section">`;

  nav.top.forEach((e) => {
    const selected = e.selected ? 'selected' : '';
    if (e.type === 'nodrop') {
      html += `<span class="${selected}">${e.text}</span>`;
    } else if (e.type === 'button') {
      html += `<span><a href="#" class="button primary">${e.text}</a></span>`;
    } else {
      html += `<span class="drop ${selected}">${e.text}</span>`;
    }
  });

  html += `</div>
          </div>
          <div class="right">
            <div class="search"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" focusable="false">
            <path d="M14 2A8 8 0 0 0 7.4 14.5L2.4 19.4a1.5 1.5 0 0 0 2.1 2.1L9.5 16.6A8 8 0 1 0 14 2Zm0 14.1A6.1 6.1 0 1 1 20.1 10 6.1 6.1 0 0 1 14 16.1Z"></path>
        </svg></div>
            <div class="signing">${nav.signIn}</div>
          </div>
        </div>
      </div>`;
  return (html);
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
}

export default async function decorateGNav(urlOrObject) {
  let nav = urlOrObject;
  if (typeof nav === 'string') {
    // fetch nav
    nav = await markupToNav(nav);
  }

  const $header = document.querySelector('header');

  if (locale === 'us') {
    const nav = {
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
          text: 'Adobe Spark',
        },
        {
          text: 'Features',
        },
        {
          text: 'Create',
        },
        {
          text: 'Learn',
        },
        {
          text: 'Compare plans',
        },
        {
          text: 'Start now',
        },
      ],
    };
    const html = getGnavPlaceholder(nav);
    $header.innerHTML = html;
  } else {
    $header.innerHTML = getGnavPlaceholder({
      signIn: 'Sign In',
      top: [],
    });
  }

  document.querySelector('footer').innerHTML = `
      <div id="feds-footer"></div>
      <div class="evidon-notice-link"></div>
    `;
}
