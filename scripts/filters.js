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
          const clearCurrentFiltersButton = dropdownContainer.querySelector('.action.clear-all')
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
export function clearAllFilters(allFilterOptions) {
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
  // Clear all buttons
  document.querySelectorAll('.filter-wrapper a.action.clear').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      const allFilterOptions = document.querySelectorAll('.dropdown-menu');
      clearAllFilters(allFilterOptions);
      callback([]);
    });
  });
  // Apply button
  document.querySelector('.action.apply').addEventListener('click', (event) => {
    event.stopPropagation();
    const filters = [];
    document.querySelectorAll('.filter-wrapper input[type="checkbox"]').forEach((filter) => {
      if (filter.checked) filters.push(filter.name);
    });
    toggleDropdown(document.querySelector('.dropdown'), document.body);
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
  filterBar.innerHTML = 
  `<div class="filter-layout container">
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
                <h2>Hi</h2>
              </div>
              <fieldset>
                <div class="options">
                  <legend>Creative Cloud</legend>
                  <div class="option">
                    <input type="checkbox" id="aero" name="Aero">
                    <label for="aero">Aero</label>
                  </div>
                  <div class="option">
                    <input type="checkbox" id="fresco" name="Fresco">
                    <label for="fresco">Fresco</label>
                  </div>
                  <div class="option">
                    <input type="checkbox" id="photoshop" name="Photoshop">
                    <label for="photoshop">Photoshop</label>
                  </div>
                  <div class="option">
                    <input type="checkbox" id="lightroom" name="Lightroom">
                    <label for="lightroom">Lightroom</label>
                  </div>
                  <div class="option">
                    <input type="checkbox" id="lightroomClassic" name="Lightroom Classic">
                    <label for="lightroomClassic">Lightroom Classic</label>
                  </div>
                  <div class="option">
                    <input type="checkbox" id="stock" name="Stock">
                    <label for="stock">Stock</label>
                  </div>
                  <div class="option">
                    <input type="checkbox" id="premierePro" name="Premiere Pro">
                    <label for="premierePro">Premiere Pro</label>
                  </div>
                  <div class="option">
                    <input type="checkbox" id="xd" name="XD">
                    <label for="xd">XD</label>
                  </div>
                  <div class="option">
                    <input type="checkbox" id="inDesign" name="InDesign">
                    <label for="inDesign">InDesign</label>
                  </div>
                  <div class="option">
                    <input type="checkbox" id="afterEffects" name="After Effects">
                    <label for="afterEffects">After Effects</label>
                  </div>
                  <div class="option">
                    <input type="checkbox" id="dimension" name="Dimension">
                    <label for="dimension">Dimension</label>
                  </div>
                  <div class="option">
                    <input type="checkbox" id="dreamweaver" name="Dreamweaver">
                    <label for="dreamweaver">Dreamweaver</label>
                  </div>
                  <div class="option">
                    <input type="checkbox" id="animate" name="Animate">
                    <label for="animate">Animate</label>
                  </div>
                  <div class="option">
                    <input type="checkbox" id="audition" name="Audition">
                    <label for="audition">Audition</label>
                  </div>
                  <div class="option">
                    <input type="checkbox" id="premiereRush" name="Premiere Rush">
                    <label for="premiereRush">Premiere Rush</label>
                  </div>
                  <div class="option">
                    <input type="checkbox" id="story" name="Story">
                    <label for="story">Story</label>
                  </div>
                  <div class="option">
                    <input type="checkbox" id="characterAnimator" name="Character Animator">
                    <label for="characterAnimator">Character Animator</label>
                  </div>
                  <div class="option">
                    <input type="checkbox" id="creativeCloudMobileApps" name="Creative Cloud MobileApps">
                    <label for="creativeCloudMobileApps">Creative Cloud Mobile Apps</label>
                  </div>
                  <div class="option">
                    <input type="checkbox" id="illustrator" name="Illustrator">
                    <label for="illustrator">Illustrator</label>
                  </div>
                  <div class="option">
                    <input type="checkbox" id="spark" name="Spark">
                    <label for="spark">Spark</label>
                  </div>
                  <div class="option">
                    <input type="checkbox" id="substanceByAdobe" name="Substance By Adobe">
                    <label for="substanceByAdobe">Substance by Adobe</label>
                  </div>
                  <legend>Document Cloud</legend>
                  <div class="option">
                    <input type="checkbox" id="acrobatDc" name="Acrobat DC">
                    <label for="acrobatDc">Acrobat DC</label>
                  </div>
                  <div class="option">
                    <input type="checkbox" id="acrobatScan" name="Acrobat Scan">
                    <label for="acrobatScan">Acrobat Scan</label>
                  </div>
                  <div class="option">
                    <input type="checkbox" id="acrobatSign" name="Acrobat Sign">
                    <label for="acrobatSign">Acrobat Sign</label>
                  </div>
                   <legend>Experience Cloud</legend>
                  <div class="option">
                    <input type="checkbox" id="marketingCloud" name="Marketing Cloud">
                    <label for="marketingCloud">Marketing Cloud</label>
                  </div>
                  <div class="option">
                    <input type="checkbox" id="experienceManager" name="Experience Manager">
                    <label for="experienceManager">Experience Manager</label>
                  </div>
                  <div class="option">
                    <input type="checkbox" id="target" name="Target">
                    <label for="target">Target</label>
                  </div>
                  <div class="option">
                    <input type="checkbox" id="campaign" name="Campaign">
                    <label for="campaign">Campaign</label>
                  </div>
                  <div class="option">
                    <input type="checkbox" id="marketoEngage" name="Marketo Engage">
                    <label for="marketoEngage">Marketo Engage</label>
                  </div>
                  <div class="option">
                    <input type="checkbox" id="analyticsCloud" name="Analytics Cloud">
                    <label for="analyticsCloud">Analytics Cloud</label>
                  </div>
                  <div class="option">
                    <input type="checkbox" id="analytics" name="Analytics">
                    <label for="analytics">Analytics</label>
                  </div>
                  <div class="option">
                    <input type="checkbox" id="audienceManager" name="Audience Manager">
                    <label for="audienceManager">Audience Manager</label>
                  </div>
                  <div class="option">
                    <input type="checkbox" id="advertisingCloud" name="Advertising Cloud">
                    <label for="advertisingCloud">Advertising Cloud</label>
                  </div>
                  <div class="option">
                    <input type="checkbox" id="CommerceCloud" name="Commerce Cloud">
                    <label for="CommerceCloud">Commerce Cloud</label>
                  </div>
                  <div class="option">
                    <input type="checkbox" id="magentoCommerce" name="Magento Commerce">
                    <label for="magentoCommerce">Magento Commerce</label>
                  </div>
                  <legend>Other</legend>
                  <div class="option">
                    <input type="checkbox" id="Connect" name="Connect">
                    <label for="Connect">Connect</label>
                  </div>
                  <div class="option">
                    <input type="checkbox" id="technicalCommunicationsSuite" name="Technical Communications Suite">
                    <label for="technicalCommunicationsSuite">Technical Communications Suite</label>
                  </div>
                  <div class="option">
                    <input type="checkbox" id="pdfPrintEngine" name="PDF Print Engine">
                    <label for="pdfPrintEngine">PDF Print Engine</label>
                  </div>
                  <div class="option">
                    <input type="checkbox" id="postScript" name="PostScript">
                    <label for="postScript">PostScript</label>
                  </div>
                </div>
              </fieldset>
              <div class="footer">
                <a href="#" class="action quiet clear-all" title="Clear all"></a>
                <a href="#" class="action call-to-action apply" title="Apply"></a>
              </div>
          </div>
        </div>
      </div>
      <a href="#" class="action quiet clear-all"></a>
    </div>
    <span class="results"></span>
  </div>`;
  filterBar.parentNode.remove();
  return document.querySelector('main').appendChild(filterBar);
}

export function addFilters(callback) {
  if (drawFilterBar()) {
    loadCSS('/style/filters.css');
    initFilterActions(callback);
  }
}

