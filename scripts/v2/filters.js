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
  getTaxonomy,
} from '/scripts/taxonomy.js';
import {
  createTag,
} from '/scripts/v2/common.js';

/**
 * Set up a click event on filter button to show/hide dropdown menu.
 */
function handleDropdownButton(container) {
  const filterButton = container.querySelector('.filter-btn');
  filterButton.addEventListener('click', (event) => {
      event.stopPropagation();
      const currentDropdown =  event.currentTarget;
      const dropdownContainer = currentDropdown.parentElement;
      const categoryTitleName = currentDropdown.textContent;
      const categoryTitle = dropdownContainer.querySelector('.category h2');
      const clearCurrentFiltersButton = dropdownContainer.querySelector('.action.clear')
      // Populate category title.
      categoryTitle.textContent = categoryTitleName;
      // toggle dropdown menu open
      toggleDropdown(dropdownContainer);
      // Set up document click event to close dropdowns.
      const documentClick = (event) => {
          const clickInDropdown = dropdownContainer.contains(event.target);
          const isOpen = dropdownContainer.classList.contains('is-open');
          if(isOpen && clickInDropdown !== true) {
              toggleDropdown();
              document.removeEventListener('click', documentClick, false);
          }
      }
      document.addEventListener('click', documentClick, false);
  });
}

/**
* Toggle dropddown (and close others)
*/
function toggleDropdown(dropdownToToggle) {
  document.querySelectorAll('.dropdown').forEach((dropdown) => {
    if (dropdown === dropdownToToggle) {
      dropdown.classList.toggle('is-open');
      // place tab focus on dropdown button after closing dropdown
      if (!dropdown.classList.contains('is-open')) {
        dropdown.querySelector('.filter-btn').focus();
      }
    } else {
      dropdown.classList.remove('is-open');
    }
  });
  // toggle page overlay
  if (dropdownToToggle) {
    document.body.classList.toggle('page-overlay');
  } else {
    document.body.classList.remove('page-overlay');
  }
  // clear searches and filtered options
  document.querySelectorAll('.dropdown input[type="search"]').forEach(search => search.value = '');
  filterFilters();
}

/**
* Clear one or all filters in dropdown(s).
*/
function clearFilters(dropdown, filterToClear) {
  const dropdowns = dropdown instanceof HTMLElement
    ? [dropdown] 
    : document.querySelectorAll('.dropdown');
  dropdowns.forEach((dropdown) => {
      const selectedFilters = dropdown.querySelectorAll('input:checked');
      selectedFilters.forEach((filter) => {
        filter.checked = filterToClear ? filter.name !== filterToClear : false;
      });
  });
}

/**
 * Apply currently selected filters in all dropdowns.
 */
function applyCurrentFilters(callback, closeDropdown) {
  const filters = {};
  document.querySelectorAll('.dropdown').forEach((dropdown) => {
    const subFilters = [];
    dropdown.querySelectorAll('.option input[type="checkbox"]').forEach((filter) => {
      if (filter.checked) subFilters.push(filter.name);
    });
    if (subFilters.length) filters[dropdown.id] = subFilters;
    if (closeDropdown && dropdown.classList.contains('is-open')) {
      toggleDropdown();
    }
  });
  let selection = document.querySelector('.selection');
  if (Object.keys(filters).length > 0) {
    let userFilters = '';
    // filter links
    Object.keys(filters).forEach((cat) => {
      filters[cat].forEach((filter, i) => userFilters += `<a href="#" class="user-filter" tabindex="0">${filter}</>`);
    });
    userFilters += '<a href="#" class="action quiet clear-all"></a>';
    if (!selection) {
      selection = createTag('div', { class: 'selection container' });
      const selectionWrapper = createTag('div', { class: 'selection-wrapper' });
      selectionWrapper.appendChild(selection);
      document.querySelector('main').insertBefore(selectionWrapper, document.querySelector('articles'));
    }
    selection.innerHTML = userFilters;
    // handle clear all button
    const clearAllBtn = document.querySelector('.selection a.action.clear-all');
    clearAllBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      clearAllFilters(callback);
    });
    // handle filter links
    document.querySelectorAll('.selection a.user-filter').forEach((filter) => {
      // remove filter action
      filter.addEventListener('click', (event) => {
        clearFilters(null, event.target.textContent);
        applyCurrentFilters(callback);
      });
      const title = window.getComputedStyle(filter, ':before').getPropertyValue('content');
      if (title !== 'normal' && title !== 'none') {
        filter.setAttribute('title', title.substring(1, title.length-1).replace('$1', filter.textContent));
      }
    });
  } else {
    if (selection) selection.parentElement.remove();
  }
  
  // apply filters
  callback(filters);
}

/**
 * Clear filters in dropdowns and apply empty
 */
export function clearAllFilters(callback) {
  clearFilters();
  applyCurrentFilters(callback);
}

function filterFilters(event) {
  if (event && event.key !== 'Escape') {
    event.stopPropagation();
  }
  const value = event ? event.target.value : '';
  const container = event ? event.target.parentNode.parentNode.parentNode : document.querySelector('.filter-bar');
  container.querySelectorAll('.option input[type="checkbox"]').forEach((filter) => {
    if (value && !filter.name.toLowerCase().includes(value.toLowerCase())) {
      filter.checked = false; // deselect if hidden
      filter.parentNode.classList.add('hide');
    } else {
      filter.parentNode.classList.remove('hide');
    }
  });
  container.querySelectorAll('.options').forEach((optionContainer) => {
    if (value) {
      optionContainer.classList.add('filtered');
    } else {
      optionContainer.classList.remove('filtered');
    }
  });
}

