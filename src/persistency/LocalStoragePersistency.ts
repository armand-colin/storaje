import { Store } from "../Store";
import { Persistency } from "./Persistency";

export class LocalStoragePersistency<T extends { id: Store.Id }> implements Persistency<T> {

    constructor(public readonly key: string) { }

    private get _prefix() { return this.key + "$$" }

    load(): T[] | Promise<T[]> {
        const length = localStorage.length
        const prefix = this._prefix
        const objects: T[] = []
        for (let i = 0; i < length; i++) {
            const key = localStorage.key(i)

            if (key === null)
                continue

            const item = localStorage.getItem(key)

            if (item === null)
                continue

            if (!item.startsWith(prefix))
                continue

            try {
                const object = JSON.parse(item)
                objects.push(object)
            } catch(e) {
                console.error(`Error while reading ${key} : ${item}`, e)
            }
        }

        return objects
    }

    onCreate(objects: T[]): void {
        const prefix = this._prefix
        for (const object of objects)
            localStorage.setItem(`${prefix}${object.id}`, JSON.stringify(object))
    }

    onUpdate(objects: T[]): void {
        const prefix = this._prefix
        for (const object of objects)
            localStorage.setItem(`${prefix}${object.id}`, JSON.stringify(object))
    }

    onDelete(ids: Store.Id[]): void {
        const prefix = this._prefix
        for (const id of ids)
            localStorage.removeItem(`${prefix}${id}`)
    }

}