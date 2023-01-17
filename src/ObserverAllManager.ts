import { Observer } from "./Observer"
import { Query, Store, match } from "./Store"

interface QueryAllObserver<T extends { id: Store.Id }> {
    observer: Observer<T[]>
    query: Query<T>
    matches: Map<Store.Id, T>
}

export class ObserverAllManager<T extends { id: Store.Id }> {

    private _observersAll: Observer<T[]>[] = []
    private _observersQueryAll: QueryAllObserver<T>[] = []

    notifyUpdate(updated: T[], allEntities: T[]) {
        for (const observer of this._observersAllIterable())
            observer.set(allEntities)

        for (const { observer, query, matches } of this._observersQueryAllIterable()) {
            for (const object of updated) {
                const doMatch = match(object, query)
                if (doMatch)
                    matches.set(object.id, object)
                else
                    matches.delete(object.id)
            }
            observer.set([...matches.values()])
        }
    }

    notifyDelete(ids: Store.Id[], allEntities: T[]) {
        for (const observer of this._observersAllIterable()) {
            observer.set(allEntities)
        }

        for (const { observer, matches } of this._observersQueryAllIterable()) {
            let change = false
            for (const id of ids) {
                let hadId = matches.delete(id)
                // Conditionnal assign after, because otherwise
                // we would only delete the first id (as the others would not
                // pass the right hand assignment)
                change ||= hadId
            }

            if (change) 
                observer.set([...matches.values()])
        }
    }

    private *_observersAllIterable(): Iterable<Observer<T[]>> {
        const observers = this._observersAll

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
    private *_observersQueryAllIterable(): Iterable<QueryAllObserver<T>> {
        const observers = this._observersQueryAll

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

    add(observer: Observer<T[]>, query?: Query<T>) {
        if (!query) {
            this._observersAll.push(observer)
            return
        }

        const matches = new Map<Store.Id, T>()
        for (const object of observer.value)
            matches.set(object.id, object)

        this._observersQueryAll.push({
            observer,
            query,
            matches
        })
    }

}