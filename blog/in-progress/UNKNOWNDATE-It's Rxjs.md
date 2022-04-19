---
slug: 20211011
title: It's Rxjs
author: Yao
author_title: senior developer
author_url: https://github.com/caperso
author_image_url: https://avatars.githubusercontent.com/u/34877623?s=400&u=8da3f1b8199cdbd5591ea229149fa663f2011065&v=4
tags: [redux rxjs redux-observable epic]
---

// This is a mix of rxjs and redux-observable

INTRO

First I'm very glad that you can join my presentation about the Rxjs

And hope this presentation can bring you something.

Of course, you can interrupt anytime if you have questions, thanks

ENTERANCE

Rxjs gives me an raelly different impression when I first touched it.

Unlike the common js syntax or other libs/languages, it takes a different concept of event hanlding.

'RXJS is a lib for reactive programming'

- this definition makes no scence to me at all - What is reactive programming?

I can give really brief introduction of what it is.

think we're the owner of a reseturant, we build the UI ,that's the front face of the house, to attract the customers

but inside the house the curtail part is serving.

customers will arrive here and they will do the order and we do the service.

Rxjs is one of the serving solutions.

the most basic parts are:

1. Oberserbal
2. Observe
3. Operators
4. Pipe

   - Again these does not make scence to me again, what are they? what does they even mean?

To give a quick answer, back to the restruant, they're

**Ingredients**

- Data
- They can be like vegetables / meat / sours / bread

**Customer**

- Observable
- A customer can give multiple bags of Ingredients(Observable can emits multiple dataF)
- Observable is actually a abstract concept

**Kitchen**

- Pipe
- Some chef doing their specific job

**Chef**

- Operator
- Chef Mike only take the ingredients out out the bag
- Chef John only check the meat is chicken or not
- Chef Price only cook the meat
- Chef Ramirez only do the assembly and wrap it with a bag
- Chef Gordon only shout at the people when something goes wrong
- ...

**Waiter**

- Observer
- Waiter Yao
- To give the customer the food they want, or report that something goes wrong and customer cannot get want they want

```json
{
  "ingredients": "",
  "chef": "operator"
}
```

Main character

Observable / Of / From

a basic usage of obseverable

<https://codesandbox.io/s/damp-shape-2rqz7j?file=/src/index.js>

**of**: convert an instance to an observable

```typescript
const instance = { name: "bird" };
```

**from**: convert an promise to an observable

```typescript

```

**action**

```typescript
const fetchAction = { type: "fetch" };
const observable = of(fetchAction);
```

switchMap and mergeMap

Let's dive down a bit to the source code.

From the 'Observable'

```typescript
import { Observable } from "rxjs";

const observable = new Observable<number>((subscriber) => {
  subscriber.next(1);
  subscriber.next(2);
  subscriber.complete();
});

observable.subscribe({
  next: (data) => console.log(data),
  complete: () => console.log("done"),
});
```

It will print

```
1
2
done
```

Let's see inside the `new Observable`

```typescript
// src/internal/Observable.ts
export class Observable<T> implements Subscribable<T> {
  // ...
  // subscribe?:(this: Observable<T>, subscriber: Subscriber<T>) => TeardownLogic
  constructor(subscribe) {
    if (subscribe) {
      this._subscribe = subscribe;
    }
  }
  // ...
}
```

The initialization is easy

```typescript
this._subscribe = subscribe;
```

We can see the `Observable` **implements** `Subscribable` interface

```typescript
// src/internal/Observable.ts
class Observable<T> implements Subscribable<T> {
  /* */
}

// src/internal/types.ts
export interface Subscribable<T> {
  subscribe(observer: Partial<Observer<T>>): Unsubscribable;
}

export interface Unsubscribable {
  unsubscribe(): void;
}
```

<!-- This `subscribe` it has three different assigns, and the difference between them is the paramaters they accepect, and they all resulted in Unsubscribable
we take a look the first one -->

