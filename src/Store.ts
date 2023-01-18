import { Observer } from "./Observer"
import { ObserverAllManager } from "./ObserverAllManager"
import { ObserverManager } from "./ObserverManager"

export function match<T extends { id: Store.Id }>(object: T, filter: Query<T>) {
    for (const key in filter) {
        if (object[key as keyof T] !== filter[key as keyof Query<T>])
            return false
    }
    return true
}

export type Query<T extends { id: Store.Id }> = Partial<Omit<T, "id">>

export class Store<T extends { id: Store.Id }> {

    _objects = new Map<Store.Id, T>()
    _observerManager = new ObserverManager<T>()
    _observerAllManager = new ObserverAllManager<T>()

    public get size() {
        return this._objects.size
    }

    update(...objects: T[]) {
        const created: T[] = []

        let size = this._objects.size

        for (const object of objects) {
            this._objects.set(object.id, object)
            if (this._objects.size > size) {
                size++
                created.push(object)
            }
        }

        // Emit things
        this._observerManager.notifyUpdate(objects)
        this._observerAllManager.notifyUpdate(objects, this.getAll())
    }

    delete(...ids: Store.Id[]) {
        const deletedIds: Store.Id[] = []

        for (const id of ids) {
            if (this._objects.delete(id))
                deletedIds.push(id)
        }

        // Emit things
        this._observerManager.notifyDelete(deletedIds)
        this._observerAllManager.notifyDelete(ids, this.getAll())
    }

    // Get single elements
    get(id: Store.Id): T | null {
        return this._objects.get(id) ?? null
    }

    find(query: Query<T>): T | null {
        for (const item of this._objects.values()) {
            if (match(item, query))
                return item
        }
        return null
    }

    // Get multiple elements
    getAll(): T[] {
        return [...this._objects.values()]
    }

    findAll(query: Query<T>): T[] {
        return [...this._objects.values()].filter(object => match(object, query))
    }

    // observers
    observe(queryOrId: Store.Id | Query<T>): Observer<T | null> {
        const value = Store.isId(queryOrId) ?
            this.get(queryOrId) :
            this.find(queryOrId)

        const observer = new Observer(value)

        this._observerManager.add(observer, queryOrId)

        return observer
    }

    observeAll(query?: Query<T>): Observer<T[]> {
        const value = query ?
            this.findAll(query) :
            this.getAll()

        const observer = new Observer(value)

        this._observerAllManager.add(observer, query)

        return observer
    }

}

export namespace Store {
    export type Id = string | number

    export function isId(id: any): id is Id {
        return (typeof id === "string") || (typeof id === "number")
    }
}