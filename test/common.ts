import { expect } from "chai"

export function expectEqualArrays<T extends { id: string }>(a: T[], b: T[]) {
    expect(a.length).to.equal(b.length)

    const mapA = new Map<string, T>()
    const mapB = new Map<string, T>()

    for (const object of a)
        mapA.set(object.id, object)

    for (const object of b)
        mapB.set(object.id, object)

    for (const [id, objectA] of mapA) {
        const objectB = mapB.get(id)
        expect(objectA).to.deep.equal(objectB)
    }
}