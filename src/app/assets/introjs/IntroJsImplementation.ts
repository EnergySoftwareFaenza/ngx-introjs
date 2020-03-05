import { IntroJsOptions } from './IntroJsOptions';
import { DOMEvent } from './DOMEvent';
export class IntroJsImplementation {
    private DOMEvent;
    public _targetElement: any;
    public _introItems: any[];
    public _options: IntroJsOptions;
    public _currentStep: any;
    public _currentStepNumber: any;
    public _introCompleteCallback: any;
    public _introBeforeChangeCallback: any;
    public _introBeforeExitCallback: any;
    public _introExitCallback: any;
    public _introChangeCallback: any;
    public _introAfterChangeCallback: any;
    public _lastShowElementTimer: any;
    public _introSkipCallback: any;
    public _hintCloseCallback: any;
    public _hintsAddedCallback: any;
    public _hintClickCallback: any;
    public _direction: any;
    constructor(obj) {
        this._targetElement = obj;
        this._introItems = [];
        this.DOMEvent = new DOMEvent();
        this._options = {
            /* Next button label in tooltip box */
            nextLabel: 'Next &rarr;',
            /* Previous button label in tooltip box */
            prevLabel: '&larr; Back',
            /* Skip button label in tooltip box */
            skipLabel: 'Skip',
            /* Done button label in tooltip box */
            doneLabel: 'Done',
            /* Hide previous button in the first step? Otherwise, it will be disabled button. */
            hidePrev: false,
            /* Hide next button in the last step? Otherwise, it will be disabled button. */
            hideNext: false,
            /* Default tooltip box position */
            tooltipPosition: 'bottom',
            /* Next CSS class for tooltip boxes */
            tooltipClass: '',
            /* CSS class that is added to the helperLayer */
            highlightClass: '',
            /* Close introduction when pressing Escape button? */
            exitOnEsc: true,
            /* Close introduction when clicking on overlay layer? */
            exitOnOverlayClick: true,
            /* Show step numbers in introduction? */
            showStepNumbers: true,
            /* Let user use keyboard to navigate the tour? */
            keyboardNavigation: true,
            /* Show tour control buttons? */
            showButtons: true,
            /* Show tour bullets? */
            showBullets: true,
            /* Show tour progress? */
            showProgress: false,
            /* Scroll to highlighted element? */
            scrollToElement: true,
            /*
             * Should we scroll the tooltip or target element?
             *
             * Options are: 'element' or 'tooltip'
             */
            scrollTo: 'element',
            /* Padding to add after scrolling when element is not in the viewport (in pixels) */
            scrollPadding: 30,
            /* Set the overlay opacity */
            overlayOpacity: 0.8,
            /* Precedence of positions, when auto is enabled */
            positionPrecedence: ['bottom', 'top', 'right', 'left'],
            /* Disable an interaction with element? */
            disableInteraction: false,
            /* Set how much padding to be used around helper element */
            helperElementPadding: 10,
            /* Default hint position */
            hintPosition: 'top-middle',
            /* Hint button label */
            hintButtonLabel: 'Got it',
            /* Adding animation to hints? */
            hintAnimation: true,
            /* additional classes to put on the buttons */
            buttonClass: 'introjs-button',
            steps: [],
            hints: []
        };
    }
    public _introForElement(targetElm, group) {
        const allIntroSteps = targetElm.querySelectorAll('*[data-intro]');
        let introItems = [];
        if (this._options.steps) {
            // use steps passed programmatically
            this._forEach(this._options.steps, (step) => {
                const currentItem = this._cloneObject(step);
                // set the step
                currentItem.step = introItems.length + 1;
                // use querySelector function only when developer used CSS selector
                if (typeof (currentItem.element) === 'string') {
                    // grab the element with given selector from the page
                    currentItem.element = document.querySelector(currentItem.element);
                }
                // intro without element
                if (typeof (currentItem.element) === 'undefined' || currentItem.element === null) {
                    let floatingElementQuery = document.querySelector('.introjsFloatingElement');
                    if (floatingElementQuery === null) {
                        floatingElementQuery = document.createElement('div');
                        floatingElementQuery.className = 'introjsFloatingElement';
                        document.body.appendChild(floatingElementQuery);
                    }
                    currentItem.element = floatingElementQuery;
                    currentItem.position = 'floating';
                }
                currentItem.scrollTo = currentItem.scrollTo || this._options.scrollTo;
                if (typeof (currentItem.disableInteraction) === 'undefined') {
                    currentItem.disableInteraction = this._options.disableInteraction;
                }
                if (currentItem.element !== null) {
                    introItems.push(currentItem);
                }
            }, null);
        } else {
            // use steps from data-* annotations
            const elmsLength = allIntroSteps.length;
            let disableInteraction;
            // if there's no element to intro
            if (elmsLength < 1) {
                return false;
            }
            this._forEach(allIntroSteps, (currentElement) => {
                // PR #80
                // start intro for groups of elements
                if (group && (currentElement.getAttribute('data-intro-group') !== group)) {
                    return;
                }
                // skip hidden elements
                if (currentElement.style.display === 'none') {
                    return;
                }
                const step = parseInt(currentElement.getAttribute('data-step'), 10);
                if (typeof (currentElement.getAttribute('data-disable-interaction')) !== 'undefined') {
                    disableInteraction = !!currentElement.getAttribute('data-disable-interaction');
                } else {
                    disableInteraction = this._options.disableInteraction;
                }
                if (step > 0) {
                    introItems[step - 1] = {
                        element: currentElement,
                        intro: currentElement.getAttribute('data-intro'),
                        step: parseInt(currentElement.getAttribute('data-step'), 10),
                        tooltipClass: currentElement.getAttribute('data-tooltipclass'),
                        highlightClass: currentElement.getAttribute('data-highlightclass'),
                        position: currentElement.getAttribute('data-position') || this._options.tooltipPosition,
                        scrollTo: currentElement.getAttribute('data-scrollto') || this._options.scrollTo,
                        disableInteraction
                    };
                }
            }, null);
            // next add intro items without data-step
            // todo: we need a cleanup here, two loops are redundant
            let nextStep = 0;
            this._forEach(allIntroSteps, (currentElement) => {
                // PR #80
                // start intro for groups of elements
                if (group && (currentElement.getAttribute('data-intro-group') !== group)) {
                    return;
                }
                if (currentElement.getAttribute('data-step') === null) {
                    while (true) {
                        if (typeof introItems[nextStep] === 'undefined') {
                            break;
                        } else {
                            nextStep++;
                        }
                    }
                    if (typeof (currentElement.getAttribute('data-disable-interaction')) !== 'undefined') {
                        disableInteraction = !!currentElement.getAttribute('data-disable-interaction');
                    } else {
                        disableInteraction = this._options.disableInteraction;
                    }
                    introItems[nextStep] = {
                        element: currentElement,
                        intro: currentElement.getAttribute('data-intro'),
                        step: nextStep + 1,
                        tooltipClass: currentElement.getAttribute('data-tooltipclass'),
                        highlightClass: currentElement.getAttribute('data-highlightclass'),
                        position: currentElement.getAttribute('data-position') || this._options.tooltipPosition,
                        scrollTo: currentElement.getAttribute('data-scrollto') || this._options.scrollTo,
                        disableInteraction
                    };
                }
            }, null);
        }
        // removing undefined/null elements
        const tempIntroItems = [];
        for (let z = 0; z < introItems.length; z++) {
            if (introItems[z]) {
                // copy non-falsy values to the end of the array
                tempIntroItems.push(introItems[z]);
            }
        }
        introItems = tempIntroItems;
        // Ok, sort all items with given steps
        introItems.sort(function(a, b) {
            return a.step - b.step;
        });
        // set it to the introJs object
        this._introItems = introItems;
        // add overlay layer to the page
        if (this._addOverlayLayer.call(this, targetElm)) {
            // then, start the show
            this._nextStep.call(this);
            if (this._options.keyboardNavigation) {
                this.DOMEvent.on(window, 'keydown', this._onKeyDown, this, true);
            }
            // for window resize
            this.DOMEvent.on(window, 'resize', this._onResize, this, true);
        }
        return false;
    }
    private _onResize() {
        this._refresh();
    }
    private _onKeyDown(e) {
        let code = (e.code === null) ? e.which : e.code;
        // if code/e.which is null
        if (code === null) {
            code = (e.charCode === null) ? e.keyCode : e.charCode;
        }
        if ((code === 'Escape' || code === 27) && this._options.exitOnEsc === true) {
            // escape key pressed, exit the intro
            // check if exit callback is defined
            this._exitIntro(this._targetElement, null);
        } else if (code === 'ArrowLeft' || code === 37) {
            // left arrow
            this._previousStep();
        } else if (code === 'ArrowRight' || code === 39) {
            // right arrow
            this._nextStep();
        } else if (code === 'Enter' || code === 13) {
            // srcElement === ie
            const target = e.target || e.srcElement;
            if (target && target.className.match('introjs-prevbutton')) {
                // user hit enter while focusing on previous button
                this._previousStep();
            } else if (target && target.className.match('introjs-skipbutton')) {
                // user hit enter while focusing on skip button
                if (this._introItems.length - 1 === this._currentStep && typeof (this._introCompleteCallback) === 'function') {
                    this._introCompleteCallback();
                }
                this._exitIntro(this._targetElement, null);
            } else if (target && target.getAttribute('data-stepnumber')) {
                // user hit enter while focusing on step bullet
                target.click();
            } else {
                // default behavior for responding to enter
                this._nextStep();
            }
            // prevent default behaviour on hitting Enter, to prevent steps being skipped in some browsers
            if (e.preventDefault) {
                e.preventDefault();
            } else {
                e.returnValue = false;
            }
        }
    }
    private _cloneObject(object) {
        if (object === null || typeof (object) !== 'object' || typeof (object.nodeType) !== 'undefined') {
            return object;
        }
        const temp = {};
        for (const key in object) {
            if (typeof ((window as any).jQuery !== 'undefined' && object[key] instanceof (window as any).jQuery)) {
                temp[key] = object[key];
            } else {
                temp[key] = this._cloneObject(object[key]);
            }
        }
        return temp;
    }
    public _goToStep(step) {
        // because steps starts with zero
        this._currentStep = step - 2;
        if (typeof (this._introItems) !== 'undefined') {
            this._nextStep();
        }
    }
    public _goToStepNumber(step) {
        this._currentStepNumber = step;
        if (typeof (this._introItems) !== 'undefined') {
            this._nextStep();
        }
    }
    public _nextStep() {
        this._direction = 'forward';
        if (typeof (this._currentStepNumber) !== 'undefined') {
            this._forEach(this._introItems, (item, i) => {
                if (item.step === this._currentStepNumber) {
                    this._currentStep = i - 1;
                    this._currentStepNumber = undefined;
                }
            }, null);
        }
        if (typeof (this._currentStep) === 'undefined') {
            this._currentStep = 0;
        } else {
            ++this._currentStep;
        }
        const nextStep = this._introItems[this._currentStep];
        let continueStep = true;
        if (typeof (this._introBeforeChangeCallback) !== 'undefined') {
            continueStep = this._introBeforeChangeCallback.call(this, nextStep.element);
        }
        // if `onbeforechange` returned `false`, stop displaying the element
        if (continueStep === false) {
            --this._currentStep;
            return false;
        }
        if ((this._introItems.length) <= this._currentStep) {
            // end of the intro
            // check if any callback is defined
            if (typeof (this._introCompleteCallback) === 'function') {
                this._introCompleteCallback.call(this);
            }
            this._exitIntro(this._targetElement);
            return;
        }
        this._showElement(nextStep);
    }
    public _previousStep() {
        this._direction = 'backward';
        if (this._currentStep === 0) {
            return false;
        }
        --this._currentStep;
        const nextStep = this._introItems[this._currentStep];
        let continueStep = true;
        if (typeof (this._introBeforeChangeCallback) !== 'undefined') {
            continueStep = this._introBeforeChangeCallback(nextStep.element);
        }
        // if `onbeforechange` returned `false`, stop displaying the element
        if (continueStep === false) {
            ++this._currentStep;
            return false;
        }
        this._showElement(nextStep);
    }
    public _refresh() {
        // re-align intros
        this._setHelperLayerPosition.call(this, document.querySelector('.introjs-helperLayer'));
        this._setHelperLayerPosition.call(this, document.querySelector('.introjs-tooltipReferenceLayer'));
        this._setHelperLayerPosition.call(this, document.querySelector('.introjs-disableInteraction'));
        // re-align tooltip
        if (this._currentStep !== undefined && this._currentStep !== null) {
            const oldHelperNumberLayer = document.querySelector('.introjs-helperNumberLayer'), oldArrowLayer = document.querySelector('.introjs-arrow'), oldtooltipContainer = document.querySelector('.introjs-tooltip');
            this._placeTooltip(this._introItems[this._currentStep].element, oldtooltipContainer, oldArrowLayer, oldHelperNumberLayer, null);
        }
        // re-align hints
        this._reAlignHints();
    }
    public _exitIntro(targetElement, force = false) {
        let continueExit = true;
        // calling onbeforeexit callback
        //
        // If this callback return `false`, it would halt the process
        if (this._introBeforeExitCallback !== undefined) {
            continueExit = this._introBeforeExitCallback.call(this);
        }
        // skip this check if `force` parameter is `true`
        // otherwise, if `onbeforeexit` returned `false`, don't exit the intro
        if (!force && continueExit === false) {
            return;
        }
        // remove overlay layers from the page
        const overlayLayers = targetElement.querySelectorAll('.introjs-overlay');
        if (overlayLayers && overlayLayers.length) {
            this._forEach(overlayLayers, (overlayLayer) => {
                overlayLayer.style.opacity = 0;
                window.setTimeout(function() {
                    if (this.parentNode) {
                        this.parentNode.removeChild(this);
                    }
                }.bind(overlayLayer), 500);
            }, null);
        }
        // remove all helper layers
        const helperLayer = targetElement.querySelector('.introjs-helperLayer');
        if (helperLayer) {
            helperLayer.parentNode.removeChild(helperLayer);
        }
        const referenceLayer = targetElement.querySelector('.introjs-tooltipReferenceLayer');
        if (referenceLayer) {
            referenceLayer.parentNode.removeChild(referenceLayer);
        }
        // remove disableInteractionLayer
        const disableInteractionLayer = targetElement.querySelector('.introjs-disableInteraction');
        if (disableInteractionLayer) {
            disableInteractionLayer.parentNode.removeChild(disableInteractionLayer);
        }
        // remove intro floating element
        const floatingElement = document.querySelector('.introjsFloatingElement');
        if (floatingElement) {
            floatingElement.parentNode.removeChild(floatingElement);
        }
        this._removeShowElement();
        // remove `introjs-fixParent` class from the elements
        const fixParents = document.querySelectorAll('.introjs-fixParent');
        this._forEach(fixParents, (parent) => {
            this._removeClass(parent, /introjs-fixParent/g);
        }, null);
        // clean listeners
        this.DOMEvent.off(window, 'keydown', this._onKeyDown, this, true);
        this.DOMEvent.off(window, 'resize', this._onResize, this, true);
        // check if any callback is defined
        if (this._introExitCallback !== undefined) {
            this._introExitCallback.call(this);
        }
        // set the step to zero
        this._currentStep = undefined;
    }
    private _placeTooltip(targetElement, tooltipLayer, arrowLayer, helperNumberLayer, hintMode) {
        let tooltipCssClass = '', currentStepObj, tooltipOffset, targetOffset, windowSize, currentTooltipPosition;
        hintMode = hintMode || false;
        // reset the old style
        tooltipLayer.style.top = null;
        tooltipLayer.style.right = null;
        tooltipLayer.style.bottom = null;
        tooltipLayer.style.left = null;
        tooltipLayer.style.marginLeft = null;
        tooltipLayer.style.marginTop = null;
        arrowLayer.style.display = 'inherit';
        if (typeof (helperNumberLayer) !== 'undefined' && helperNumberLayer !== null) {
            helperNumberLayer.style.top = null;
            helperNumberLayer.style.left = null;
        }
        // prevent error when `this._currentStep` is undefined
        if (!this._introItems[this._currentStep]) {
            return;
        }
        // if we have a custom css class for each step
        currentStepObj = this._introItems[this._currentStep];
        if (typeof (currentStepObj.tooltipClass) === 'string') {
            tooltipCssClass = currentStepObj.tooltipClass;
        } else {
            tooltipCssClass = this._options.tooltipClass;
        }
        tooltipLayer.className = ('introjs-tooltip ' + tooltipCssClass).replace(/^\s+|\s+$/g, '');
        tooltipLayer.setAttribute('role', 'dialog');
        currentTooltipPosition = this._introItems[this._currentStep].position;
        // Floating is always valid, no point in calculating
        if (currentTooltipPosition !== 'floating') {
            currentTooltipPosition = this._determineAutoPosition(targetElement, tooltipLayer, currentTooltipPosition);
        }
        let tooltipLayerStyleLeft;
        targetOffset = this._getOffset(targetElement);
        tooltipOffset = this._getOffset(tooltipLayer);
        windowSize = this._getWinSize();
        this._addClass(tooltipLayer, 'introjs-' + currentTooltipPosition);
        switch (currentTooltipPosition) {
            case 'top-right-aligned':
                arrowLayer.className = 'introjs-arrow bottom-right';
                let tooltipLayerStyleRight = 0;
                this._checkLeft(targetOffset, tooltipLayerStyleRight, tooltipOffset, tooltipLayer);
                tooltipLayer.style.bottom = (targetOffset.height + 20) + 'px';
                break;
            case 'top-middle-aligned':
                arrowLayer.className = 'introjs-arrow bottom-middle';
                let tooltipLayerStyleLeftRight = targetOffset.width / 2 - tooltipOffset.width / 2;
                // a fix for middle aligned hints
                if (hintMode) {
                    tooltipLayerStyleLeftRight += 5;
                }
                if (this._checkLeft(targetOffset, tooltipLayerStyleLeftRight, tooltipOffset, tooltipLayer)) {
                    tooltipLayer.style.right = null;
                    this._checkRight(targetOffset, tooltipLayerStyleLeftRight, tooltipOffset, windowSize, tooltipLayer);
                }
                tooltipLayer.style.bottom = (targetOffset.height + 20) + 'px';
                break;
            case 'top-left-aligned':
            // top-left-aligned is the same as the default top
            case 'top':
                arrowLayer.className = 'introjs-arrow bottom';
                tooltipLayerStyleLeft = (hintMode) ? 0 : 15;
                this._checkRight(targetOffset, tooltipLayerStyleLeft, tooltipOffset, windowSize, tooltipLayer);
                tooltipLayer.style.bottom = (targetOffset.height + 20) + 'px';
                break;
            case 'right':
                tooltipLayer.style.left = (targetOffset.width + 20) + 'px';
                if (targetOffset.top + tooltipOffset.height > windowSize.height) {
                    // In this case, right would have fallen below the bottom of the screen.
                    // Modify so that the bottom of the tooltip connects with the target
                    arrowLayer.className = 'introjs-arrow left-bottom';
                    tooltipLayer.style.top = '-' + (tooltipOffset.height - targetOffset.height - 20) + 'px';
                } else {
                    arrowLayer.className = 'introjs-arrow left';
                }
                break;
            case 'left':
                if (!hintMode && this._options.showStepNumbers === true) {
                    tooltipLayer.style.top = '15px';
                }
                if (targetOffset.top + tooltipOffset.height > windowSize.height) {
                    // In this case, left would have fallen below the bottom of the screen.
                    // Modify so that the bottom of the tooltip connects with the target
                    tooltipLayer.style.top = '-' + (tooltipOffset.height - targetOffset.height - 20) + 'px';
                    arrowLayer.className = 'introjs-arrow right-bottom';
                } else {
                    arrowLayer.className = 'introjs-arrow right';
                }
                tooltipLayer.style.right = (targetOffset.width + 20) + 'px';
                break;
            case 'floating':
                arrowLayer.style.display = 'none';
                // we have to adjust the top and left of layer manually for intro items without element
                tooltipLayer.style.left = '50%';
                tooltipLayer.style.top = '50%';
                tooltipLayer.style.marginLeft = '-' + (tooltipOffset.width / 2) + 'px';
                tooltipLayer.style.marginTop = '-' + (tooltipOffset.height / 2) + 'px';
                if (typeof (helperNumberLayer) !== 'undefined' && helperNumberLayer !== null) {
                    helperNumberLayer.style.left = '-' + ((tooltipOffset.width / 2) + 18) + 'px';
                    helperNumberLayer.style.top = '-' + ((tooltipOffset.height / 2) + 18) + 'px';
                }
                break;
            case 'bottom-right-aligned':
                arrowLayer.className = 'introjs-arrow top-right';
                tooltipLayerStyleRight = 0;
                this._checkLeft(targetOffset, tooltipLayerStyleRight, tooltipOffset, tooltipLayer);
                tooltipLayer.style.top = (targetOffset.height + 20) + 'px';
                break;
            case 'bottom-middle-aligned':
                arrowLayer.className = 'introjs-arrow top-middle';
                tooltipLayerStyleLeftRight = targetOffset.width / 2 - tooltipOffset.width / 2;
                // a fix for middle aligned hints
                if (hintMode) {
                    tooltipLayerStyleLeftRight += 5;
                }
                if (this._checkLeft(targetOffset, tooltipLayerStyleLeftRight, tooltipOffset, tooltipLayer)) {
                    tooltipLayer.style.right = null;
                    this._checkRight(targetOffset, tooltipLayerStyleLeftRight, tooltipOffset, windowSize, tooltipLayer);
                }
                tooltipLayer.style.top = (targetOffset.height + 20) + 'px';
                break;
            // case 'bottom-left-aligned':
            // Bottom-left-aligned is the same as the default bottom
            // case 'bottom':
            // Bottom going to follow the default behavior
            default:
                arrowLayer.className = 'introjs-arrow top';
                tooltipLayerStyleLeft = 0;
                this._checkRight(targetOffset, tooltipLayerStyleLeft, tooltipOffset, windowSize, tooltipLayer);
                tooltipLayer.style.top = (targetOffset.height + 20) + 'px';
        }
    }
    private _checkRight(targetOffset, tooltipLayerStyleLeft, tooltipOffset, windowSize, tooltipLayer) {
        if (targetOffset.left + tooltipLayerStyleLeft + tooltipOffset.width > windowSize.width) {
            // off the right side of the window
            tooltipLayer.style.left = (windowSize.width - tooltipOffset.width - targetOffset.left) + 'px';
            return false;
        }
        tooltipLayer.style.left = tooltipLayerStyleLeft + 'px';
        return true;
    }
    private _checkLeft(targetOffset, tooltipLayerStyleRight, tooltipOffset, tooltipLayer) {
        if (targetOffset.left + targetOffset.width - tooltipLayerStyleRight - tooltipOffset.width < 0) {
            // off the left side of the window
            tooltipLayer.style.left = (-targetOffset.left) + 'px';
            return false;
        }
        tooltipLayer.style.right = tooltipLayerStyleRight + 'px';
        return true;
    }
    private _determineAutoPosition(targetElement, tooltipLayer, desiredTooltipPosition) {
        // Take a clone of position precedence. These will be the available
        const possiblePositions = this._options.positionPrecedence.slice();
        const windowSize = this._getWinSize();
        const tooltipHeight = this._getOffset(tooltipLayer).height + 10;
        const tooltipWidth = this._getOffset(tooltipLayer).width + 20;
        const targetElementRect = targetElement.getBoundingClientRect();
        // If we check all the possible areas, and there are no valid places for the tooltip, the element
        // must take up most of the screen real estate. Show the tooltip floating in the middle of the screen.
        let calculatedPosition = 'floating';
        /*
        * auto determine position
        */
        // Check for space below
        if (targetElementRect.bottom + tooltipHeight + tooltipHeight > windowSize.height) {
            this._removeEntry(possiblePositions, 'bottom');
        }
        // Check for space above
        if (targetElementRect.top - tooltipHeight < 0) {
            this._removeEntry(possiblePositions, 'top');
        }
        // Check for space to the right
        if (targetElementRect.right + tooltipWidth > windowSize.width) {
            this._removeEntry(possiblePositions, 'right');
        }
        // Check for space to the left
        if (targetElementRect.left - tooltipWidth < 0) {
            this._removeEntry(possiblePositions, 'left');
        }
        // @var {String}  ex: 'right-aligned'
        const desiredAlignment = (function(pos) {
            const hyphenIndex = pos.indexOf('-');
            if (hyphenIndex !== -1) {
                // has alignment
                return pos.substr(hyphenIndex);
            }
            return '';
        })(desiredTooltipPosition || '');
        // strip alignment from position
        if (desiredTooltipPosition) {
            // ex: "bottom-right-aligned"
            // should return 'bottom'
            desiredTooltipPosition = desiredTooltipPosition.split('-')[0];
        }
        if (possiblePositions.length) {
            if (desiredTooltipPosition !== 'auto' &&
                possiblePositions.indexOf(desiredTooltipPosition) > -1) {
                // If the requested position is in the list, choose that
                calculatedPosition = desiredTooltipPosition;
            } else {
                // Pick the first valid position, in order
                calculatedPosition = possiblePositions[0];
            }
        }
        // only top and bottom positions have optional alignments
        if (['top', 'bottom'].indexOf(calculatedPosition) !== -1) {
            calculatedPosition += this._determineAutoAlignment(targetElementRect.left, tooltipWidth, windowSize, desiredAlignment);
        }
        return calculatedPosition;
    }
    private _determineAutoAlignment(offsetLeft, tooltipWidth, windowSize, desiredAlignment) {
        let halfTooltipWidth = tooltipWidth / 2, winWidth = Math.min(windowSize.width, window.screen.width), possibleAlignments = ['-left-aligned', '-middle-aligned', '-right-aligned'], calculatedAlignment = '';
        // valid left must be at least a tooltipWidth
        // away from right side
        if (winWidth - offsetLeft < tooltipWidth) {
            this._removeEntry(possibleAlignments, '-left-aligned');
        }
        // valid middle must be at least half
        // width away from both sides
        if (offsetLeft < halfTooltipWidth ||
            winWidth - offsetLeft < halfTooltipWidth) {
            this._removeEntry(possibleAlignments, '-middle-aligned');
        }
        // valid right must be at least a tooltipWidth
        // width away from left side
        if (offsetLeft < tooltipWidth) {
            this._removeEntry(possibleAlignments, '-right-aligned');
        }
        if (possibleAlignments.length) {
            if (possibleAlignments.indexOf(desiredAlignment) !== -1) {
                // the desired alignment is valid
                calculatedAlignment = desiredAlignment;
            } else {
                // pick the first valid position, in order
                calculatedAlignment = possibleAlignments[0];
            }
        } else {
            // if screen width is too small
            // for ANY alignment, middle is
            // probably the best for visibility
            calculatedAlignment = '-middle-aligned';
        }
        return calculatedAlignment;
    }
    private _removeEntry(stringArray, stringToRemove) {
        if (stringArray.indexOf(stringToRemove) > -1) {
            stringArray.splice(stringArray.indexOf(stringToRemove), 1);
        }
    }
    private _setHelperLayerPosition(helperLayer) {
        if (helperLayer) {
            // prevent error when `this._currentStep` in undefined
            if (!this._introItems[this._currentStep]) {
                return;
            }
            let currentElement = this._introItems[this._currentStep], elementPosition = this._getOffset(currentElement.element), widthHeightPadding = this._options.helperElementPadding;
            // If the target element is fixed, the tooltip should be fixed as well.
            // Otherwise, remove a fixed class that may be left over from the previous
            // step.
            if (this._isFixed(currentElement.element)) {
                this._addClass(helperLayer, 'introjs-fixedTooltip');
            } else {
                this._removeClass(helperLayer, 'introjs-fixedTooltip');
            }
            if (currentElement.position === 'floating') {
                widthHeightPadding = 0;
            }
            // set new position to helper layer
            helperLayer.style.cssText = 'width: ' + (elementPosition.width + widthHeightPadding) + 'px; ' +
                'height:' + (elementPosition.height + widthHeightPadding) + 'px; ' +
                'top:' + (elementPosition.top - widthHeightPadding / 2) + 'px;' +
                'left: ' + (elementPosition.left - widthHeightPadding / 2) + 'px;';
        }
    }
    private _disableInteraction() {
        let disableInteractionLayer = document.querySelector('.introjs-disableInteraction');
        if (disableInteractionLayer === null) {
            disableInteractionLayer = document.createElement('div');
            disableInteractionLayer.className = 'introjs-disableInteraction';
            this._targetElement.appendChild(disableInteractionLayer);
        }
        this._setHelperLayerPosition(disableInteractionLayer);
    }
    private _setAnchorAsButton(anchor) {
        anchor.setAttribute('role', 'button');
        anchor.tabIndex = 0;
    }
    private _showElement(targetElement) {
        if (typeof (this._introChangeCallback) !== 'undefined') {
            this._introChangeCallback(targetElement.element);
        }
        const self = this;
        const oldHelperLayer = document.querySelector('.introjs-helperLayer');
        const oldReferenceLayer = document.querySelector('.introjs-tooltipReferenceLayer');
        let highlightClass = 'introjs-helperLayer';
        let nextTooltipButton;
        let prevTooltipButton;
        let skipTooltipButton;
        let scrollParent;
        const helperLayer = document.createElement('div'), referenceLayer = document.createElement('div'), arrowLayer = document.createElement('div'), tooltipLayer = document.createElement('div'), tooltipTextLayer = document.createElement('div'), bulletsLayer = document.createElement('div'), progressLayer = document.createElement('div'), buttonsLayer = document.createElement('div');
        // check for a current step highlight class
        if (typeof (targetElement.highlightClass) === 'string') {
            highlightClass += (' ' + targetElement.highlightClass);
        }
        // check for options highlight class
        if (typeof (this._options.highlightClass) === 'string') {
            highlightClass += (' ' + this._options.highlightClass);
        }
        if (oldHelperLayer !== null) {
            const oldHelperNumberLayer = oldReferenceLayer.querySelector('.introjs-helperNumberLayer');
            const oldtooltipLayer = oldReferenceLayer.querySelector('.introjs-tooltiptext');
            const oldArrowLayer = oldReferenceLayer.querySelector('.introjs-arrow');
            const oldtooltipContainer = oldReferenceLayer.querySelector('.introjs-tooltip');
            skipTooltipButton = oldReferenceLayer.querySelector('.introjs-skipbutton');
            prevTooltipButton = oldReferenceLayer.querySelector('.introjs-prevbutton');
            nextTooltipButton = oldReferenceLayer.querySelector('.introjs-nextbutton');
            // update or reset the helper highlight class
            oldHelperLayer.className = highlightClass;
            // hide the tooltip
            (oldtooltipContainer as any).style.opacity = 0;
            (oldtooltipContainer as any).style.display = 'none';
            if (oldHelperNumberLayer !== null) {
                let lastIntroItem = this._introItems[(targetElement.step - 2 >= 0 ? targetElement.step - 2 : 0)];
                // EMAFIX: se fosse undefined avrebbe problemi nella riga dopo. Devo fixare
                if (lastIntroItem === undefined) {
                    lastIntroItem = null;
                }
                if (lastIntroItem !== null && (this._direction === 'forward' && lastIntroItem.position === 'floating') || (this._direction === 'backward' && targetElement.position === 'floating')) {
                    (oldHelperNumberLayer as any).style.opacity = 0;
                }
            }
            // scroll to element
            scrollParent = this._getScrollParent(targetElement.element);
            if (scrollParent !== document.body) {
                // target is within a scrollable element
                this._scrollParentToElement(scrollParent, targetElement.element);
            }
            // set new position to helper layer
            this._setHelperLayerPosition.call(self, oldHelperLayer);
            this._setHelperLayerPosition.call(self, oldReferenceLayer);
            // remove `introjs-fixParent` class from the elements
            const fixParents = document.querySelectorAll('.introjs-fixParent');
            this._forEach(fixParents, (parent) => {
                this._removeClass(parent, /introjs-fixParent/g);
            }, null);
            // remove old classes if the element still exist
            this._removeShowElement();
            // we should wait until the CSS3 transition is competed (it's 0.3 sec) to prevent incorrect `height` and `width` calculation
            if (self._lastShowElementTimer) {
                window.clearTimeout(self._lastShowElementTimer);
            }
            self._lastShowElementTimer = window.setTimeout(function() {
                // set current step to the label
                if (oldHelperNumberLayer !== null) {
                    oldHelperNumberLayer.innerHTML = targetElement.step;
                }
                // set current tooltip text
                oldtooltipLayer.innerHTML = targetElement.intro;
                // set the tooltip position
                (oldtooltipContainer as any).style.display = 'block';
                this._placeTooltip.call(self, targetElement.element, oldtooltipContainer, oldArrowLayer, oldHelperNumberLayer);
                // change active bullet
                if (self._options.showBullets) {
                    oldReferenceLayer.querySelector('.introjs-bullets li > a.active').className = '';
                    oldReferenceLayer.querySelector('.introjs-bullets li > a[data-stepnumber="' + targetElement.step + '"]').className = 'active';
                }
                (oldReferenceLayer.querySelector('.introjs-progress .introjs-progressbar') as any).style.cssText = 'width:' + this._getProgress.call(self) + '%;';
                oldReferenceLayer.querySelector('.introjs-progress .introjs-progressbar').setAttribute('aria-valuenow', this._getProgress.call(self));
                // show the tooltip
                (oldtooltipContainer as any).style.opacity = 1;
                if (oldHelperNumberLayer) {
                    (oldHelperNumberLayer as any).style.opacity = 1;
                }
                // reset button focus
                if (typeof skipTooltipButton !== 'undefined' && skipTooltipButton !== null && /introjs-donebutton/gi.test(skipTooltipButton.className)) {
                    // skip button is now "done" button
                    skipTooltipButton.focus();
                } else if (typeof nextTooltipButton !== 'undefined' && nextTooltipButton !== null) {
                    // still in the tour, focus on next
                    nextTooltipButton.focus();
                }
                // change the scroll of the window, if needed
                this._scrollTo.call(self, targetElement.scrollTo, targetElement, oldtooltipLayer);
            }, 350);
            // end of old element if-else condition
        } else {
            helperLayer.className = highlightClass;
            referenceLayer.className = 'introjs-tooltipReferenceLayer';
            // scroll to element
            scrollParent = this._getScrollParent(targetElement.element);
            if (scrollParent !== document.body) {
                // target is within a scrollable element
                this._scrollParentToElement(scrollParent, targetElement.element);
            }
            // set new position to helper layer
            this._setHelperLayerPosition.call(self, helperLayer);
            this._setHelperLayerPosition.call(self, referenceLayer);
            // add helper layer to target element
            this._targetElement.appendChild(helperLayer);
            this._targetElement.appendChild(referenceLayer);
            arrowLayer.className = 'introjs-arrow';
            tooltipTextLayer.className = 'introjs-tooltiptext';
            tooltipTextLayer.innerHTML = targetElement.intro;
            bulletsLayer.className = 'introjs-bullets';
            if (this._options.showBullets === false) {
                bulletsLayer.style.display = 'none';
            }
            const ulContainer = document.createElement('ul');
            ulContainer.setAttribute('role', 'tablist');
            const anchorClick = function() {
                self._goToStep(this.getAttribute('data-stepnumber'));
            };
            this._forEach(this._introItems, (item, i) => {
                const innerLi = document.createElement('li');
                const anchorLink = document.createElement('a');
                innerLi.setAttribute('role', 'presentation');
                anchorLink.setAttribute('role', 'tab');
                anchorLink.onclick = anchorClick;
                if (i === (targetElement.step - 1)) {
                    anchorLink.className = 'active';
                }
                this._setAnchorAsButton(anchorLink);
                anchorLink.innerHTML = '&nbsp;';
                anchorLink.setAttribute('data-stepnumber', item.step);
                innerLi.appendChild(anchorLink);
                ulContainer.appendChild(innerLi);
            });
            bulletsLayer.appendChild(ulContainer);
            progressLayer.className = 'introjs-progress';
            if (this._options.showProgress === false) {
                progressLayer.style.display = 'none';
            }
            const progressBar = document.createElement('div');
            progressBar.className = 'introjs-progressbar';
            progressBar.setAttribute('role', 'progress');
            progressBar.setAttribute('aria-valuemin', '0');
            progressBar.setAttribute('aria-valuemax', '100');
            progressBar.setAttribute('aria-valuenow', this._getProgress.call(this));
            progressBar.style.cssText = 'width:' + this._getProgress.call(this) + '%;';
            progressLayer.appendChild(progressBar);
            buttonsLayer.className = 'introjs-tooltipbuttons';
            if (this._options.showButtons === false) {
                buttonsLayer.style.display = 'none';
            }
            tooltipLayer.className = 'introjs-tooltip';
            tooltipLayer.appendChild(tooltipTextLayer);
            tooltipLayer.appendChild(bulletsLayer);
            tooltipLayer.appendChild(progressLayer);
            // add helper layer number
            const helperNumberLayer = document.createElement('span');
            if (this._options.showStepNumbers === true) {
                helperNumberLayer.className = 'introjs-helperNumberLayer';
                helperNumberLayer.innerHTML = targetElement.step;
                referenceLayer.appendChild(helperNumberLayer);
            }
            tooltipLayer.appendChild(arrowLayer);
            referenceLayer.appendChild(tooltipLayer);
            // next button
            nextTooltipButton = document.createElement('a');
            nextTooltipButton.onclick = function() {
                if (self._introItems.length - 1 !== self._currentStep) {
                    this._nextStep.call(self);
                }
            };
            this._setAnchorAsButton(nextTooltipButton);
            nextTooltipButton.innerHTML = this._options.nextLabel;
            // previous button
            prevTooltipButton = document.createElement('a');
            prevTooltipButton.onclick = function() {
                if (self._currentStep !== 0) {
                    this._previousStep.call(self);
                }
            };
            this._setAnchorAsButton(prevTooltipButton);
            prevTooltipButton.innerHTML = this._options.prevLabel;
            // skip button
            skipTooltipButton = document.createElement('a');
            skipTooltipButton.className = this._options.buttonClass + ' introjs-skipbutton ';
            this._setAnchorAsButton(skipTooltipButton);
            skipTooltipButton.innerHTML = this._options.skipLabel;
            skipTooltipButton.onclick = () => {
                if (self._introItems.length - 1 === self._currentStep && typeof (self._introCompleteCallback) === 'function') {
                    self._introCompleteCallback.call(self);
                }
                if (self._introItems.length - 1 !== self._currentStep && typeof (self._introExitCallback) === 'function') {
                    self._introExitCallback.call(self);
                }
                if (typeof (self._introSkipCallback) === 'function') {
                    self._introSkipCallback.call(self);
                }
                this._exitIntro.call(self, self._targetElement);
            };
            buttonsLayer.appendChild(skipTooltipButton);
            // in order to prevent displaying next/previous button always
            if (this._introItems.length > 1) {
                buttonsLayer.appendChild(prevTooltipButton);
                buttonsLayer.appendChild(nextTooltipButton);
            }
            tooltipLayer.appendChild(buttonsLayer);
            // set proper position
            this._placeTooltip.call(self, targetElement.element, tooltipLayer, arrowLayer, helperNumberLayer);
            // change the scroll of the window, if needed
            this._scrollTo.call(this, targetElement.scrollTo, targetElement, tooltipLayer);
            // end of new element if-else condition
        }
        // removing previous disable interaction layer
        const disableInteractionLayer = self._targetElement.querySelector('.introjs-disableInteraction');
        if (disableInteractionLayer) {
            disableInteractionLayer.parentNode.removeChild(disableInteractionLayer);
        }
        // disable interaction
        if (targetElement.disableInteraction) {
            this._disableInteraction.call(self);
        }
        // when it's the first step of tour
        if (this._currentStep === 0 && this._introItems.length > 1) {
            if (typeof skipTooltipButton !== 'undefined' && skipTooltipButton !== null) {
                skipTooltipButton.className = this._options.buttonClass + ' introjs-skipbutton';
            }
            if (typeof nextTooltipButton !== 'undefined' && nextTooltipButton !== null) {
                nextTooltipButton.className = this._options.buttonClass + ' introjs-nextbutton';
            }
            if (this._options.hidePrev === true) {
                if (typeof prevTooltipButton !== 'undefined' && prevTooltipButton !== null) {
                    prevTooltipButton.className = this._options.buttonClass + ' introjs-prevbutton introjs-hidden';
                }
                if (typeof nextTooltipButton !== 'undefined' && nextTooltipButton !== null) {
                    this._addClass(nextTooltipButton, 'introjs-fullbutton');
                }
            } else {
                if (typeof prevTooltipButton !== 'undefined' && prevTooltipButton !== null) {
                    prevTooltipButton.className = this._options.buttonClass + ' introjs-prevbutton introjs-disabled';
                }
            }
            if (typeof skipTooltipButton !== 'undefined' && skipTooltipButton !== null) {
                skipTooltipButton.innerHTML = this._options.skipLabel;
            }
        } else if (this._introItems.length - 1 === this._currentStep || this._introItems.length === 1) {
            // last step of tour
            if (typeof skipTooltipButton !== 'undefined' && skipTooltipButton !== null) {
                skipTooltipButton.innerHTML = this._options.doneLabel;
                // adding donebutton class in addition to skipbutton
                this._addClass(skipTooltipButton, 'introjs-donebutton');
            }
            if (typeof prevTooltipButton !== 'undefined' && prevTooltipButton !== null) {
                prevTooltipButton.className = this._options.buttonClass + ' introjs-prevbutton';
            }
            if (this._options.hideNext === true) {
                if (typeof nextTooltipButton !== 'undefined' && nextTooltipButton !== null) {
                    nextTooltipButton.className = this._options.buttonClass + ' introjs-nextbutton introjs-hidden';
                }
                if (typeof prevTooltipButton !== 'undefined' && prevTooltipButton !== null) {
                    this._addClass(prevTooltipButton, 'introjs-fullbutton');
                }
            } else {
                if (typeof nextTooltipButton !== 'undefined' && nextTooltipButton !== null) {
                    nextTooltipButton.className = this._options.buttonClass + ' introjs-nextbutton introjs-disabled';
                }
            }
        } else {
            // steps between start and end
            if (typeof skipTooltipButton !== 'undefined' && skipTooltipButton !== null) {
                skipTooltipButton.className = this._options.buttonClass + ' introjs-skipbutton';
            }
            if (typeof prevTooltipButton !== 'undefined' && prevTooltipButton !== null) {
                prevTooltipButton.className = this._options.buttonClass + ' introjs-prevbutton';
            }
            if (typeof nextTooltipButton !== 'undefined' && nextTooltipButton !== null) {
                nextTooltipButton.className = this._options.buttonClass + ' introjs-nextbutton';
            }
            if (typeof skipTooltipButton !== 'undefined' && skipTooltipButton !== null) {
                skipTooltipButton.innerHTML = this._options.skipLabel;
            }
        }
        prevTooltipButton.setAttribute('role', 'button');
        nextTooltipButton.setAttribute('role', 'button');
        skipTooltipButton.setAttribute('role', 'button');
        // Set focus on "next" button, so that hitting Enter always moves you onto the next step
        if (typeof nextTooltipButton !== 'undefined' && nextTooltipButton !== null) {
            nextTooltipButton.focus();
        }
        this._setShowElement(targetElement);
        // EMAFIX: Evito che l'evento parta per la tangente. Lo blocco nel contesto intro
        if (tooltipLayer) {
            tooltipLayer.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
            };
        }
        if (typeof (this._introAfterChangeCallback) !== 'undefined') {
            this._introAfterChangeCallback.call(this, targetElement.element);
        }
    }
    private _scrollTo(scrollTo, targetElement, tooltipLayer) {
        if (scrollTo === 'off') {
            return;
        }
        let rect;
        if (!this._options.scrollToElement) {
            return;
        }
        if (scrollTo === 'tooltip') {
            rect = tooltipLayer.getBoundingClientRect();
        } else {
            rect = targetElement.element.getBoundingClientRect();
        }
        if (!this._elementInViewport(targetElement.element)) {
            const winHeight = this._getWinSize().height;
            const top = rect.bottom - (rect.bottom - rect.top);
            // TODO (afshinm): do we need scroll padding now?
            // I have changed the scroll option and now it scrolls the window to
            // the center of the target element or tooltip.
            if (top < 0 || targetElement.element.clientHeight > winHeight) {
                window.scrollBy(0, rect.top - ((winHeight / 2) - (rect.height / 2)) - this._options.scrollPadding); // 30px padding from edge to look nice
                // Scroll down
            } else {
                window.scrollBy(0, rect.top - ((winHeight / 2) - (rect.height / 2)) + this._options.scrollPadding); // 30px padding from edge to look nice
            }
        }
    }
    private _removeShowElement() {
        const elms = document.querySelectorAll('.introjs-showElement');
        this._forEach(elms, (elm) => {
            this._removeClass(elm, /introjs-[a-zA-Z]+/g);
        });
    }
    private _setShowElement(targetElement) {
        let parentElm;
        // we need to add this show element class to the parent of SVG elements
        // because the SVG elements can't have independent z-index
        if (targetElement.element instanceof SVGElement) {
            parentElm = targetElement.element.parentNode;
            while (targetElement.element.parentNode !== null) {
                if (!parentElm.tagName || parentElm.tagName.toLowerCase() === 'body') {
                    break;
                }
                if (parentElm.tagName.toLowerCase() === 'svg') {
                    this._addClass(parentElm, 'introjs-showElement introjs-relativePosition');
                }
                parentElm = parentElm.parentNode;
            }
        }
        this._addClass(targetElement.element, 'introjs-showElement');
        const currentElementPosition = this._getPropValue(targetElement.element, 'position');
        if (currentElementPosition !== 'absolute' &&
            currentElementPosition !== 'relative' &&
            currentElementPosition !== 'fixed') {
            // change to new intro item
            this._addClass(targetElement.element, 'introjs-relativePosition');
        }
        parentElm = targetElement.element.parentNode;
        while (parentElm !== null) {
            if (!parentElm.tagName || parentElm.tagName.toLowerCase() === 'body') {
                break;
            }
            // fix The Stacking Context problem.
            // More detail: https://developer.mozilla.org/en-US/docs/Web/Guide/CSS/Understanding_z_index/The_stacking_context
            const zIndex = this._getPropValue(parentElm, 'z-index');
            const opacity = parseFloat(this._getPropValue(parentElm, 'opacity'));
            const transform = this._getPropValue(parentElm, 'transform') || this._getPropValue(parentElm, '-webkit-transform') || this._getPropValue(parentElm, '-moz-transform') || this._getPropValue(parentElm, '-ms-transform') || this._getPropValue(parentElm, '-o-transform');
            if (/[0-9]+/.test(zIndex) || opacity < 1 || (transform !== 'none' && transform !== undefined)) {
                this._addClass(parentElm, 'introjs-fixParent');
            }
            parentElm = parentElm.parentNode;
        }
    }
    private _forEach(arr, forEachFnc, completeFnc = null) {
        // in case arr is an empty query selector node list
        if (arr) {
            for (let i = 0, len = arr.length; i < len; i++) {
                forEachFnc(arr[i], i);
            }
        }
        if (typeof (completeFnc) === 'function') {
            completeFnc();
        }
    }
    private _addClass(element, className) {
        if (element instanceof SVGElement) {
            // svg
            const pre = element.getAttribute('class') || '';
            element.setAttribute('class', pre + ' ' + className);
        } else {
            if (element.classList !== undefined) {
                // check for modern classList property
                const classes = className.split(' ');
                this._forEach(classes, (cls) => {
                    element.classList.add(cls);
                });
            } else if (!element.className.match(className)) {
                // check if element doesn't already have className
                element.className += ' ' + className;
            }
        }
    }
    private _removeClass(element, classNameRegex) {
        if (element instanceof SVGElement) {
            const pre = element.getAttribute('class') || '';
            element.setAttribute('class', pre.replace(classNameRegex, '').replace(/^\s+|\s+$/g, ''));
        } else {
            element.className = element.className.replace(classNameRegex, '').replace(/^\s+|\s+$/g, '');
        }
    }
    private _getPropValue(element, propName) {
        let propValue = '';
        if (element.currentStyle) { // IE
            propValue = element.currentStyle[propName];
        } else if (document.defaultView && document.defaultView.getComputedStyle) { // Others
            propValue = document.defaultView.getComputedStyle(element, null).getPropertyValue(propName);
        }
        // Prevent exception in IE
        if (propValue && propValue.toLowerCase) {
            return propValue.toLowerCase();
        } else {
            return propValue;
        }
    }
    private _isFixed(element) {
        const p = element.parentNode;
        if (!p || p.nodeName === 'HTML') {
            return false;
        }
        if (this._getPropValue(element, 'position') === 'fixed') {
            return true;
        }
        return this._isFixed(p);
    }
    private _getWinSize() {
        if (window.innerWidth !== undefined) {
            return { width: window.innerWidth, height: window.innerHeight };
        } else {
            const D = document.documentElement;
            return { width: D.clientWidth, height: D.clientHeight };
        }
    }
    private _elementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (rect.top >= 0 &&
            rect.left >= 0 &&
            (rect.bottom + 80) <= window.innerHeight && // add 80 to get the text right
            rect.right <= window.innerWidth);
    }
    private _addOverlayLayer(targetElm) {
        let overlayLayer = document.createElement('div'), styleText = '', self = this;
        // set css class name
        overlayLayer.className = 'introjs-overlay';
        // check if the target element is body, we should calculate the size of overlay layer in a better way
        if (!targetElm.tagName || targetElm.tagName.toLowerCase() === 'body') {
            styleText += 'top: 0;bottom: 0; left: 0;right: 0;position: fixed;';
            overlayLayer.style.cssText = styleText;
        } else {
            // set overlay layer position
            const elementPosition = this._getOffset(targetElm);
            if (elementPosition) {
                styleText += 'width: ' + elementPosition.width + 'px; height:' + elementPosition.height + 'px; top:' + elementPosition.top + 'px;left: ' + elementPosition.left + 'px;';
                overlayLayer.style.cssText = styleText;
            }
        }
        targetElm.appendChild(overlayLayer);
        overlayLayer.onclick = () => {
            if (self._options.exitOnOverlayClick === true) {
                this._exitIntro(self, targetElm);
            }
        };
        window.setTimeout(function() {
            styleText += 'opacity: ' + self._options.overlayOpacity.toString() + ';';
            overlayLayer.style.cssText = styleText;
        }, 10);
        return true;
    }
    private _removeHintTooltip() {
        const tooltip = document.querySelector('.introjs-hintReference');
        if (tooltip) {
            const step = tooltip.getAttribute('data-step');
            tooltip.parentNode.removeChild(tooltip);
            return step;
        }
    }
    public _populateHints(targetElm) {
        this._introItems = [];
        if (this._options.hints) {
            this._forEach(this._options.hints, (hint) => {
                const currentItem = this._cloneObject(hint);
                if (typeof (currentItem.element) === 'string') {
                    // grab the element with given selector from the page
                    currentItem.element = document.querySelector(currentItem.element);
                }
                currentItem.hintPosition = currentItem.hintPosition || this._options.hintPosition;
                currentItem.hintAnimation = currentItem.hintAnimation || this._options.hintAnimation;
                if (currentItem.element !== null) {
                    this._introItems.push(currentItem);
                }
            }, null);
        } else {
            const hints = targetElm.querySelectorAll('*[data-hint]');
            if (!hints || !hints.length) {
                return false;
            }
            // first add intro items with data-step
            this._forEach(hints, (currentElement) => {
                // hint animation
                let hintAnimation = currentElement.getAttribute('data-hintanimation');
                if (hintAnimation) {
                    hintAnimation = (hintAnimation === 'true');
                } else {
                    hintAnimation = this._options.hintAnimation;
                }
                this._introItems.push({
                    element: currentElement,
                    hint: currentElement.getAttribute('data-hint'),
                    hintPosition: currentElement.getAttribute('data-hintposition') || this._options.hintPosition,
                    hintAnimation,
                    tooltipClass: currentElement.getAttribute('data-tooltipclass'),
                    position: currentElement.getAttribute('data-position') || this._options.tooltipPosition
                });
            }, null);
        }
        this._addHints.call(this);
        /*
        todo:
        these events should be removed at some point
        */
        this.DOMEvent.on(document, 'click', this._removeHintTooltip, this, false);
        this.DOMEvent.on(window, 'resize', this._reAlignHints, this, true);
    }
    private _reAlignHints() {
        this._forEach(this._introItems, (item) => {
            if (typeof (item.targetElement) === 'undefined') {
                return;
            }
            this._alignHintPosition.call(this, item.hintPosition, item.element, item.targetElement);
        }, null);
    }
    private _hintQuerySelectorAll(selector) {
        const hintsWrapper = document.querySelector('.introjs-hints');
        return (hintsWrapper) ? hintsWrapper.querySelectorAll(selector) : [];
    }
    public _hideHint(stepId) {
        const hint = this._hintQuerySelectorAll('.introjs-hint[data-step="' + stepId + '"]')[0];
        this._removeHintTooltip();
        if (hint) {
            this._addClass(hint, 'introjs-hidehint');
        }
        // call the callback function (if any)
        if (typeof (this._hintCloseCallback) !== 'undefined') {
            this._hintCloseCallback.call(this, stepId);
        }
    }
    public _hideHints() {
        const hints = this._hintQuerySelectorAll('.introjs-hint');
        this._forEach(hints, (hint) => {
            this._hideHint.call(this, hint.getAttribute('data-step'));
        });
    }
    public _showHints() {
        const hints = this._hintQuerySelectorAll('.introjs-hint');
        if (hints && hints.length) {
            this._forEach(hints, function(hint) {
                this._showHint(hint.getAttribute('data-step'));
            }.bind(this));
        } else {
            this._populateHints(this._targetElement);
        }
    }
    public _showHint(stepId) {
        const hint = this._hintQuerySelectorAll('.introjs-hint[data-step="' + stepId + '"]')[0];
        if (hint) {
            this._removeClass(hint, /introjs-hidehint/g);
        }
    }
    public _removeHints() {
        const hints = this._hintQuerySelectorAll('.introjs-hint');
        this._forEach(hints, (hint) => {
            this._removeHint(hint.getAttribute('data-step'));
        });
    }
    public _removeHint(stepId) {
        const hint = this._hintQuerySelectorAll('.introjs-hint[data-step="' + stepId + '"]')[0];
        if (hint) {
            hint.parentNode.removeChild(hint);
        }
    }
    private _addHints() {
        const self = this;
        let hintsWrapper = document.querySelector('.introjs-hints');
        if (hintsWrapper === null) {
            hintsWrapper = document.createElement('div');
            hintsWrapper.className = 'introjs-hints';
        }
        const getHintClick = function(i) {
            return function(e) {
                const evt = e ? e : window.event;
                if (evt.stopPropagation) {
                    evt.stopPropagation();
                }
                if (evt.cancelBubble !== null) {
                    evt.cancelBubble = true;
                }
                this._showHintDialog.call(self, i);
            };
        };
        this._forEach(this._introItems, (item, i) => {
            // avoid append a hint twice
            if (document.querySelector('.introjs-hint[data-step="' + i + '"]')) {
                return;
            }
            const hint = document.createElement('a');
            this._setAnchorAsButton(hint);
            hint.onclick = getHintClick(i);
            hint.className = 'introjs-hint';
            if (!item.hintAnimation) {
                this._addClass(hint, 'introjs-hint-no-anim');
            }
            // hint's position should be fixed if the target element's position is fixed
            if (this._isFixed(item.element)) {
                this._addClass(hint, 'introjs-fixedhint');
            }
            const hintDot = document.createElement('div');
            hintDot.className = 'introjs-hint-dot';
            const hintPulse = document.createElement('div');
            hintPulse.className = 'introjs-hint-pulse';
            hint.appendChild(hintDot);
            hint.appendChild(hintPulse);
            hint.setAttribute('data-step', i);
            // we swap the hint element with target element
            // because _setHelperLayerPosition uses `element` property
            item.targetElement = item.element;
            item.element = hint;
            // align the hint position
            this._alignHintPosition.call(this, item.hintPosition, hint, item.targetElement);
            hintsWrapper.appendChild(hint);
        });
        // adding the hints wrapper
        document.body.appendChild(hintsWrapper);
        // call the callback function (if any)
        if (typeof (this._hintsAddedCallback) !== 'undefined') {
            this._hintsAddedCallback.call(this);
        }
    }
    private _alignHintPosition(position, hint, element) {
        // get/calculate offset of target element
        const offset = this._getOffset(element);
        const iconWidth = 20;
        const iconHeight = 20;
        // align the hint element
        switch (position) {
            default:
            case 'top-left':
                hint.style.left = offset.left + 'px';
                hint.style.top = offset.top + 'px';
                break;
            case 'top-right':
                hint.style.left = (offset.left + offset.width - iconWidth) + 'px';
                hint.style.top = offset.top + 'px';
                break;
            case 'bottom-left':
                hint.style.left = offset.left + 'px';
                hint.style.top = (offset.top + offset.height - iconHeight) + 'px';
                break;
            case 'bottom-right':
                hint.style.left = (offset.left + offset.width - iconWidth) + 'px';
                hint.style.top = (offset.top + offset.height - iconHeight) + 'px';
                break;
            case 'middle-left':
                hint.style.left = offset.left + 'px';
                hint.style.top = (offset.top + (offset.height - iconHeight) / 2) + 'px';
                break;
            case 'middle-right':
                hint.style.left = (offset.left + offset.width - iconWidth) + 'px';
                hint.style.top = (offset.top + (offset.height - iconHeight) / 2) + 'px';
                break;
            case 'middle-middle':
                hint.style.left = (offset.left + (offset.width - iconWidth) / 2) + 'px';
                hint.style.top = (offset.top + (offset.height - iconHeight) / 2) + 'px';
                break;
            case 'bottom-middle':
                hint.style.left = (offset.left + (offset.width - iconWidth) / 2) + 'px';
                hint.style.top = (offset.top + offset.height - iconHeight) + 'px';
                break;
            case 'top-middle':
                hint.style.left = (offset.left + (offset.width - iconWidth) / 2) + 'px';
                hint.style.top = offset.top + 'px';
                break;
        }
    }
    public _showHintDialog(stepId) {
        const hintElement = document.querySelector('.introjs-hint[data-step="' + stepId + '"]');
        const item = this._introItems[stepId];
        // call the callback function (if any)
        if (typeof (this._hintClickCallback) !== 'undefined') {
            this._hintClickCallback.call(this, hintElement, item, stepId);
        }
        // remove all open tooltips
        const removedStep = this._removeHintTooltip.call(this);
        // to toggle the tooltip
        if (parseInt(removedStep, 10) === stepId) {
            return;
        }
        const tooltipLayer = document.createElement('div');
        const tooltipTextLayer = document.createElement('div');
        const arrowLayer = document.createElement('div');
        const referenceLayer = document.createElement('div');
        tooltipLayer.className = 'introjs-tooltip';
        tooltipLayer.onclick = function(e) {
            // IE9 & Other Browsers
            if (e.stopPropagation) {
                e.stopPropagation();
            } else {
                e.cancelBubble = true;
            }
        };
        tooltipTextLayer.className = 'introjs-tooltiptext';
        const tooltipWrapper = document.createElement('p');
        tooltipWrapper.innerHTML = item.hint;
        const closeButton = document.createElement('a');
        closeButton.className = this._options.buttonClass;
        closeButton.setAttribute('role', 'button');
        closeButton.innerHTML = this._options.hintButtonLabel;
        closeButton.onclick = this._hideHint.bind(this, stepId);
        tooltipTextLayer.appendChild(tooltipWrapper);
        tooltipTextLayer.appendChild(closeButton);
        arrowLayer.className = 'introjs-arrow';
        tooltipLayer.appendChild(arrowLayer);
        tooltipLayer.appendChild(tooltipTextLayer);
        // set current step for _placeTooltip function
        this._currentStep = hintElement.getAttribute('data-step');
        // align reference layer position
        referenceLayer.className = 'introjs-tooltipReferenceLayer introjs-hintReference';
        referenceLayer.setAttribute('data-step', hintElement.getAttribute('data-step'));
        this._setHelperLayerPosition(referenceLayer);
        referenceLayer.appendChild(tooltipLayer);
        document.body.appendChild(referenceLayer);
        // set proper position
        this._placeTooltip(hintElement, tooltipLayer, arrowLayer, null, true);
    }
    private _getOffset(element) {
        const body = document.body;
        const docEl = document.documentElement;
        const scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
        const scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;
        const x = element.getBoundingClientRect();
        return {
            top: x.top + scrollTop,
            width: x.width,
            height: x.height,
            left: x.left + scrollLeft
        };
    }
    private _getScrollParent(element) {
        let style = window.getComputedStyle(element);
        const excludeStaticParent = (style.position === 'absolute');
        const overflowRegex = /(auto|scroll)/;
        if (style.position === 'fixed') {
            return document.body;
        }
        for (let parent = element; (parent = parent.parentElement);) {
            style = window.getComputedStyle(parent);
            if (excludeStaticParent && style.position === 'static') {
                continue;
            }
            if (overflowRegex.test(style.overflow + style.overflowY + style.overflowX)) {
                return parent;
            }
        }
        return document.body;
    }
    private _scrollParentToElement(parent, element) {
        parent.scrollTop = element.offsetTop - parent.offsetTop;
    }
    private _getProgress() {
        // Steps are 0 indexed
        const currentStep = parseInt((this._currentStep + 1), 10);
        return ((currentStep / this._introItems.length) * 100);
    }
}