function initFilterActions(dropdownContainer, callback) {
  if (typeof callback !== 'function') callback = function() {}; 
  handleDropdownButton(dropdownContainer);

  // Reset button
  dropdownContainer.querySelector('a.action.clear').addEventListener('click', (event) => {
    event.stopPropagation();
    clearFilters(dropdownContainer);
  });

  // Apply button
  dropdownContainer.querySelector('.action.apply').addEventListener('click', (event) => {
    event.stopPropagation();
    applyCurrentFilters(callback, true);
  });

  // Search field
  const searchField = dropdownContainer.querySelector('input[type="search"]');
  searchField.addEventListener('search', filterFilters);
  searchField.addEventListener('keyup', filterFilters);

  // Keyboard access
  document.body.addEventListener('keyup', (event) => {
    if (event.key === 'Escape') {
      if (dropdownContainer.classList.contains('is-open')) {
        toggleDropdown();
      }
    }
  });
  dropdownContainer.querySelector('.dropdown-menu').addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
      if (dropdownContainer.classList.contains('is-open')) {
        event.stopPropagation();
        applyCurrentFilters(callback);
      }
    }
  });
}

function i18n() {
  // add button titles
  document.querySelectorAll('.filter-bar a.action').forEach((btn) => {
    const title = window.getComputedStyle(btn, ':before').getPropertyValue('content');
    if (title !== 'normal' && title !== 'none') {
      btn.setAttribute('title', title.substring(1, title.length-1));
    }
  });
  // add search placeholder
  document.querySelectorAll('.dropdown-menu .search input').forEach((search) => {
    const placeholder = window.getComputedStyle(search, ':after').getPropertyValue('content');
    if (placeholder !== 'normal' && placeholder !== 'none') {
      search.setAttribute('placeholder', placeholder.substring(1, placeholder.length-1));
      search.setAttribute('aria-label', placeholder.substring(1, placeholder.length-1));
    }
  });
}

function getDrowdownHTML(taxonomy, category) {
  return `
  <div id="${category}" class="${category} dropdown">
    <button role="button" tabindex="0" aria-haspopup="true" class="btn filter-btn" type="button">
      <span class="arrow">
        <span></span>
        <span></span>
      </span>
    </button>
    <div class="dropdown-menu">
      <div class="search">
        <svg xmlns="http://www.w3.org/2000/svg" class="search-icon" width="20" height="20" viewBox="0 0 24 24" focusable="false"><path d="M14 2A8 8 0 0 0 7.4 14.5L2.4 19.4a1.5 1.5 0 0 0 2.1 2.1L9.5 16.6A8 8 0 1 0 14 2Zm0 14.1A6.1 6.1 0 1 1 20.1 10 6.1 6.1 0 0 1 14 16.1Z"></path></svg>
        <input type="search">
      </div>
      <div class="category">
        <h2>Category</h2>
      </div>
      <fieldset>
        <div class="options"></div>
      </fieldset>
      <div class="footer">
        <a href="#" class="action quiet clear"></a>
        <a href="#" class="action call-to-action apply"></a>
      </div>
    </div>
  </div>`;
}

async function drawFilterBar(callback) {
  /* transitional selector during roll-out of new filter components */
  const filterBar = document.querySelector('.filter-wrapper,.embed-internal-components');

  if (!filterBar) {
    // topic has no filter bar
    return false;
  }
  filterBar.className='filter-wrapper';

  // get filter config
  const taxonomy = await getTaxonomy(window.blog.language);
  const filterList = filterBar.querySelectorAll('li');
  const categories = filterList.length > 0
    ? Array.from(filterList).map((cat) => cat.innerText.trim())
    : [taxonomy.PRODUCTS]; // default to products filter
  let html = `<div class="filter-layout container">
    <div class="filter-bar">
      <div class="filter">
        ${categories.map(cat => getDrowdownHTML(taxonomy, cat)).join('')}
      </div>
    </div>
  </div>`;

  filterBar.innerHTML = html;

  filterBar.querySelectorAll('.dropdown').forEach((dropdown) => {
    const categoryName = dropdown.id;
    const cat = taxonomy.getCategory(categoryName);
    let optionsHTML = '';
    if (cat) {
      cat.forEach((topic) => {
        const item = taxonomy.get(topic, categoryName);
        if (item.level === 1) {
          const lname = item.name.replace(/\*/gm, '');
          optionsHTML += `<div class="option option">
            <input type="checkbox" id="${lname}" name="${lname}">
            <label for="${lname}">${lname}</label>
          </div>`;

          item.children.forEach((p) => {
            const pname = p.replace(/\*/gm, '');
            optionsHTML+=`<div class="option option-nested">
              <input type="checkbox" id="${pname}" name="${pname}">
              <label for="${pname}">${pname}</label>
            </div>`;
          });
        }
      });
      dropdown.querySelector('.options').innerHTML = optionsHTML;
      initFilterActions(dropdown, callback);
    }
  });

  document.querySelector('main').appendChild(filterBar);
  setTimeout(() => i18n(), 500);
  return true;
}

export async function addFilters(callback) {
  if (await drawFilterBar(callback)) {
    loadCSS('/style/filters.css');
  }
}

