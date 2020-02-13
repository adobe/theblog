/* global history */
const DATA_REMEMBER_CLOSE_ACTION = 'data-remember-close-action';
const IS_OPEN = 'is-Open';

class Modal {
    constructor(element) {
        this.element = element;
        if (this.getDisplayType() === 'onHashChange') {
            this.getOverlay();
            this.setupOverlayClick();
            this.setupCloseEscape();
        }
        // Always get a close button
        this.setupCloseClick();
        // setting the focusable elements of a modal
        this.setFocusableElements();
        this.element.addEventListener('keydown', event => this.handleTabAccessibility(event));
    }

    setFocusableElements() {
        this.focusableEls = this.element.querySelectorAll('a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex="0"]');
        this.lastFocusableEl = this.focusableEls[this.focusableEls.length - 1];
        [this.firstFocusableEl] = this.focusableEls;
    }

    isCloseEnabledRepeatUser() {
        const repeatUser = window.localStorage.getItem(this.getUserStorageValue());
        const closeButton = this.element.querySelector('.helix-CloseButton');
        return closeButton.hasAttribute(DATA_REMEMBER_CLOSE_ACTION) && JSON.parse(repeatUser);
    }

    getDisplayType() {
        return this.element.parentElement.dataset.confDisplay;
    }

    getId() {
        return this.element.id;
    }

    getDelay() {
        const delay = this.element.parentElement.dataset.confDelay;
        return parseInt(delay, 10);
    }

    getPageName() {
        return this.element.parentElement.dataset.pageName;
    }

    getUserStorageValue() {
        // creating the localstorage key in the format : modalId_pageName
        const pageName = this.getPageName();
        return this.getId().concat('_', pageName);
    }

    setupCloseClick() {
        const closeButton = this.element.querySelector('.helix-CloseButton');
        const closeButtonHandler = (event) => {
            event.stopPropagation();
            event.preventDefault();
            if (closeButton.hasAttribute(DATA_REMEMBER_CLOSE_ACTION)) {
                // setting the userVisited to true
                window.localStorage.setItem(this.getUserStorageValue(), true);
            }
            this.close();
            // analytics for close button
            this.sendCloseAnalytics();
        };
        closeButton.addEventListener('click', closeButtonHandler);
    }

    sendCloseAnalytics() {
        /* eslint-disable no-underscore-dangle */
        if (window.digitalData && window._satellite) {
            window.digitalData._set('primaryEvent.eventInfo.eventName', window.digitalData._get('digitalData.page.pageInfo.pageName').concat(':tryFreeCloseClick', this.getId()));
            window._satellite.track('event', {
                digitalData: window.digitalData._snapshot(),
            });
        }
        /* eslint-enable no-underscore-dangle */
    }

    getOverlay() {
        this.modalOverlay = this.element.parentElement;
    }

    setupOverlayClick() {
        const overlayHandler = (event) => {
            if (event.target.classList.contains('helix-Modal_overlay')) {
                event.stopPropagation();
                event.preventDefault();
                this.close();
            }
        };
        this.modalOverlay.addEventListener('click', overlayHandler);
    }

    open() {
        this.isOpen = true;
        if (this.modalOverlay) {
            this.modalOverlay.classList.add(IS_OPEN);
        }
        this.element.parentElement.classList.add(IS_OPEN);
        this.element.classList.add(IS_OPEN);

        // saving the focused element before open
        this.focusedElBeforeOpen = document.activeElement;
        if (this.firstFocusableEl) {
            this.firstFocusableEl.focus();
        }
    }

    close() {
        this.isOpen = false;
        if (this.modalOverlay) {
            this.modalOverlay.classList.remove(IS_OPEN);
        }
        this.element.classList.remove(IS_OPEN);
        const pageScroll = document.documentElement.scrollTop;
        /* removes the hash value but leaves a '#' */
        window.location.hash = '';
        this.resetFocus();
        window.scrollTo(0, pageScroll);
    }

    resetFocus() {
        try {
            this.focusedElBeforeOpen.focus();
        } catch (e) {
            // prevent console error
        }
    }

    handleBackwardTab(event) {
        if (document.activeElement === this.firstFocusableEl) {
            event.preventDefault();
            if (this.lastFocusableEl) {
                this.lastFocusableEl.focus();
            }
        }
    }

    handleForwardTab(event) {
        if (document.activeElement === this.lastFocusableEl) {
            event.preventDefault();
            if (this.firstFocusableEl) {
                this.firstFocusableEl.focus();
            }
        }
    }

    handleTabAccessibility(event) {
        if (event.which && event.which === 9) {
            const isShift = event.shiftKey;
            if (this.focusableEls.length === 1) {
                event.preventDefault();
            }
            if (isShift) {
                this.handleBackwardTab(event);
            } else {
                this.handleForwardTab(event);
            }
        }
    }

    setupCloseEscape() {
        document.onkeydown = (event) => {
            let isEscape = false;
            if ('key' in event) {
                isEscape = (event.key === 'Escape' || event.key === 'Esc');
            } else {
                isEscape = (event.keyCode === 27);
            }
            if (isEscape) {
                this.close();
            }
        };
    }
}
export { Modal };
