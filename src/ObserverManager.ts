import { Observer } from "./Observer"
import { Query, Store, match } from "./Store"

interface QueryObserver<T extends { id: Store.Id }> {
    observer: Observer<T | null>
    query: Query<T>
}

export class ObserverManager<T extends { id: Store.Id }> {

    _idObservers = new Map<Store.Id, Observer<T | null>[]>()
    _queryObservers: QueryObserver<T>[] = []

    notifyUpdate(updated: T[]) {
        for (const object of updated) {
            // Pass for ids
            for (const observer of this._idObserversIterable(object.id))
                observer.set(object)
        }

        for (const { observer, query } of this._queryObserversIterable()) {
            let value = observer.value
            for (const object of updated) {
                // If it corresponds to current object,
                // check if still viable
                if (value && object.id === value.id) {
                    // No more viable, shall reset to null
                    if (!match(object, query))
                        value = null
                    else
                        value = object
                    continue
                }
                if (match(object, query))
                    value = object
            }

            if (value !== observer.value)
                observer.set(value)
        }
    }

    notifyDelete(ids: Store.Id[]) {
        for (const id of ids) {
            for (const observer of this._idObserversIterable(id))
                observer.set(null)

            for (const { observer } of this._queryObserversIterable()) {
                const value = observer.value

                // Todo: Make sure there isn't an other match in all the data
                if (value && value.id === id)
                    observer.set(null)
            }
        }
    }

    private *_idObserversIterable(id: Store.Id): Iterable<Observer<T | null>> {
        const observers = this._idObservers.get(id)
        if (!observers)
            return

        let length = observers.length
        let i = 0
        while (i < length) {
            const observer = observers[i]
            if (observer.destroyed) {
                observers.splice(i, 1)
                length--
                continue
            }

            yield observer

            i++
        }
    }

    private *_queryObserversIterable(): Iterable<{ observer: Observer<T | null>, query: Query<T> }> {
        const observers = this._queryObservers

        let length = observers.length
        let i = 0
        while (i < length) {
            const { observer } = observers[i]
            if (observer.destroyed) {
                observers.splice(i, 1)
                length--
                continue
            }

            yield observers[i]

            i++
        }
    }

    add(observer: Observer<T | null>, queryOrId: string | Query<T>) {
        if (Store.isId(queryOrId))
            this._addIdObserver(observer, queryOrId)
        else
            this._addQueryObserver(observer, queryOrId)
    }

    _addIdObserver(observer: Observer<T | null>, id: Store.Id) {
        let observers = this._idObservers.get(id)
        if (observers === undefined) {
            observers = []
            this._idObservers.set(id, observers)
        }
        observers.push(observer)
    }

    _addQueryObserver(observer: Observer<T | null>, query: Query<T>) {
        this._queryObservers.push({ observer, query })
    }

}