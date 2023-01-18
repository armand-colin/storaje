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

describe("Store", () => {

    it("Should create empty store", () => {
        const store = new Store<Test>()
        expect(store.size).to.equal(0)
    })

    it("Should create objects by id", () => {
        const store = new Store<Test>()

        const object1 = Test.mock()
        const object2 = Test.mock()
        const object3 = Test.mock()

        store.update(object1, object2, object3)

        expect(store.size).to.equal(3)

        expect(store.get(object1.id)).to.equal(object1)
        expect(store.get(object2.id)).to.equal(object2)
        expect(store.get(object3.id)).to.equal(object3)
    })

    it("Should get objects with filter", () => {
        const store = new Store<Test>()

        const jack = Test.mock("jack", 10)
        const marc = Test.mock("marc", 15)
        const emma = Test.mock("emma", 20)

        store.update(jack, marc, emma)

        expect(store.size).to.equal(3)

        expect(store.find({ name: "jack" })).to.equal(jack)
        expect(store.find({ name: "marc", age: 15 })).to.equal(marc)
        expect(store.find({ name: "marc", age: 20 })).to.be.null
        expect(store.find({ age: 20 })).to.equal(emma)
        expect(store.find({})).to.be.oneOf([jack, emma, marc])
    })

    it("Should get all", () => {
        const store = new Store<Test>()

        const jack = Test.mock("jack", 10)
        const marc = Test.mock("marc", 15)
        const emma = Test.mock("emma", 20)

        store.update(jack, marc, emma)

        expect(store.size).to.equal(3)

        expect(store.getAll()).to.deep.equal([jack, marc, emma])
    })

    it("Should get all with filter", () => {
        const store = new Store<Test>()

        const jack = Test.mock("jack", 10)
        const marc = Test.mock("marc", 15)
        const emma = Test.mock("emma", 15)

        store.update(jack, marc, emma)

        expect(store.size).to.equal(3)

        expect(store.findAll({ name: "jack" })).to.deep.equal([jack])
        expect(store.findAll({ age: 15 })).to.deep.equal([marc, emma])
        expect(store.findAll({})).to.deep.equal([jack, marc, emma])
        expect(store.findAll({ name: "john" })).to.deep.equal([])
    })

    it("Should not get objects after delete", () => {
        const store = new Store<Test>()

        const jack = Test.mock("jack", 10)
        const marc = Test.mock("marc", 15)
        const emma = Test.mock("emma", 15)

        store.update(jack, marc, emma)

        store.delete(jack.id)

        expect(store.get(jack.id)).to.be.null
        expect(store.find({ name: "jack" })).to.be.null
    })

})