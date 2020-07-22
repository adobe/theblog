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
  
    return fetch('/en/topics/_taxonomy.plain.html')
      .then((response) => {
        return response.text();
      })
      .then((data) => {
        const dataContainer = document.createElement('div');
        dataContainer.innerHTML = data;
  
        dataContainer.querySelectorAll('li').forEach((e, i) => {
          if (e.firstChild) {
            e.setAttribute('data-topic',e.firstChild.textContent);
          }
        });
  
        const CATEGORIES = 'categories';
        const PRODUCTS = 'products';
        const INDUSTRIES = 'industries';
        const INTERNALS = 'internals';
  
        let div = dataContainer.firstElementChild.nextElementSibling;
        // second div contains Categories
        div.setAttribute('data-type', CATEGORIES);
        div = div.nextElementSibling;
        div.setAttribute('data-type', PRODUCTS);
        div = div.nextElementSibling;
        div.setAttribute('data-type', INDUSTRIES);
        div = div.nextElementSibling;
        div.setAttribute('data-type', INTERNALS);
  
  
        window.blog.taxonomy = {
          node: dataContainer,
          CATEGORIES,
          PRODUCTS,
          INDUSTRIES,
          INTERNALS,
  
          isUFT: function(topic) {
            let n = this.node.querySelector(`[data-type="${CATEGORIES}"] [data-topic="${topic}"]`);
            return !!n;
          },
  
          getParents: function(topic) {
            const parents = [];
            let n = this.node.querySelector(`[data-topic="${topic}"]`);
            while (n) {
              const parentTopic = n.getAttribute('data-topic');
              if (parentTopic) {
                parents.push(parentTopic);
              }
              n = n.parentElement;
            }
            return parents;
          },
  
          getChildren: function(topic) {
            const children = [];
            this.node.querySelectorAll(`[data-topic="${topic}"] li`).forEach((n) => {
              const t = n.getAttribute('data-topic');
              if (children.indexOf(t) === -1) {
                children.push(t);
              }
            });
            return children;
          },

          getCategory: function(cat) {
              return this.node.querySelector(`[data-type="${cat}"]`);
          }
        };
        return window.blog.taxonomy;
      });
  }