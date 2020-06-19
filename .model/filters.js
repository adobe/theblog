/**
 * Get filter buttons.
 * Set up a click event to show/hide dropdown menu.
 */
function handleDropdownButtons () {
    const getFilterButtons = document.querySelectorAll('.filter-btn');
    const body = document.querySelector('body');
    getFilterButtons.forEach((filterButton) => {
        filterButton.addEventListener('click', (event) => {
            event.stopPropagation();
            const currentDropdown =  event.currentTarget;
            const dropdownContainer = currentDropdown.parentElement;
            const categoryTitleName = currentDropdown.textContent;
            const categoryTitle = dropdownContainer.querySelector('.category h2');
            const clearCurrentFiltersButton = dropdownContainer.querySelector('.filter-clear')
            // Populate category title.
            categoryTitle.textContent = categoryTitleName;
            // toggle dropdown menu open
            dropdownContainer.classList.toggle('is-open');
            if(!body.classList.contains('page-overlay')) {
                body.classList.add('page-overlay');
            }
            // Set up document click event to close dropdowns.
            const documentClick = (event) => {
                const clickInDropdown = dropdownContainer.contains(event.target);
                const isOpen = dropdownContainer.classList.contains('is-open');
                if(isOpen && clickInDropdown !== true) {
                    closeDropdown(dropdownContainer, body);
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
function closeDropdown (dropdownContainer, body) {
    dropdownContainer.classList.remove('is-open');
    body.classList.remove('page-overlay');
}

/**
 * Clear ALL selected filters.
 */
function clearAllFilters (allFilterOptions) {
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
function clearCurrentFilters (currentFilterOptions) {
    currentFilterOptions.forEach((option) => {
        option.checked = false;
    });
}

function initFilterActions () {
    handleDropdownButtons();
    // Clear all button event.
    const clearAllFiltersButton = document.querySelector('.filter-clear-all');
    clearAllFiltersButton.addEventListener('click', (event) => {
        event.stopPropagation();
        const allFilterOptions = document.querySelectorAll('.dropdown-menu');

        clearAllFilters(allFilterOptions);
    });
}

initFilterActions();