```typescript
type observer = (): Partial<Observer<T>>
```

```typescript
subscribe(observer?: Partial<Observer<T>>): Subscription;
```

What is `Observer` interface?

```typescript
export interface Observer<T> {
  next: (value: T) => void;
  error: (err: any) => void;
  complete: () => void;
}
```

observer is an object with three props `next` `error` `complete`

Back to the top, when we start initialize the `observable`
Here we input a `mySubscribe` function

```typescript
this._subscribe = subscribe;
```

```typescript
const mySubscribe = (subscriber /* controlled by the Observable instance*/) => {
  subscriber.next(1);
  subscriber.next(2);
  subscriber.complete();
};

const observable = new Observable(mySubscribe);
```

The

```typescript
subscribe(
    observerOrNext?: Partial<Observer<T>> | ((value: T) => void) | null,
    error?: ((error: any) => void) | null,
    complete?: (() => void) | null
  ): Subscription {
    const subscriber = isSubscriber(observerOrNext) ? observerOrNext : new SafeSubscriber(observerOrNext, error, complete);
  }

interface Subscription{}
```

mySubscribe 的第一个参数可以是一个 subscriber（具有 next、error、complete 三个属性，所以类型合法），不过这种传参形式一般都是库内部使用，我们正常写法还是传入一个纯粹的对象或者方法，那么就意味着会执行 new SafeSubscriber(observerOrNext, error, complete)

```typescript
// src/internal/Subscriber.ts
export class SafeSubscriber<T> extends Subscriber<T> {
  // ...
}
```

SafeSubscriber 继承了 Subscriber，主要作用是对 next、error、complete 三个方法属性进行了一层封装，保证能够更好地进行错误处理

```typescript
subscriber.add(
  operator
    ? // We're dealing with a subscription in the
      // operator chain to one of our lifted operators.
      operator.call(subscriber, source)
    : source
    ? // If `source` has a value, but `operator` does not, something that
      // had intimate knowledge of our API, like our `Subject`, must have
      // set it. We're going to just call `_subscribe` directly.
      this._subscribe(subscriber)
    : // In all other cases, we're likely wrapping a user-provided initializer
      // function, so we need to catch errors and handle them appropriately.
      this._trySubscribe(subscriber)
);
```

Subscribe with an Observer - A waiter

```ts
const sumObserver = {
  sum: 0,
  next(value) {
    console.log("Adding: " + value);
    this.sum = this.sum + value;
  },
  error() {},
  complete() {
    console.log("Sum equals: " + this.sum);
  },
};

// Synchronously emits 1, 2, 3 and then completes.
of(1, 2, 3).subscribe(sumObserver);

// Logs:
// 'Adding: 1'
// 'Adding: 2'
// 'Adding: 3'
// 'Sum equals: 6'
```

Subscribe with functions

```ts
let sum = 0;

const subscriber = of(1, 2, 3).subscribe(
  // first parameter
  (value) => {
    console.log("Adding: " + value);
    sum = sum + value;
  },
  undefined,
  () => console.log("Sum equals: " + sum)
);
```

errorContext 也是一个错误处理的包装方法，里面只调用了一个 subscriber.add 方法，这个方法的参数用了两个嵌套的三元表达式。

rxjs 内置的众多操作符(operator) 会调用 Observable，这个场景下，this.operator 就有值了，所以如果是操作符调用，就会走 operator.call(subscriber, source)；rxjs 内部的一些 Subject 在某些情况下会执行到第二个逻辑 `this._subscribe(subscriber)`；

其他情况（即开发者正常使用的情况）会执行 `this._trySubscribe(subscriber)`，前两个涉及到 operator 和 Subject，而且最终的大概流程跟直接执行第三个是差不多的，所以这里只看第三个
`this._subscribe` 就是在最开始 new Observable 的时候传入的参数，所以只要有订阅操作(subscribe)，就会执行这个方法

