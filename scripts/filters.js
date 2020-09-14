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
      toggleDropdown(dropdownContainer, document.body);
      // Set up document click event to close dropdowns.
      const documentClick = (event) => {
          const clickInDropdown = dropdownContainer.contains(event.target);
          const isOpen = dropdownContainer.classList.contains('is-open');
          if(isOpen && clickInDropdown !== true) {
              toggleDropdown(dropdownContainer, document.body);
              document.removeEventListener('click', documentClick, false);
          }
      }
      document.addEventListener('click', documentClick, false);
  });
}

/**
* Toggle dropddown
*/
function toggleDropdown(dropdownContainer, body) {
  dropdownContainer.classList.toggle('is-open');
  body.classList.toggle('page-overlay');
  // place tab focus on dropdown button after closing dropdown
  if (!dropdownContainer.classList.contains('is-open')) {
    dropdownContainer.querySelector('.filter-btn').focus();
  }
  // clear search
  document.querySelector('.filter-wrapper input[type="search"]').value = '';
  filterFilters();
}

/**
* Clear filters in dropdown(s).
*/
function clearFilters(dropdown) {
  const dropdowns = dropdown instanceof HTMLElement
    ? [dropdown] 
    : document.querySelectorAll('.dropdown');
  dropdowns.forEach((dropdown) => {
      const selectedFilters = dropdown.querySelectorAll('input:checked');
      selectedFilters.forEach((filter) => {
          filter.checked = false;
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
      toggleDropdown(dropdown, document.body);
    }
  });
  // show/hide selected filters
  let userFilters = '';
  Object.keys(filters).forEach((cat) => {
    filters[cat].forEach((filter, i) => userFilters += `<span>${filter}</span>`);
  });
  const selection = document.querySelector('.selection');
  const clearAllBtn = document.querySelector('.filter-bar > a.action.clear-all');
  selection.innerHTML = userFilters;
  if (userFilters.length > 0) {
    selection.classList.remove('hide');
    clearAllBtn.classList.remove('hide');
  } else {
    selection.classList.add('hide');
    clearAllBtn.classList.add('hide');
  }
  
  // apply filters
  callback(filters);
}

/**
 * Clear filters in dropdowns and apply empty
 */
export function clearAllFilters(callback) {
  event.stopPropagation();
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
        toggleDropdown(dropdownContainer, document.body);
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

function handleClearAll(callback) {
  const clearAllBtn = document.querySelector('.filter-bar > a.action.clear-all');
  clearAllBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    clearAllFilters(callback);
  });
  clearAllBtn.addEventListener('keyup', (event) => {
    event.stopPropagation();
    if (event.key === 'Enter') {
      clearAllFilters(callback);
    }
  });
}


function addButtonTitles() {
  document.querySelectorAll('.filter-bar a.action').forEach((btn) => {
    const title = window.getComputedStyle(btn, ':before').getPropertyValue('content');
    if (title !== 'normal' && title !== 'none') {
      btn.setAttribute('title', title.substring(1, title.length-1));
    }
  });
}

function getDrowdownHTML(taxonomy, category) {
  return `
  <div id="${category}" class="dropdown">
    <button role="button" tabindex="0" aria-haspopup="true" class="btn filter-btn" type="button">
      ${taxonomy.getCategoryTitle(category)}
      <span class="arrow">
        <span></span>
        <span></span>
      </span>
    </button>
    <div class="dropdown-menu">
      <div class="search">
        <svg xmlns="http://www.w3.org/2000/svg" class="search-icon" width="20" height="20" viewBox="0 0 24 24" focusable="false"><path d="M14 2A8 8 0 0 0 7.4 14.5L2.4 19.4a1.5 1.5 0 0 0 2.1 2.1L9.5 16.6A8 8 0 1 0 14 2Zm0 14.1A6.1 6.1 0 1 1 20.1 10 6.1 6.1 0 0 1 14 16.1Z"></path></svg>
        <input type="search" aria-label="Search" placeholder="Search...">
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
  const filterBar = document.querySelector('.filter-wrapper');
  if (!filterBar) {
    // topic has no filter bar
    return false;
  }
  // get filter config
  const filterList = filterBar.querySelectorAll('li');
  const categories = filterList
    ? Array.from(filterList).map((cat) => cat.innerText.trim())
    : [taxonomy.PRODUCTS]; // default to products filter
  const taxonomy = await getTaxonomy();
  let html = `<div class="filter-layout container">
    <div class="filter-bar">
      <div class="filter">
        ${categories.map(cat => getDrowdownHTML(taxonomy, cat)).join('')}
      </div>
      <a href="#" class="hide action quiet clear-all"></a>
      <div class="selection hide"></div>
    </div>
  </div>`;

  filterBar.innerHTML = html;

  filterBar.querySelectorAll('.dropdown').forEach((dropdown) => {
    const $cat = taxonomy.getCategory(dropdown.id);
    let optionsHTML = '';
    if ($cat) {
      $cat.querySelectorAll(':scope>ul>li').forEach((l) => {
        let lname = l.getAttribute('data-topic');
        if (lname) {
          lname = lname.replace(/\*/gm, '');
          optionsHTML += `<div class="option option">
            <input type="checkbox" id="${lname}" name="${lname}">
            <label for="${lname}">${lname}</label>
          </div>`;
        
          l.querySelectorAll(':scope>ul>li').forEach((p) => {
            let pname = p.getAttribute('data-topic');
            if (pname) {
              pname = pname.replace(/\*/gm, '');
              optionsHTML+=`<div class="option option-nested">
                <input type="checkbox" id="${pname}" name="${pname}">
                <label for="${pname}">${pname}</label>
              </div>`;
            }
          });
        }
      })
      dropdown.querySelector('.options').innerHTML = optionsHTML;
      initFilterActions(dropdown, callback);
    }
  });

  handleClearAll(callback);

  document.querySelector('main').appendChild(filterBar);
  setTimeout(() => addButtonTitles(), 200);
  return true;
}

export async function addFilters(callback) {
  if (await drawFilterBar(callback)) {
    loadCSS('/style/filters.css');
    setTimeout(() => document.querySelector('.filter-wrapper').classList.remove('hide'), 200);
  }
}

