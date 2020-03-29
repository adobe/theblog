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
 * 
 * Scripted Browser API Documentation:
 * https://docs.newrelic.com/docs/synthetics/new-relic-synthetics/scripting-monitors/writing-scripted-browsers
 */
const assert = require('assert');

$browser.get('http://theblog.helix-demo.xyz')
  .then(function() {
    // Get articles
    return $browser.findElements($driver.By.css('li.ais-Hits-item'))
      .then(function (articles) {
        // Check if there are enough articles
        assert.equal(articles.length, 13, `Expected 13 articles, got ${articles.length}`);
        // Check if first item is special
        return articles[0].getCssValue('flex-direction').then(function (value) {
          assert.equal(value, 'row', `Expected flex-direction of first article to be "row", got "${value}"" instead.`);
        });
      });
  });
