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
/* global */

import {
    createTag,
  } from '../../scripts/v2/common.js';

  function countPageView() {
    let pageViewsStr = localStorage.getItem('pageViews');
    if (pageViewsStr && +pageViewsStr) {
      pageViewsStr = ''+ (+pageViewsStr + 1)
    } else {
      pageViewsStr = '1';
    }
    try {
      localStorage.setItem('pageViews', pageViewsStr);
    } catch (e) {

    }
    return (+pageViewsStr);
  }
  
  export default function decorate($block) {
    const usp = new URLSearchParams(window.location.search);
    if (usp.get('ShowStickyBanner')) {
      localStorage.removeItem('hideStickyBanner');
      localStorage.setItem('pageViews', '5');
    }
    const $close = createTag('button', {
      class: 'close',
      'aria-label': 'close',
    });
    $block.appendChild($close);
    $close.addEventListener('click', () => {
      $block.remove();
      localStorage.setItem('hideStickyBanner', 'true');
    });

    const $a = $block.querySelector('a');
    $a.addEventListener('click', () => {
      $block.remove();
      localStorage.setItem('hideStickyBanner', 'true');
    });

    const pvs = countPageView();
    const hide = localStorage.getItem('hideStickyBanner');

    console.log(pvs, hide);
    if (pvs > 5 && !hide && window.blog.language === 'en') {
      window.setTimeout(() => $block.classList.add('show'), 10000);
    }

  }
  