```typescript
protected _trySubscribe(sink: Subscriber<T>): TeardownLogic {
 try {
   return this._subscribe(sink);
 } catch (err) {
   // We don't need to return anything in this case,
   // because it's just going to try to `add()` to a subscription
   // above.
   sink.error(err);
 }
}

```

而在本文的例子里，new Observable 的函数参数里，调用了 subscriber.next 和 subscriber.complete

```typescript

protected _next(value: T): void {
this.destination.next(value);
}
protected _error(err: any): void {
try {
this.destination.error(err);
} finally {
this.unsubscribe();
}
}
protected _complete(): void {
try {
this.destination.complete();
} finally {
this.unsubscribe();
}
}
```

this.destination 这个对象，在 new SafeSubscriber 的时候，被设置了 next、error、complete 三个方法属性，就是订阅的时候传入的三个自定义方法，在这里调用到了

```typescript
// 简化后的代码
subscriber.add(this._trySubscribe(subscriber));
```

这个是为了收集 teardown，也就是订阅取消(unsubscribe)的时候执行的收尾/清理方法，比如在订阅里启动了一个轮询方法，那么结束订阅的时候，你想同时也取消掉这个轮询逻辑，那么就可以在 new Observable 的方法体里，最后返回一个取消轮询的方法，那么在 unsubscribe 的时候就会自动调用这个 teardown 方法执行你定义的取消轮询逻辑，类似于 React.useEffect 最后返回的那个方法

```typescript

add(teardown: TeardownLogic): void {
// Only add the teardown if it's not undefined
// and don't add a subscription to itself.
if (teardown && teardown !== this) {
if (this.closed) {
// If this subscription is already closed,
// execute whatever teardown is handed to it automatically.
execTeardown(teardown);
} else {
if (teardown instanceof Subscription) {
// We don't add closed subscriptions, and we don't add the same subscription
// twice. Subscription unsubscribe is idempotent.
if (teardown.closed || teardown. _hasParent(this)) {
return;
}
teardown. _addParent(this);
}
(this. _teardowns = this. _teardowns ?? []).push(teardown);
}
}
}

```

this.closed 的值用于标识当前 subscription 是否已经取消订阅了（complete、error、unsubscribe 都会将此值置为 true），this. \_teardowns 就是用于存放与当前 subscription 所有有关的 teardown，可以看到，teardown 除了是一个自定义的清理方法外，还可以是一个 Subscription
一个 subscription（称为父 subscription）可以通过 add 连接到另外一个 subscription（称为子 subscription），那么在父 subscription 调用 unsubscribe 方法取消订阅的时候，由于会执行 this. \_teardowns 里所有的方法，也就会调用子 subscription 的 unsubscribe，取消其下所有子孙 subscription 的订阅
这种关系看起来是一种父子关系，所以通过私有属性 \_parentage 来标明这种关系，作用是避免 B subscription 被同一个 subscription 重复订阅的问题，Subscription 里定义了几个方法用于管理 \_parentage 的数据，例如 \_hasParent、 \_addParent、 \_removeParent

```typescript
const observable1 = interval(100);
const observable2 = interval(200);

const subscription1 = observable1.subscribe((x) => console.log("first: " + x));
const subscription2 = observable2.subscribe((x) => console.log("second: " + x));

subscription2.add(subscription1);
setTimeout(() => {
  subscription2.unsubscribe();
}, 400);
```

上述代码中，subscription2 通过 add 方法连接到了 subscription1，那么在 subscription2 调用 unsubscribe 的时候，也会同时执行 subscription1 的 unsubscribe，所以输出为

```typescript
// 开始输出
first: 0;
first: 1;
second: 0;
first: 2;
first: 3;
second: 1;
// 结束输出
```

unsubscribe
有订阅就有取消订阅，unsubscribe 主要用作执行一些清理动作，例如执行在 subscribe 的时候收集到的 teardown，以及更新 \_parentage 的数据

