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

    map<U>(mapper: (value: T) => U): Observer<U> {
        return new ObserverMapper(this, mapper)
    }

    filter(filter: (value: T) => boolean): Observer<T | null> {
        return new ObserverFilter(this, filter)
    }

}

export namespace Observer {

    function map<T, U>(observer: Observer<T[]>, mapper: (value: T) => U): Observer<U[]> {
        return new ObserverMapper(observer, value => value.map(mapper))
    }

    function filter<T>(observer: Observer<T[]>, filter: (value: T) => boolean): Observer<T[]> {
        return new ObserverMapper(observer, value => value.filter(filter))
    }

    function sort<T>(observer: Observer<T[]>, sorter: (a: T, b: T) => number): Observer<T[]> {
        return new ObserverMapper(observer, value => value.sort(sorter))
    }

    function first<T>(observer: Observer<T[]>): Observer<T | null> {
        return new ObserverMapper(observer, value => value.length > 0 ? value[0] : null)
    }

    function limit<T>(observer: Observer<T[]>, count: number): Observer<T[]> {
        return new ObserverMapper(observer, value => value.slice(0, count))
    }

    function offset<T>(observer: Observer<T[]>, offset: number): Observer<T[]> {
        return new ObserverMapper(observer, value => value.slice(offset))
    }

    function window<T>(observer: Observer<T[]>, offset: number, count: number): Observer<T[]> {
        return new ObserverMapper(observer, value => value.slice(offset, offset + count))
    }

    /**
     * Utility functions for observers that handle arrays
     */
    export const array = {
        map,
        filter,
        sort,
        first,
        limit,
        offset,
        window
    }

}

import { ObserverMapper } from "./ObserverMapper"
import { ObserverFilter } from "./ObserverFilter"