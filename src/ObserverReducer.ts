import { Observer } from "./Observer";

export class ObserverReducer<T, U> extends Observer<U> {

    public static first<V>(observer: Observer<V[]>): Observer<V | null> {
        return new ObserverReducer(observer, values => values.length > 0 ? values[0] : null)
    }

    private _reducer: (value: T) => U
    private _observer: Observer<T>

    private constructor(observer: Observer<T>, reducer: (value: T) => U) {
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