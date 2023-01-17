# storaje

## A configurable model stack to implement in your favorite front-end framework

The goal of **storage** is to give a very simple model implementation (like a database with events), that you can tweak and customize to fit your needs.  
  
Quite everything is based on two aspects: a `Store`, which is where you store your data, and `Observer`s, which allow you to register through data changes.  
  
In the future, there will be integrations with popular frameworks, such as Svelte and React, and also a way for you to keep this data in a persistent cache (through local storage, filesystem or real databases).

## Installation

For now the project is not published, but you could use it as a submodule and link it locally for now
- Clone the repo
- Intialize and build the repo
```sh
npm install
npm build
```
or just run `yarn`
- Create the link
```sh
# In the storaje repository
npm link

# In your project repository
npm link storaje
```
or with yarn
```sh
# In the storaje repository
yarn link

# In your project repository
yarn link storaje
```
- Import the project as any library, and enjoy
```js
import { Store } from "storaje"

const store = new Store()
```

## Documentation

`Stores` are based on the idea that you will have objects with a unique `id` parameter. For now it is hardcoded, and is intended to be a string.  

### Inserting / updating objects

To insert / update objects, just call the `update` method on `Store`. It takes as many objets as arguments as you want

```ts
import { Store } from "storaje"

interface Dog {
    id: string,
    name: string,
    age: number
}

const store = new Store<Dog>()

const doug: Dog = {
    id: "1",
    name: "doug",
    age: 7
}

const jake: Dog = {
    id: "2",
    name: "jake",
    age: 3
}

const jimmy: Dog = {
    id: "3",
    name: "jimmy",
    age: 7
}

store.update(doug, jake)
```

### Retrieving objects

Now that you've populated your store, you can get them by id using `get`, or with a `Query` using `find`.  
`Query`s are a partial representation of your objects, where all the filled fields have to be equal in the target object to be accepted (may be clearer in code).

```ts
// Using the same store

const dog1 = store.get("1") // doug

const dog2 = store.find({ age: 3 }) // jake

const dog3 = store.find({ name: "beatrice" }) // null, because no dog has the name beatrice wtf

const dog4 = store.find({ name: "jake", age: 4 }) // null, because no dog has the name "jake" AND is 4 years old
```

If you want to get multiple objects, you can use the `getAll` and `findAll` equivalents.

```ts
// Using the same store

const allDogs = store.getAll() // [doug, jake, jimmy]

const dogsThatAre3YearsOld = store.find({ age: 3 }) // [doug, jimmy]
```

### Deleting objects

To delete objects, you can call the method `delete`, giving all the ids of the objects you want to delete as arguments

```ts
store.delete("1", "3")

store.get("1") // null, cuz doug has been killed
```

### Registering to changes

To register to changes, you will have to use `Observer`s. The concept of the observer is to act like a query for your store, which will be updated when objects are updates / deleted.  

```ts
Observer<T>.value: T
```
Lets you get the current value of an observer

```ts
const callback = (value: T) => { }
Observer<T>.bind(callback)
```
Lets you bind to this observer's changes. Whenever the value changes, the given callback will be called
```ts
Observer<T>.unbind(callback)
```
Lets you unbind a previously set callback via `bind`
```ts
Observer.destroy()
```
Destroys the observers, making it unable to get changes and cleaning all the binded callbacks.

You can register to single objects using `store.observe`. This method takes either an id or a query as a parameter. The value of this observer will either be an object or `null`.

```ts
const observer = store.observe("some-id")
console.log(observer.value) // null

observer.bind(value => console.log("New value name:", value.name))

store.update({ id: "some-id", name: "test" })
// New value name: "test"

console.log(observer.value) // { id: "some-id", name: "test" }
```

To register to multiple objects, you can use the method `store.observeAll`, which takes an optionnal query as a parameter. If you do not set it, the observer will register for the entire store.

## Known issues

There are some strange behaviors to be expected if you register an observer on a single object with a query, but that matches multiple objects. In this case, the observer will "hook" to one object, and if it's deleted, the observer will have the value `null` instead of falling back to the second match.  
  

Example :
```ts
const store = new Store<{ id: string, size: number }>()

store.update(
    { id: "1", size: 10 },
    { id: "2", size: 5 },
    { id: "3", size: 5 },
    { id: "4", size: 10 },
);

const observer = store.observe({ size: 10 })
console.log(observer.value) // { id: "1", size: 10 }

store.delete("1")
console.log(observer.value) // null, even though the object with the id "4" would be a match
```

To avoid this behaviour, you can wrap an `observerAll` around an `ObserverReduced.first`, like this:

```ts
const store = new Store<{ id: string, size: number }>()

store.update(
    { id: "1", size: 10 },
    { id: "2", size: 5 },
    { id: "3", size: 5 },
    { id: "4", size: 10 },
);

const observer = ObserverReducer.first(store.observeAll({ size: 10 }))

console.log(observer.value) // { id: "1", size: 10 }

store.delete("1")
console.log(observer.value) // { id: "4", size: 10 }
```

## Roadmap

- React implementation
- Document `ObserverReducer`
- Enhance and simplify the reducer to be accessible directly on the observer class