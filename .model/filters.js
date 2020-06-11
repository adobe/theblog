/**
 * Get filter buttons.
 * Set up a click event to show/hide dropdown menu.
 */
function handleDropdownButtons () {
    const getFilterBtns = document.querySelectorAll('.filter-btn');

    getFilterBtns.forEach((filterBtn) => {
        filterBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            const currentDropdown =  event.currentTarget;
            const dropdownContainer = currentDropdown.parentElement;
            // toggle dropdown menu open
            currentDropdown.parentElement.classList.toggle('is-open');
            // Set up document click event to close dropdowns.
            const documentClick = (event) => {
                const clickInDropdown = currentDropdown.parentElement.contains(event.target);
                const isOpen = currentDropdown.parentElement.classList.contains('is-open')
                if(isOpen && clickInDropdown !== true) {
                    dropdownContainer.classList.remove('is-open');
                    document.removeEventListener('click', documentClick, false);
                }
            }
            document.addEventListener('click', documentClick, false);
        });
    });
}

/**
 * Clear all selected filters.
 */
function clearFilters (allFilterOptions) {
    allFilterOptions.forEach((option) => {
        const selectedFilters = option.querySelectorAll('input:checked');

        selectedFilters.forEach((filter) => {
            filter.checked = false;
        });
    });
}

function initFilterActions () {
    handleDropdownButtons();
    // Clear all button event.
    const clearFiltersButton = document.querySelector('.filter-clear');
    clearFiltersButton.addEventListener('click', (event) => {
        event.stopPropagation();
        const allFilterOptions = document.querySelectorAll('.dropdown-menu');

        clearFilters(allFilterOptions);
    });
}

initFilterActions();
