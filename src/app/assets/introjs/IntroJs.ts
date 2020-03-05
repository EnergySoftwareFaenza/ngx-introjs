import { IntroJsOptions } from './IntroJsOptions';
import { IntroJsImplementation } from './IntroJsImplementation';

export class IntroJs {
    public Instance: IntroJsImplementation;
    public VERSION = '2.9.3';

    constructor() {
        let instance;
        instance = new IntroJsImplementation(document.body);
        this.Instance = instance;
    }

    setOption(option, value): IntroJs {
        this.Instance._options[option] = value;
        return this;
    }

    setOptions(options): IntroJs {
        this.Instance._options = this._mergeOptions(this.Instance._options, options);
        return this;
    }

    start(group): IntroJs {
        this.Instance._introForElement(this.Instance._targetElement, group);
        return this;
    }

    goToStep(step): IntroJs {
        this.Instance._goToStep(step);
        return this;
    }

    addStep(options): IntroJs {
        if (!this.Instance._options.steps) {
            this.Instance._options.steps = [];
        }
        this.Instance._options.steps.push(options);
        return this;
    }

    goToStepNumber(step): IntroJs {
        this.Instance._goToStepNumber(step);
        return this;
    }

    nextStep(): IntroJs {
        this.Instance._nextStep();
        return this;
    }
    previousStep(): IntroJs {
        this.Instance._previousStep();
        return this;
    }
    exit(force = false): IntroJs {
        this.Instance._exitIntro(this.Instance._targetElement, force);
        return this;
    }
    refresh(): IntroJs {
        this.Instance._refresh();
        return this;
    }
    onbeforechange(providedCallback): IntroJs {
        if (typeof (providedCallback) === 'function') {
            this.Instance._introBeforeChangeCallback = providedCallback;
        } else {
            throw new Error('Provided callback for onbeforechange was not a function');
        }
        return this;
    }
    onchange(providedCallback): IntroJs {
        if (typeof (providedCallback) === 'function') {
            this.Instance._introChangeCallback = providedCallback;
        } else {
            throw new Error('Provided callback for onchange was not a function.');
        }
        return this;
    }
    onafterchange(providedCallback): IntroJs {
        if (typeof (providedCallback) === 'function') {
            this.Instance._introAfterChangeCallback = providedCallback;
        } else {
            throw new Error('Provided callback for onafterchange was not a function');
        }
        return this;
    }
    oncomplete(providedCallback): IntroJs {
        if (typeof (providedCallback) === 'function') {
            this.Instance._introCompleteCallback = providedCallback;
        } else {
            throw new Error('Provided callback for oncomplete was not a function.');
        }
        return this;
    }
    onhintsadded(providedCallback): IntroJs {
        if (typeof (providedCallback) === 'function') {
            this.Instance._hintsAddedCallback = providedCallback;
        } else {
            throw new Error('Provided callback for onhintsadded was not a function.');
        }
        return this;
    }
    onhintclick(providedCallback): IntroJs {
        if (typeof (providedCallback) === 'function') {
            this.Instance._hintClickCallback = providedCallback;
        } else {
            throw new Error('Provided callback for onhintclick was not a function.');
        }
        return this;
    }
    onhintclose(providedCallback): IntroJs {
        if (typeof (providedCallback) === 'function') {
            this.Instance._hintCloseCallback = providedCallback;
        } else {
            throw new Error('Provided callback for onhintclose was not a function.');
        }
        return this;
    }
    onexit(providedCallback): IntroJs {
        if (typeof (providedCallback) === 'function') {
            this.Instance._introExitCallback = providedCallback;
        } else {
            throw new Error('Provided callback for onexit was not a function.');
        }
        return this;
    }
    onskip(providedCallback) : IntroJs{
        if (typeof (providedCallback) === 'function') {
            this.Instance._introSkipCallback = providedCallback;
        } else {
            throw new Error('Provided callback for onskip was not a function.');
        }
        return this;
    }
    onbeforeexit(providedCallback): IntroJs {
        if (typeof (providedCallback) === 'function') {
            this.Instance._introBeforeExitCallback = providedCallback;
        } else {
            throw new Error('Provided callback for onbeforeexit was not a function.');
        }
        return this;
    }
    addHints(): IntroJs {
        this.Instance._populateHints(this.Instance._targetElement);
        return this;
    }
    hideHint(stepId): IntroJs {
        this.Instance._hideHint(stepId);
        return this;
    }
    hideHints(): IntroJs {
        this.Instance._hideHints();
        return this;
    }
    showHint(stepId) : IntroJs{
        this.Instance._showHint(stepId);
        return this;
    }
    showHints() : IntroJs{
        this.Instance._showHints();
        return this;
    }
    removeHints() : IntroJs{
        this.Instance._removeHints();
        return this;
    }
    removeHint(stepId): IntroJs {
        this.Instance._removeHint(stepId);
        return this;
    }
    showHintDialog(stepId): IntroJs {
        this.Instance._showHintDialog(stepId);
        return this;
    }

    private _mergeOptions(obj1: IntroJsOptions, obj2: IntroJsOptions): IntroJsOptions {
        let obj3: any = {};
        let attrname;

        for (attrname in obj1) { obj3[attrname] = obj1[attrname]; }
        for (attrname in obj2) { obj3[attrname] = obj2[attrname]; }
        return obj3;
    }
}