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

const HEADERS = {
  level1: 'Level 1',
  level2: 'Level 2',
  level3: 'Level 3',
  hidden: 'Hidden',
  link: 'Link',
  type: 'Type',
  excludeFromMetadata: 'ExcludeFromMetadata'
}

const NO_INTERLINKS = 'no-interlinks';

const CATEGORIES = 'Categories';
const PRODUCTS = 'Products';
const INDUSTRIES = 'Industries';
const INTERNALS = 'Internals';

export async function getTaxonomy() {
  if (window.blog.taxonomy) {
    return window.blog.taxonomy;
  }

  const escapeTopic = (topic) => {
    if (!topic) return null;
    return topic.replace(/\n/gm, ' ').trim();
  }

  // TODO restore
  // return fetch(`/${window.blog.language}/_taxonomy.json`)
  return fetch(`/en/drafts/alex/_taxonomy.json`)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      const _taxonomy = {
        topics: {},
        categories: {},
        children: {}
      };

      if (data && data.length > 0) {
        const H = HEADERS;
        let level1, level2;
        data.forEach(row => {
          let level = 3;
          const level3 = escapeTopic(row[H.level3] !== '' ? row[H.level3] : null);
          if (!level3) {
            level = 2;
            level2 = escapeTopic(row[H.level2] !== '' ? row[H.level2] : null);
            if (!level2) {
              level = 1;
              level1 = escapeTopic(row[H.level1]);
            }
          }

          const name = level3 || level2 || level1

          // skip duplicates
          if (_taxonomy.topics[name]) return;

          let link = row[H.link] !== '' ? row[H.link] : null;
          if (link) {
            const u = new URL(link);
            const current = new URL(window.location.href);
            link = `${current.origin}${u.pathname}`;
          }

          const item = {
            name,
            level,
            level1,
            level2,
            level3,
            link,
            category: row[H.type] ? row[H.type].trim() : INTERNALS,
            hidden: row[H.hidden] && row[H.hidden].trim() !== '',
            skipMeta: row[H.excludeFromMetadata] && row[H.excludeFromMetadata].trim() !== '',
          }

          _taxonomy.topics[name] = item;
          
          if (!_taxonomy.categories[item.category]) {
            _taxonomy.categories[item.category] = [];
          }
          _taxonomy.categories[item.category].push(item);

          if (level3) {
            if (!_taxonomy.children[level2]) {
              _taxonomy.children[level2] = [];
            }
            _taxonomy.children[level2].push(level3);
          }

          if (level2) {
            if (!_taxonomy.children[level1]) {
              _taxonomy.children[level1] = [];
            }
            _taxonomy.children[level1].push(level2);
          }

        });
      }

      window.blog.taxonomy = {
        CATEGORIES,
        PRODUCTS,
        INDUSTRIES,
        INTERNALS,
        NO_INTERLINKS,

        isUFT: function (topic) {
          return _taxonomy.topics[topic] && !_taxonomy.topics[topic].hidden;
        },

        skipMeta: function (topic) {
          return _taxonomy.topics[topic] && _taxonomy.topics[topic].skipMeta;
        },

        getLink: function (topic) {
          return _taxonomy.topics[topic] ? _taxonomy.topics[topic].link : null;
        },

        getParents: function (topic) {
          const parents = [];
          const t = _taxonomy.topics[topic];
          if(t) {
            if (t.level3) {
              parents.push(t.level2);
              parents.push(t.level1);
            } else {
              if (t.level2) {
                parents.push(t.level1);
              }
            }
          }
          return parents;
        },

        getChildren: function (topic) {
          return _taxonomy.children[topic] || [];
        },

        getCategory: function (cat) {
          return _taxonomy.categories[cat] || [];
        },

        getCategoryTitle: function (cat) {
          return cat;
        }
      };
      return window.blog.taxonomy;
    });
}