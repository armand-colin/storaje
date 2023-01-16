import { Observer } from "./Observer"
import { ObserverAllManager } from "./ObserverAllManager"
import { ObserverManager } from "./ObserverManager"

export function match<T extends { id: string }>(object: T, filter: Query<T>) {
    for (const key in filter) {
        if (object[key as keyof T] !== filter[key as keyof Query<T>])
            return false
    }
    return true
}

function findIterable<T>(iterable: Iterable<T>, filter: (value: T) => boolean): T | null {
    for (const item of iterable) {
        if (filter(item))
            return item
    }
    return null
}

export type Query<T extends { id: string }> = Partial<Omit<T, "id">>

interface StoreConfig<T> {
    clone: (value: T) => T
}

function defaultConfig<T>(): StoreConfig<T> {
    return {
        clone: object => ({ ...object })
    }
}

export class Store<T extends { id: string }> {

    _objects = new Map<string, T>()
    _observerManager = new ObserverManager<T>()
    _observerAllManager = new ObserverAllManager<T>()

    _config: StoreConfig<T>

    constructor() {
        this._config = defaultConfig()
    }

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

    delete(...ids: string[]) {
        const deletedIds: string[] = []

        for (const id of ids) {
            if (this._objects.delete(id))
                deletedIds.push(id)
        }

        // Emit things
        this._observerManager.notifyDelete(deletedIds)
        this._observerAllManager.notifyDelete(ids, this.getAll())
    }

    // Get single elements
    get(id: string): T | null {
        return this._objects.get(id) ?? null
    }

    find(query: Query<T>): T | null {
        return findIterable(this._objects.values(), object => match(object, query))
    }

    // Get multiple elements
    getAll(): T[] {
        return [...this._objects.values()]
    }

    findAll(query: Query<T>): T[] {
        return [...this._objects.values()].filter(object => match(object, query))
    }

    // observers
    observe(queryOrId: string | Query<T>): Observer<T | null> {
        const value = typeof queryOrId === "string" ?
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