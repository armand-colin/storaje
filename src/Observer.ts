export class Observer<T> {

    private _value: T
    private _callbacks = new Set<(value: T) => void>()
    private _destroyed = false

    constructor(initialValue: T) {
        this._value = initialValue
    }

    get value(): T { return this._value }
    get destroyed() { return this._destroyed }

    // Workaround to ObserverReducer.destroyed 
    // (because it seems that we can't access public 
    // property destroyed duh)
    protected _isDestroyed() { return this.destroyed }

    set(value: T) {
        if (this._destroyed)
            return

        this._value = value

        // Copying registers to avoid bugs
        // when unregistering while emitting, which 
        // could cause some registers to not trigger
        for (const callback of [...this._callbacks])
            callback(value)
    }

    destroy() {
        this._callbacks.clear()
        this._destroyed = true
    }

    bind(callback: (value: T) => void) {
        if (this._destroyed)
            return

        this._callbacks.add(callback)
    }

    unbind(callback: (value: T) => void) {
        if (this._destroyed)
            return

        this._callbacks.delete(callback)
    }

}