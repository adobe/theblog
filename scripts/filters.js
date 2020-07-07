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

/**
 * Get filter buttons.
 * Set up a click event to show/hide dropdown menu.
 */
function handleDropdownButtons() {
  const getFilterButtons = document.querySelectorAll('.filter-btn');
  const body = document.querySelector('body');
  getFilterButtons.forEach((filterButton) => {
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
          toggleDropdown(dropdownContainer, body);
          // Set up document click event to close dropdowns.
          const documentClick = (event) => {
              const clickInDropdown = dropdownContainer.contains(event.target);
              const isOpen = dropdownContainer.classList.contains('is-open');
              if(isOpen && clickInDropdown !== true) {
                  toggleDropdown(dropdownContainer, body);
                  document.removeEventListener('click', documentClick, false);
                  clearCurrentFiltersButton.removeEventListener('click', clearCurrentFiltersClick, false);
              }
          }
          // Set up clearCurrentFiltersButton click event.
          const clearCurrentFiltersClick = (event) => {
              const currentFilterOptions = dropdownContainer.querySelectorAll('input:checked');
              clearCurrentFilters(currentFilterOptions);
          }
          document.addEventListener('click', documentClick, false);
          clearCurrentFiltersButton.addEventListener('click', clearCurrentFiltersClick, false);
      });
  });
}

/**
* Close dropddown
*/
function closeDropdown(dropdownContainer, body) {
  dropdownContainer.classList.remove('is-open');
  body.classList.remove('page-overlay');
}

/**
* Toggle dropddown
*/
function toggleDropdown(dropdownContainer, body) {
  dropdownContainer.classList.toggle('is-open');
  body.classList.toggle('page-overlay');
}

/**
* Clear ALL selected filters.
*/
function clearAllFilters(allFilterOptions) {
  allFilterOptions.forEach((option) => {
      const selectedFilters = option.querySelectorAll('input:checked');
      selectedFilters.forEach((filter) => {
          filter.checked = false;
      });
  });
}

/**
* Clear current selected filters.
*/
function clearCurrentFilters(currentFilterOptions) {
  currentFilterOptions.forEach((option) => {
      option.checked = false;
  });
}

function filterFilters(event) {
  const value = event.target.value;
  if (event.key !== 'Escape') {
    event.stopPropagation();
  }
  document.querySelectorAll('.filter-wrapper input[type="checkbox"]').forEach((filter) => {
    if (!filter.name.toLowerCase().includes(value)) {
      filter.checked = false; // deselect if hidden
      filter.parentNode.classList.add('hide');
    } else {
      filter.parentNode.classList.remove('hide');
    }
  });
  // hide legends without visible options
  document.querySelectorAll('.filter-wrapper legend').forEach((legend) => {
    if (value) {
      let elem = legend;
      let hasVisibleOptions = false;
      while (elem.nextElementSibling) {
        elem = elem.nextElementSibling;
        if (elem.tagName === 'LEGEND') break;
        if (!elem.classList.contains('hide')) {
          hasVisibleOptions = true;
          break;
        }
      }
      if (hasVisibleOptions) {
        legend.classList.remove('hide');
      } else {
        legend.classList.add('hide');
      }
    } else {
      legend.classList.remove('hide');
    }
  });
}

function initFilterActions(callback) {
  if (typeof callback !== 'function') callback = function() {}; 
  handleDropdownButtons();
  // Clear all button
  const clearAllBtn = document.querySelector('.filter-bar > a.action.clear-all');
  clearAllBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    const allFilterOptions = document.querySelectorAll('.dropdown-menu');
    clearAllFilters(allFilterOptions);
    closeDropdown(document.querySelector('.dropdown'), document.body);
    clearAllBtn.classList.add('hide');
    callback([]);
  });

  // Clear button
  document.querySelector('.filter-bar a.action.clear').addEventListener('click', (event) => {
      event.stopPropagation();
      const allFilterOptions = document.querySelectorAll('.dropdown-menu');
      clearAllFilters(allFilterOptions);
    });

  // Apply button
  document.querySelector('.filter-bar .action.apply').addEventListener('click', (event) => {
    event.stopPropagation();
    const filters = [];
    document.querySelectorAll('.filter-wrapper input[type="checkbox"]').forEach((filter) => {
      if (filter.checked) filters.push(filter.name);
    });
    toggleDropdown(document.querySelector('.dropdown'), document.body);
    if (filters.length > 0) {
      clearAllBtn.classList.remove('hide');
    } else {
      clearAllBtn.classList.add('hide');
    }
    callback(filters);
  });

  // Search field
  const searchField = document.querySelector('.filter-wrapper input[type="search"]');
  searchField.addEventListener('search', filterFilters);
  searchField.addEventListener('keyup', filterFilters);

  // ESC key
  document.body.addEventListener('keyup', (event) => {
    if (event.key === 'Escape') {
      closeDropdown(document.querySelector('.dropdown'), document.body);
    }
  })
}

function drawFilterBar() {
  const filterBar = document.querySelector('.filter-wrapper');
  if (!filterBar) {
    // topic has no filter bar
    return null;
  }
  filterBar.classList.remove('default');
  let html = `<div class="filter-layout container">
    <div class="filter-bar">
      <div class="filter">
        <div class="dropdown">
          <button class="btn filter-btn" type="button">
            Products &amp; Technology
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
                <div class="options">`;
                
  html+= `</div>
              </fieldset>
              <div class="footer">
                <a href="#" class="action quiet clear" title="Clear"></a>
                <a href="#" class="action call-to-action apply" title="Apply"></a>
              </div>
          </div>
        </div>
      </div>
      <a href="#" class="hide action quiet clear-all"></a>
    </div>
    <span class="results"></span>
  </div>`;

  fetch(`/${window.blog.language}/topics/_taxonomy.plain.html`)
  .then(resp => resp.text()
  .then((tax) => {
      const $tax=document.createElement('div');
      $tax.innerHTML=tax;
      let $productsAndTech;
      $tax.querySelectorAll('li').forEach((e) => {
        let t;
        if (e.firstChild) t=e.firstChild.textContent;
        if (t && t.toLowerCase() == 'products & technology') $productsAndTech=e;
      });
      let html='';
      if ($productsAndTech) {
        $productsAndTech.querySelectorAll(':scope>ul>li').forEach((l) => {
          html+=`<legend>${l.firstChild.textContent}</legend>`;
          
          l.querySelectorAll(':scope>ul>li').forEach((p) => {
          html+=`<div class="option">
            <input type="checkbox" id="${p.firstChild.textContent}" name="${p.firstChild.textContent}">
            <label for="${p.firstChild.textContent}">${p.firstChild.textContent}</label>
          </div>`
          })
        })
      document.querySelector('.filter-wrapper .options').innerHTML=html;
      }
    })  
  );

  filterBar.innerHTML=html;
  filterBar.parentNode.remove();
  return document.querySelector('main').appendChild(filterBar);
}

export function addFilters(callback) {
  if (drawFilterBar()) {
    loadCSS('/style/filters.css');
    initFilterActions(callback);
  }
}

