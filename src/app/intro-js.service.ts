import { Injectable } from '@angular/core';
import { IntroJs, IntroJsOptions } from './assets';

export enum introStatus {
	open,
	closed
}

export interface IIntrojsService {
	intro: IntroJs;
	addListener(name: introStatus, callback: Function): void;
	removeListener(name: introStatus): void;
	setOptions(IntroJsOptions);
	start(stepId?: number, group?: string): IntroJs;
	exit(): IntroJs;
	clear(callback: Function): IntroJs;
	addHints(): IntroJs;
	showHint(hintIdx: number): IntroJs;
	showHints(): IntroJs;
	hideHint(hintIdx: number): IntroJs;
	hideHints(): IntroJs;
	previous(): IntroJs;
	next(): IntroJs;
	refresh(): IntroJs;
	onComplete(callback: Function): void;
	onExit(callback: Function): void;
	onBeforeChange(callback: Function): void;
	onAfterChange(callback: Function): void;
	onChange(callback: Function): void;
	onHintClick(callback: Function): void;
	onHintClose(callback: Function): void;
	onHintsAdded(callback: Function): void;
}

@Injectable({
	providedIn: 'root'
})
export class IntroJsService implements IIntrojsService {
	private notifyList = [];
	public intro: IntroJs;

	private isFunction(func) {
		return typeof func === "function"
	}
	constructor() {
		this.intro = new IntroJs();
	}

	addListener(name: introStatus, cb: Function) {
		if (this.isFunction(cb))
			this.notifyList[name] = cb;
	}
	removeListener(name: introStatus) {
		delete this.notifyList[name];
	}
	private notifyListeners(status: introStatus) {
		for (var key in this.notifyList) {
			if (this.notifyList.hasOwnProperty(key)) {
				if (this.isFunction(this.notifyList[key]))
					this.notifyList[key](status);
			}
		}
	}
	setOptions(options: IntroJsOptions) {
		return this.intro.setOptions(options);
	}
	start(step?: number, group?: string) {
		if (step && typeof (step) === 'number')
			this.intro.start(group).goToStep(step);
		else
			this.intro.start(group);

		this.notifyListeners(introStatus.open);

		return this.intro;
	}
	exit() {
		this.notifyListeners(introStatus.closed);
		return this.intro.exit();
	}
	clear(cb: Function) {
		if (typeof (this.intro) !== 'undefined')
			this.intro.exit();

		this.intro = new IntroJs();

		this.notifyListeners(introStatus.closed);

		if (this.isFunction(cb)) cb();

		return this.intro;
	}
	addHints() {
		return this.intro.addHints();
	}
	showHint(hintIndex: number) {
		return this.intro.showHint(hintIndex);
	}
	showHints() {
		return this.intro.showHints();
	}
	hideHint(hintIndex: number) {
		return this.intro.hideHint(hintIndex);
	}
	hideHints() {
		return this.intro.hideHints();
	}
	previous() {
		this.notifyListeners(introStatus.open);
		return this.intro.previousStep();
	}
	next() {
		this.notifyListeners(introStatus.open);
		return this.intro.nextStep();
	}
	refresh() {
		return this.intro.refresh();
	}
	onComplete(cb: Function) {
		return this.intro.oncomplete(() => {
			if (this.isFunction(cb)) cb();
			this.notifyListeners(introStatus.closed);
		});
	}
	onExit(cb: Function) {
		return this.intro.onexit(() => {
			this.notifyListeners(introStatus.closed);
			if (this.isFunction(cb)) cb();
		});
	}
	onBeforeChange(cb: Function) {
		return this.intro.onbeforechange((target) => {
			if (this.isFunction(cb)) cb(target);
		});
	}
	onChange(cb: Function) {
		return this.intro.onchange(() => {
			if (this.isFunction(cb)) cb();
		});
	}
	onAfterChange(cb: Function) {
		return this.intro.onafterchange(() => {
			if (this.isFunction(cb)) cb();
		});
	}
	onHintClick(cb: Function) {
		return this.intro.onhintclick(() => {
			if (this.isFunction(cb)) cb();
		});
	}
	onHintClose(cb: Function) {
		return this.intro.onhintclose(() => {
			if (this.isFunction(cb)) cb();
		});
	}
	onHintsAdded(cb: Function) {
		return this.intro.onhintclose(() => {
			if (this.isFunction(cb)) cb();
		});
	}
}