```typescript

// rxjs/src/internal/Subscription.ts
unsubscribe(): void {
// ...
const {  _parentage } = this;
if ( _parentage) {
// 更新  _parentage
}

const { initialTeardown } = this;
if (isFunction(initialTeardown)) {
// 执行 initialTeardown
}

const {  _teardowns } = this;
if ( _teardowns) {
// ...
// 执行 teardown
}
// ...
}
```

这里有个 initialTeardown 方法，可以理解为 Subscription 取消订阅时会执行的函数，作为使用者一般不需要关心这个，库内部会使用到

```typescript
const subscription = new Subscription(() => {
  console.log("取消订阅时执行 initialTeardown");
});
const observable = new Observable<number>((subscribe) => {
  subscribe.next(1);
  return subscription;
});
const subscription1 = observable.subscribe((d) => console.log(d));
subscription1.unsubscribe();
// 开始输出
// 1
// 取消订阅时执行 initialTeardown
// 结束输出
```

至此，由文章开头例子所引申出来的源码逻辑都看完了，关于 Subscription 的也看得差不多，再回头看看 Observable 中没提到的地方

```typescript

lift
lift<R>(operator?: Operator<T, R>): Observable<R> {
const observable = new Observable<R>();
observable.source = this;
observable.operator = operator;
return observable;
}
```

lift 通过 new Observable 返回新的 observable，并且标记了 source 和 operator，这是为了方便链式操作，在当前版本中，官方已经不建议开发者直接调用这个方法了，主要是供给 rxjs 内部众多的 operators 使用

forEach

```typescript
forEach(next: (value: T) => void, promiseCtor?: PromiseConstructorLike): Promise<void> {
  promiseCtor = getPromiseCtor(promiseCtor);

  return new promiseCtor<void>((resolve, reject) => {
    // Must be declared in a separate statement to avoid a ReferenceError when
    // accessing subscription below in the closure due to Temporal Dead Zone.
    let subscription: Subscription;
    subscription = this.subscribe(
      (value) => {
        try {
          next(value);
        } catch (err) {
          reject(err);
          subscription?.unsubscribe();
        }
      },
      reject,
      resolve
    );
  }) as Promise<void>;
}
```

getPromiseCtor 可以理解为 js 中的 Promise 对象，主要看调用 this.subscribe 这一句

```typescript

subscribe(next?: ((value: T) => void) | null, error?: ((error: any) => void) | null, complete?: (() => void) | null): Subscription;

```

subscribe 的函数定义前面已经看过了，这里调用 subscribe 传入的三个参数与 next、error、complete 一一对应，next 会持续调用直到 complete 执行，这个 promise 才算是结束了，所以如果你想要使用这个方法，就必须确保所使用的 observable 最终会调用 complete 方法，否则意味着 promise 不会结束，forEach 也就一直处于 hung up 的状态
一般情况下，我们是不会使用到这个方法的，因为很多需要 forEach 的场景完全可以用操作符来代替，比如针对 forEach 源码中给的一个使用例子

```typescript
import { interval } from "rxjs";
import { take } from "rxjs/operators";

const source$ = interval(1000).pipe(take(4));
async function getTotal() {
  let total = 0;
  await source$.forEach((value) => {
    total += value;
    console.log("observable -> ", value);
  });
  return total;
}
getTotal().then((total) => console.log("Total:", total));
```

如果用 reduce 操作符来实现会更加直观

```typescript
import { interval } from "rxjs";
import { reduce } from "rxjs/operators";

const source$ = interval(1000).pipe(take(4));
source$
  .pipe(
    reduce((acc, value) => {
      console.log("observable -> ", value);
      return acc + value;
    }, 0)
  )
  .subscribe((total) => console.log("Total:", total));
```

pipe
pipe 的类型签名很多，实际上是为了辅助类型的自动推导，只要 pipe 传入的参数数量在 9 个及以内，则就可以正确推导出类型，而一旦超过 9 个，自动推导就失效了，必须使用者自己指定类型

