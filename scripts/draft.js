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
  createTag,
} from '/scripts/common.js';

function getPredictedPublishUrl() {
  const pathsplits = window.location.pathname.split('/');
  return `https://blog.adobe.com/${pathsplits[1]}${datePath}/${filename}.html`;
}

(() => {
  const $wrapper = createTag('div', { class: 'draft-ui' });
  // prediced url
  let datePath = '';
  if (window.blog.rawDate) {
    const datesplits = window.blog.rawDate.split('-');
    if (datesplits.length > 2) {
      datePath = `/${datesplits[2]}/${datesplits[0]}/${datesplits[1]}`;
    }
  }
  const filename = (pathsplits[pathsplits.length-1].split('.')[0]).toLowerCase().replace(/[^a-z\d_\/\.]/g,'-');
  const $predURL = createTag('div', { class: 'predicted-url' });
  const $predURLField = createTag('input', { value: getPredictedPublishUrl });
  $predURL.appendChild($predURLField);
  $wrapper.appendChild($predURL);
  const $predURLCopy = document.createElement('button');
  $predURLCopy.addEventListener('click', (event) => {
    event.target.previousSibling.select();
    document.execCommand('copy');
  });
  $predURL.appendChild($predURLCopy);

  // test hero image
  const $testHero = document.createElement('div');
  $testHero.className = 'test-hero';
  ['card', 'featured', 'news'].forEach((type) => {
    const $testHeroCard = document.createElement('button');
    $testHeroCard.className = `test-hero-${type}`;
    $testHero.appendChild($testHeroCard);
  });
  $wrapper.appendChild($testHero);

  document.body.appendChild($wrapper);
})();
