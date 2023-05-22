

## How
`npm i hc_localstorage_plus`

## What
避免了繁琐的手动存储操作，并提供了更高的数据访问和修改安全性。
这使得代码更加**简洁**易读，易于维护和扩展。

## why?
Former:
`JSON.parse(localStorage.getItem(${key})) || {};`❌

optimization: 
`myLocalStorage.${key}`✅

## Example
```ts
const key = "myObject";
const initialData = {
    initData: "newData",
};

const myLocalStorage = new ProxiedLocalStorage(key, initialData);
// set it = localStorage.setItem(${key}, ${value})
myLocalStorage.initData = "change";
// get it = localStorage.getItem(${key}, ${value})
console.log(myLocalStorage.initData)
```

### Effect
![effct](./assets/effect.png)