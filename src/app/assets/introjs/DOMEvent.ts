export class DOMEvent {
    events_key = 'introjs_event';
    constructor() { }
    private _stamp(obj, key = 'introjs-stamp') {
        let keys = {};
        // each group increments from 0
        keys[key] = keys[key] || 0;
        // stamp only once per object
        if (obj[key] === undefined) {
            // increment key for each new object
            obj[key] = keys[key]++;
        }
        return obj[key];
    }
    _id(obj, type, listener, context) {
        return type + this._stamp(listener) + (context ? '_' + this._stamp(context) : '');
    }
    public on(obj, type, listener, context, useCapture) {
        let id = this._id.apply(this, arguments);
        let handler = (e) => {
            return listener.call(context || obj, e || window.event);
        };
        if ('addEventListener' in obj) {
            obj.addEventListener(type, handler, useCapture);
        }
        else if ('attachEvent' in obj) {
            obj.attachEvent('on' + type, handler);
        }
        obj[this.events_key] = obj[this.events_key] || {};
        obj[this.events_key][id] = handler;
    }
    public off(obj, type, listener, context, useCapture) {
        let id = this._id.apply(this, arguments);
        let handler = obj[this.events_key] && obj[this.events_key][id];
        if (!handler) {
            return;
        }
        if ('removeEventListener' in obj) {
            obj.removeEventListener(type, handler, useCapture);
        }
        else if ('detachEvent' in obj) {
            obj.detachEvent('on' + type, handler);
        }
        obj[this.events_key][id] = null;
    }
}
