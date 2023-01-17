import { describe, it } from "mocha";
import { Store, ObserverMapper, Observer } from "../src";
import { expect } from "chai";
import { expectEqualArrays } from "./common";

function randomid() {
    return Math.random().toString().slice(3, 9)
}

interface Test {
    id: string,
    name: string,
    age: number
}

namespace Test {
    export function mock(name?: string, age?: number) {
        return {
            id: randomid(),
            name: name ?? "Anonymous",
            age: age ?? (Math.random() * 100) | 0
        } as Test;
    }
}

describe("Store observers all", () => {

    it("Should have correct initial value", () => {
        const store = new Store<Test>()

        const object1 = Test.mock("first", 10)
        const object2 = Test.mock("second", 15)
        const object3 = Test.mock("third", 15)

        store.update(object1, object2, object3)
        
        expectEqualArrays(
            store.observeAll().value,
            [object1, object2, object3]
        )

        expectEqualArrays(
            store.observeAll({ age: 15 }).value,
            [object2, object3]
        )

        expectEqualArrays(
            store.observeAll({ name: "unknown" }).value,
            []
        )
    })

    it("Should trigger on change all", () => {
        const store = new Store<Test>()

        const object1 = Test.mock("first")
        const object2 = Test.mock("second")

        store.update(object1, object2)

        const observer = store.observeAll()
        expectEqualArrays(observer.value, [object1, object2])

        const object3 = Test.mock("third")
        store.update(object3)
        expectEqualArrays(observer.value, [object1, object2, object3])

        store.delete(object1.id, object3.id)
        expectEqualArrays(observer.value, [object2])
    })

    it("Should trigger on change all query", () => {
        const store = new Store<Test>()

        const a = Test.mock("a", 15)
        const b = Test.mock("b", 15)
        const c = Test.mock("c", 20)

        const observer = store.observeAll({ age: 20 })
        expectEqualArrays(observer.value, [])

        store.update(a, b, c)
        expectEqualArrays(observer.value, [c])

        a.age = 20
        store.update(a)
        expectEqualArrays(observer.value, [a, c])

        store.delete(c.id)
        expectEqualArrays(observer.value, [a])

        a.age = 33
        store.update(a)
        expectEqualArrays(observer.value, [])
    })

    it("Should fallback when deletion happens using ObserverReducer.first", () => {
        const store = new Store<Test>()

        const jack = Test.mock("jack", 15)
        const marc = Test.mock("marc", 15)
        store.update(jack, marc)

        const observer = Observer.array.first(store.observeAll({ age: 15 }))
        expect(observer.value).to.equal(jack)

        store.delete(jack.id)

        expect(observer.value).to.equal(marc)
    })

})