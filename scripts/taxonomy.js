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

const CATEGORIES = 'categories';
const PRODUCTS = 'products';
const INDUSTRIES = 'industries';
const INTERNALS = 'internals';
let _taxonomy;

export async function getTaxonomy(lang, url) {
  if (_taxonomy) {
    return _taxonomy;
  }

  const escapeTopic = (topic) => {
    if (!topic) return null;
    return topic.replace(/\n/gm, ' ').trim();
  }

  // TODO restore
  // const target = url || `/${lang}/_taxonomy.json`;
  const target = url || `/${lang}/drafts/alex/_taxonomy.json`;

  return fetch(target)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      const _data = {
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
          if (_data.topics[name]) return;

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
            category: row[H.type] ? row[H.type].trim().toLowerCase() : INTERNALS,
            hidden: row[H.hidden] ? row[H.hidden].trim() !== '' : false,
            skipMeta: row[H.excludeFromMetadata] ? row[H.excludeFromMetadata].trim() !== '' : false,
          }

          _data.topics[name] = item;
          
          if (!_data.categories[item.category]) {
            _data.categories[item.category] = [];
          }
          _data.categories[item.category].push(item);

          if (level3) {
            if (!_data.children[level2]) {
              _data.children[level2] = [];
            }
            _data.children[level2].push(level3);
          }

          if (level2) {
            if (!_data.children[level1]) {
              _data.children[level1] = [];
            }
            _data.children[level1].push(level2);
          }

        });
      }

      _taxonomy = {
        CATEGORIES,
        PRODUCTS,
        INDUSTRIES,
        INTERNALS,
        NO_INTERLINKS,

        isUFT: function (topic) {
          return _data.topics[topic] && !_data.topics[topic].hidden;
        },

        skipMeta: function (topic) {
          return _data.topics[topic] && _data.topics[topic].skipMeta;
        },

        getLink: function (topic) {
          return _data.topics[topic] ? _data.topics[topic].link : null;
        },

        getParents: function (topic) {
          const parents = [];
          const t = _data.topics[topic];
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
          return _data.children[topic] || [];
        },

        getCategory: function (cat) {
          return _data.categories[cat.toLowerCase()] || [];
        },

        getCategoryTitle: function (cat) {
          return cat.charAt(0).toUpperCase() + cat.substring(1);
        }
      };
      return _taxonomy;
    });
}