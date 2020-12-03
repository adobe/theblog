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

/**
 * Returns the taxonomy object
 * @param {string} lang Language of the taxonomy
 * @param {*} url URL to use to load the taxonomy
 * @returns {object} The taxonomy object
 */
export async function getTaxonomy(lang, url) {
  if (_taxonomy) {
    return _taxonomy;
  }

  const escapeTopic = (topic) => {
    if (!topic) return null;
    return topic.replace(/\n/gm, ' ').trim();
  }

  const isProduct = (cat) => {
    return cat && cat.toLowerCase() === PRODUCTS;
  }

  const target = url || `/${lang}/topics/_taxonomy.json`;
 
  return fetch(target)
    .then((response) => {
      return response.json();
    })
    .then((json) => {
      const _data = {
        topics: {},
        products: {},
        categories: {},
        topicChildren: {},
        productChildren: {}
      };

      if (json && json.data && json.data.length > 0) {
        const H = HEADERS;
        let level1, level2;
        json.data.forEach((row) => {
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

          const category = row[H.type] ? row[H.type].trim().toLowerCase() : INTERNALS;

          // skip duplicates
          if (!isProduct(category) && _data.topics[name]) return;
          if (isProduct(category) && _data.products[name]) return;

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
            category,
            hidden: row[H.hidden] ? row[H.hidden].trim() !== '' : false,
            skipMeta: row[H.excludeFromMetadata] ? row[H.excludeFromMetadata].trim() !== '' : false,
          }

          if (!isProduct(category)) {
            _data.topics[name] = item;
          } else {
            _data.products[name] = item;
          }
          
          if (!_data.categories[item.category]) {
            _data.categories[item.category] = [];
          }

          if (_data.categories[item.category].indexOf(name) === -1) {
            _data.categories[item.category].push(item.name);
          }

          const children = isProduct(category) ? _data.productChildren : _data.topicChildren;
          if (level3) {
            if (!children[level2]) {
              children[level2] = [];
            }
            if (children[level2].indexOf(level3) === -1) {
              children[level2].push(level3);
            }
          }

          if (level2) {
            if (!children[level1]) {
              children[level1] = [];
            }
            if (children[level1].indexOf(level2) === -1) {
              children[level1].push(level2);
            }
          }

        });
      }

      const findItem = (topic, cat) => {
        let t = _data.topics[topic];
        if (isProduct(cat)) {
          t = _data.products[topic];
        }
        return t;
      };

      _taxonomy = {
        CATEGORIES,
        INDUSTRIES,
        INTERNALS,
        PRODUCTS,
        NO_INTERLINKS,

        lookup: function(topic) {
          // might be a product (product would have priori)
          let t = this.get(topic, PRODUCTS);
          if (!t) {
            // might be a product without the leading Adobe
            t = this.get(topic.replace('Adobe ', ''), PRODUCTS);
            if (!t) {
              t = this.get(topic);
            }
          }
          return t;
        },

        get: function(topic, cat) {
          // take first one of the list
          let t = findItem(topic, cat);
          if (t) {
            return {
              name: t.name,
              link: this.getLink(t.name, cat),
              isUFT: this.isUFT(t.name, cat),
              skipMeta: this.skipMeta(t.name, cat),

              level: t.level,
              parents: this.getParents(t.name, cat),
              children: this.getChildren(t.name, cat),

              category: this.getCategoryTitle(t.category)
            }
          }
          return null;
        },

        isUFT: function (topic, cat) {
          let t = findItem(topic, cat);
          return t && !t.hidden;
        },

        skipMeta: function (topic, cat) {
          let t = findItem(topic, cat);
          return t && t.skipMeta;
        },

        getLink: function (topic, cat) {
          let t = findItem(topic, cat);
          return t ? t.link : null;
        },

        getParents: function (topics, cat) {
          let list = typeof topics === 'string' ? [topics] : topics;
          const parents = [];
          list.forEach(topic => {
            let t = findItem(topic, cat);
            if(t) {
              if (t.level3) {
                if (parents.indexOf(t.level2) === -1) parents.push(t.level2);
                if (parents.indexOf(t.level1) === -1) parents.push(t.level1);
              } else {
                if (t.level2 && parents.indexOf(t.level1) === -1) {
                  parents.push(t.level1);
                }
              }
            }
          });
          return parents;
        },

        getChildren: function (topic, cat) {
          const children = isProduct(cat) ? _data.productChildren : _data.topicChildren;
          return children[topic] || [];
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