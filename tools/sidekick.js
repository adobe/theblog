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
/* global window, document */

/**
 * Creates a tag with the given name, attributes and listeners.
 * @param {string} name The tag name
 * @param {object} attrs An object containing the attributes (optional)
 * @param {object} lstnrs An object containing the listeners (optional)
 * @returns The new tag
 */
function createTag(name, attrs, lstnrs) {
  const el = document.createElement(name);
  if (typeof attrs === 'object') {
    for (const [key, value] of Object.entries(attrs)) {
      el.setAttribute(key, value);
    }
  }
  if (typeof lstnrs === 'object') {
    for (const [evt, fn] of Object.entries(lstnrs)) {
      if (typeof fn === 'function') {
        el.addEventListener(evt, fn);
      }
    }
  }
  return el;
}

/**
 * Creates a tag with the given name, attributes and listeners,
 * and appends it to the parent element.
 * @param {HTMLElement} parent The parent element
 * @param {string} name The tag name
 * @param {object} attrs An object containing the attributes (optional)
 * @param {object} lstnrs An object containing the listeners (optional)
 * @returns The new tag
 */
function appendTag(parent, name, attrs, lstnrs) {
  return parent.appendChild(createTag(name, attrs, lstnrs));
}

/**
 * A sidekick with helper tools.
 */
class Sidekick {
  /**
   * Creates a new sidekick.
   * @param {Document} doc The HTML document element 
   */
  constructor() {
    this.root = appendTag(document.body, 'div', {
      class: 'hlx-sidekick hidden',
    });
    this.add({
        class: 'preview',
        elements: [
          {
            name: 'button',
            listeners: {
              click: (event) => {
                alert(event.target.className);
              },
            },
          },
        ],
        callback: ($section) => {},
      });
    this.loadCSS();
  }

  /**
   * Shows/hides the sidekick.
   */
  toggle() {
    this.root.classList.toggle('hidden');
    return this;
  }

  /**
   * Adds a section to the sidekick.
   * @param {object} sections The section configuration
   */
  add(sections) {
    if (!Array.isArray(sections)) sections = [sections];
    sections.forEach((section) => {
      const $section = appendTag(this.root, 'div', { class: section.class });
      if (Array.isArray(section.elements)) {
        section.elements.forEach((elem) => {
          appendTag($section, elem.name, elem.attributes, elem.listeners);
        })
      }
      if (typeof section.callback === 'function') {
        section.callback($section);
      }
    });
    return this;
  }

  /**
   * Loads the sidekick CSS.
   * @param {string} path The path to the CSS file (optional)
   */
  loadCSS(path) {
    let href = path;
    if (!href) {
      const scripts = document.head.getElementsByTagName('script');
      href = scripts[scripts.length - 1].src.replace('.js', '.css');
    }
    appendTag(document.head, 'link', {
      rel: 'stylesheet',
      href,
    });
    return this;
  }
}

if (!window.sidekick) {
  window.sidekick = new Sidekick().toggle();
}
