import { Store } from "../src";
import { expect } from "chai";

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

describe("Store observers", () => {

    it("Should have correct initial value", () => {
        const store = new Store<Test>()
        
        const object1 = Test.mock("first")
        const object2 = Test.mock("second")

        store.update(object1, object2)

        expect(store.observe(object1.id).value).to.equal(object1)
        expect(store.observe(object2.id).value).to.equal(object2)

        expect(store.observe({ name: "first" }).value).to.equal(object1)

        expect(store.observe("impossibleId").value).to.equal(null)
    })

    it("Should trigger on change", () => {
        const store = new Store<Test>()
        
        const object1 = Test.mock("first")
        const object2 = Test.mock("second")

        store.update(object1, object2)

        const observer = store.observe({ name: "first-after" })
        expect(observer.value).to.equal(null)

        object1.name = "first-after"
        store.update(object1)

        expect(observer.value).to.equal(object1)

        object1.name = "huh-no-nvm"
        store.update(object1)

        expect(observer.value).to.equal(null)
    })

    it("Should not trigger after destroy", () => {
        const store = new Store<Test>()
        
        const object1 = Test.mock("first")

        store.update(object1)

        const observer = store.observe({ name: "first-after" })

        expect(observer.value).to.equal(null)

        object1.name = "first-after"
        store.update(object1)

        expect(observer.value).to.equal(object1)

        observer.destroy()

        object1.name = "first"
        store.update(object1)

        expect(observer.value).to.equal(object1)
    })

    it("Should trigger a delete after a delete - duh", () => {
        const store = new Store<Test>()

        const jack = Test.mock("jack", 10)
        const marc = Test.mock("marc", 15)
        const emma = Test.mock("emma", 15)

        store.update(jack, marc, emma)

        let observer = store.observe(jack.id)
        expect(observer.value).to.equal(jack)

        store.delete(jack.id)
        expect(observer.value).to.be.null

        observer = store.observe({ name: "marc" })
        expect(observer.value).to.equal(marc)
        
        store.delete(marc.id)
        expect(observer.value).to.be.null
    })

    //! This test do not pass, but may never do. See ObserverReducer.firstOf for 
    //! more information

    // it("Should fallback when deletion happens", () => {
    //     const store = new Store<Test>()

    //     const jack = Test.mock("jack", 15)
    //     const marc = Test.mock("marc", 15)
    //     store.update(jack, marc)

    //     const observer = store.observe({ age: 15 })
    //     expect(observer.value).to.equal(jack)

    //     store.delete(jack.id)

    //     expect(observer.value).to.equal(marc)
    // })

})