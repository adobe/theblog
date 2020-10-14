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

export async function getTaxonomy() {
  if (window.blog.taxonomy) {
    return window.blog.taxonomy;
  }

  return fetch(`/${window.blog.language}/topics/_taxonomy.plain.html`)
    .then((response) => {
      return response.text();
    })
    .then((data) => {
      const dataContainer = document.createElement('div');
      dataContainer.innerHTML = data.replace(/<(\/)?strong>/gm, '');

      // remove first div which contains the intro text
      dataContainer.querySelector('div').remove();

      dataContainer.querySelectorAll('li').forEach((e, i) => {
        if (e.firstChild && e.firstChild.textContent) {
          let topic = e.firstChild.textContent.trim();
          if (topic.indexOf('*') !== -1) {
            e.setAttribute('data-nuft', 'true');
            topic = topic.replace(/\*/gm, '');
          }

          e.setAttribute('data-topic', topic.trim());
        }
      });

      const CATEGORIES = 'categories';
      const PRODUCTS = 'products';
      const INDUSTRIES = 'industries';
      const INTERNALS = 'internals';

      if (dataContainer.firstElementChild) {
        let div = dataContainer.firstElementChild;
        // first div contains Categories
        div.setAttribute('data-type', CATEGORIES);
        div = div.nextElementSibling;
        if (div) {
          div.setAttribute('data-type', PRODUCTS);
          div = div.nextElementSibling;
          if (div) {
            div.setAttribute('data-type', INDUSTRIES);
            div = div.nextElementSibling;
            if (div) {
              div.setAttribute('data-type', INTERNALS);
            }
          }
        }
      }

      const escapeTopic = (topic) => {
        return topic.replace(/\n/gm, ' ');
      }


      window.blog.taxonomy = {
        node: dataContainer,
        CATEGORIES,
        PRODUCTS,
        INDUSTRIES,
        INTERNALS,

        isUFT: function (topic) {
          try {
            let n = this.node.querySelector(`[data-topic="${escapeTopic(topic)}"]`);
            return n && n.getAttribute('data-nuft') !== 'true';
          } catch (error) {
            console.error(`isUFT error with topic "${topic}"`, error);
            return false;
          }
        },

        getParents: function (topic) {
          try {
            const parents = [];
            let n = this.node.querySelector(`[data-topic="${escapeTopic(topic)}"]`);
            while (n) {
              const parentTopic = n.getAttribute('data-topic');
              if (parentTopic && this.isUFT(parentTopic)) {
                parents.push(parentTopic);
              }
              n = n.parentElement;
            }
            return parents;
          } catch (error) {
            console.error(`getParents error with topic "${topic}"`, error);
            return [];
          }
        },

        getChildren: function (topic) {
          try {
            const children = [];
            this.node.querySelectorAll(`[data-topic="${escapeTopic(topic)}"] li`).forEach((n) => {
              const t = n.getAttribute('data-topic');
              if (children.indexOf(t) === -1) {
                children.push(t);
              }
            });
            return children;
          } catch (error) {
            console.error(`getChildren error with topic "${topic}"`, error);
            return [];
          }
        },

        getCategory: function (cat) {
          return this.node.querySelector(`[data-type="${cat}"]`);
        },

        getCategoryTitle: function (cat) {
          return this.node.querySelector(`[data-type="${cat}"] > p`).innerText.trim();
        }
      };
      return window.blog.taxonomy;
    });
}