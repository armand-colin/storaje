import { Observer } from "./Observer";

export class ObserverFilter<T> extends Observer<T | null> {

    private _filter: (value: T) => boolean
    private _observer: Observer<T>

    constructor(observer: Observer<T>, filter: (value: T) => boolean) {
        super(filter(observer.value) ? observer.value : null)
        observer.bind(this._onChange)
        this._filter = filter
        this._observer = observer
    }

    _onChange = (value: T) => {
        if (this._filter(value))
            this.set(value)
    }

    get destroyed() {
        return this._isDestroyed() || this._observer.destroyed
    }

}