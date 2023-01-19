import type { Store } from "../Store";

export interface Persistency<T> {
    onCreate(objects: T[]): void
    onUpdate(objects: T[]): void
    onDelete(ids: Store.Id[]): void
    load(): T[] | Promise<T[]>
}