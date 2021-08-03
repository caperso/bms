---
slug: 20210119
title: Reflect 和 Proxy
author: Yao
author_title: senior developer
author_url: https://github.com/caperso
author_image_url: https://avatars.githubusercontent.com/u/34877623?s=400&u=8da3f1b8199cdbd5591ea229149fa663f2011065&v=4
tags: [js, esnext]
---

## Reflect

from **mdn** [https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Reflect](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Reflect)

> Reflect 是一个内置的对象，它提供拦截 JavaScript 操作的方法。

> 这些方法与 proxy handlers 的方法相同。Reflect 不是一个函数对象，因此它是不可构造的。

> 与大多数全局对象不同 Reflect 并非一个构造函数，所以不能通过 new 运算符对其进行调用，或者将 Reflect 对象作为一个函数来调用。

> Reflect 的所有属性和方法都是静态的（就像 Math 对象）。

> Reflect 对象提供了以下静态方法，这些方法与 proxy handler methods 的命名相同.

> 其中的一些方法与 Object 相同, 尽管二者之间存在 某些细微上的差别

<!--truncate-->

---

### 例子

```tsx
class Dog {
  constructor() {
    // ...
  }
  bark() {
    // ...
    console.log("wwwww");
  }
}
```

```tsx
const dog = new Dog();
dog.bark();
```

```tsx
const dog = Reflect.construct(Dog, []); // target=构造体函数, args=传入数组内容
const bark = Reflect.get(dog, "bark");
Reflect.apply(bark, dog, []);
```

## Proxy 例子

`let p = new Proxy(target, handler)`

```tsx
class BigP {
  name: string = "";
}

let handler = {
  get: function (ob: BigP) {
    return "this name is " + ob.name;
  },

  set: function (ob: BigP, prop: keyof BigP, val: string) {
    if (prop === "name") {
      ob[prop] = val;
      console.log("property set: " + prop + " = " + val);
      return true;
    } else {
      return true;
    }
  },
};

let p = new Proxy(new BigP(), handler);

p.name = "hello hello";
console.log(p.name);
```

`[LOG]: "property set: name = hello hello"`

`[LOG]: "this name is hello hello"`

拦截器各属性,方法,拦截内容,传参等

<https://juejin.cn/post/6844903741326360590>

### 高级实践
