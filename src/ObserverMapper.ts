import { Observer } from "./Observer"

export class ObserverMapper<T, U> extends Observer<U> {

    private _reducer: (value: T) => U
    private _observer: Observer<T>

    constructor(observer: Observer<T>, reducer: (value: T) => U) {
        super(reducer(observer.value))
        observer.bind(this._onChange)
        this._reducer = reducer
        this._observer = observer
    }

    _onChange = (value: T) => {
        this.set(this._reducer(value))
    }

    get destroyed() {
        return this._isDestroyed() || this._observer.destroyed
    }

}