```typescript
// rxjs/src/internal/Observable.ts
pipe(...operations: OperatorFunction<any, any>[]): Observable<any> {
  return pipeFromArray(operations)(this);
}

// rxjs/src/internal/util/identity.ts
export function identity<T>(x: T): T {
  return x;
}

// rxjs/src/internal/util/pipe.ts
/** @internal */
export function pipeFromArray<T, R>(fns: Array<UnaryFunction<T, R>>): UnaryFunction<T, R> {
  if (fns.length === 0) {
    return identity as UnaryFunction<any, any>;
  }

  if (fns.length === 1) {
    return fns[0];
  }

  return function piped(input: T): R {
    return fns.reduce((prev: any, fn: UnaryFunction<T, R>) => fn(prev), input as any);
  };
}

```

pipe 调用了 pipeFromArray，pipeFromArray 的参数 fns 即所有传入 pipe 的参数，也就是操作符 operator
如果没有传入任何操作符方法，则直接返回 Observable 对象；如果只传入了一个操作符方法，则直接返回该操作符方法，否则返回一个函数，将在函数体里通过 reduce 方法依次执行所有的操作符，执行的逻辑是将上一个操作符方法返回的值作为下一个操作符的参数，就像是一个管道串联起了所有的操作符，这里借鉴了函数式编程的思想，通过一个 pipe 函数将函数组合起来，上一个函数的输出成为下一个函数的输入参数
最后，不管是传入了几个操作符，最终返回的都是一个 Observable 的实例，所以可以接着调用 subscribe 方法
toPromise

```typescript
// src/internal/Observable.ts
toPromise(promiseCtor?: PromiseConstructorLike): Promise<T | undefined> {
  promiseCtor = getPromiseCtor(promiseCtor);

  return new promiseCtor((resolve, reject) => {
    let value: T | undefined;
    this.subscribe(
      (x: T) => (value = x),
      (err: any) => reject(err),
      () => resolve(value)
    );
  }) as Promise<T | undefined>;
}

```

toPromise 方法跟上面提到的 forEach 的实现很相似，将一个 Observable 对象转换成了一个 Promise 对象，会在 .then 的时候返回这个 Observable 最后一个值，这个方法已经被标记为 deprecated 了，将会在 v8.x 中被移除，并且作者在源码注释里建议我们使用 firstValueFrom 和 lastValueFrom 来代替这个方法

```typescript
const source$ = interval(100).pipe(take(4));
source$.toPromise().then((total) => console.log(total));

// 相当于
const source$ = interval(100).pipe(take(4));
lastValueFrom(source$).then((total) => console.log(total));

// 输出
// 3
```

用法上看着好像区别不大，实际上 lastValueFrom 的实现和 toPromise 也差不多，但从方法名上来说显然更加语义化

```typescript
// rxjs/src/internal/lastValueFrom.ts
export function lastValueFrom<T, D>(
  source: Observable<T>,
  config?: LastValueFromConfig<D>
): Promise<T | D> {
  const hasConfig = typeof config === "object";
  return new Promise<T | D>((resolve, reject) => {
    let _hasValue = false;
    let _value: T;
    source.subscribe({
      next: (value) => {
        _value = value;
        _hasValue = true;
      },
      error: reject,
      complete: () => {
        if (_hasValue) {
          resolve(_value);
        } else if (hasConfig) {
          resolve(config!.defaultValue);
        } else {
          reject(new EmptyError());
        }
      },
    });
  });
}
```

小结
Observable、Subscription 部分的代码还是比较简单的，并没有什么七拐八拐的逻辑，官方源码中的注释也非常详细（甚至在注释里写 example），简直就是在文档里写代码，再加上 ts 的助攻，可以说源码看起来没啥难度，当然了，这只是 rxjs 系统中两个最基础的概念，一般情况下使用 rxjs 是不会用到这两个概念的，Subject 和 operators 才是常客
