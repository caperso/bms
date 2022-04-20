---
slug: 20211011
title: It's Rxjs
author: Yao
author_title: senior developer
author_url: https://github.com/caperso
author_image_url: https://avatars.githubusercontent.com/u/34877623?s=400&u=8da3f1b8199cdbd5591ea229149fa663f2011065&v=4
tags: [redux rxjs redux-observable epic]
---

## INTRO

First I'm very glad that you can join this session.

This is all about the basics of Rxjs, I cannot cover it all up, but I will try to explain some of the most important Rxjs concepts.
Hope it can bring you something.

And of course, you can interrupt me anytime if you have questions, thanks

## EXPLANATION

What's Rxjs

- `REACTIVE EXTENSIONS LIBRARY FOR JAVASCRIPT`
- `RxJS is a library for reactive programming using Observables`

  - This definition makes no scene to me at all
  - What is reactive programming?

- `ReactiveX is a combination of the best ideas from the Observer pattern, the Iterator pattern, and functional programming`

  - Not quite easy to understand right?
  - It doesn't matter, let's just forget about these for now.

Anyway,Rxjs gives me a really great impression at the time I first touched it, unlike the common js syntax or other libs/languages, rxjs or reactive programming takes a really different view of event handling.

Before I begin, let's take a look at these objects

1. Observable
2. Observer
3. Subscribe
4. Subscriber
5. Subscription

And also

- Operators
- Pipe

  - Again these does not make scene to me again, what are they? what does they even mean?

There're so many abstract concepts, and their names are quite confusing, we cannot figure them out just by reading them.

So it's time to talk about the goal of this session

    - Just to figure out this code example below

```ts
let sum = 0;

of(1, 2, 3)
  .pipe(map((item) => item + 1))
  .subscribe(
    (value) => {
      console.log("Adding: " + value);
      sum = sum + value;
    },
    undefined, // ignore this
    () => console.log("Sum equals: " + sum) // ignore this
  );
```

## A Metaphor

Think we're the owner of a restaurant, here we only serve with the Burger

Outside of the house, we build the UI, the front face of the house, to attract the customers.

Inside the house, the curtail thing is how to serve our customer.

Again, think our customers will arrive at the restaurant along with the food bag with ingredients, they give the ingredients we do the rest.

Forget about the money, in this world, we trade goods for goods

Back to these previous objects

1. Observable
2. Subscriber
3. Observer
4. Operators
5. Pipe

To give a quick answer, in this restaurant, they're

**Restaurant / Flow**

- Observable

**Ingredients**

- Data
- They can be like vegetables / meat / bread /...

**Customer**

- Subscriber
- Data source
- A customer can give multiple bags of Ingredients
  - A subscriber can emits multiple data

**Kitchen**

- Pipe
- There are some chefs in the kitchen, each of them only for a specific job

**Chef**

- Operator
- Chef Mike only take the ingredients out of the bag
- Chef John only check the meat is chicken or not
- Chef Price only cook the chicken meat
- Chef Ramirez only do the food assembly and wrap it with a bag
- Chef Gordon only shout at the people when something goes wrong
- ...

**Waiter**

- Observer
- Waiter Yao
- His job is to give the customer the food they want, or report that something goes wrong and customer cannot get what they want

Now, let's run this Burger restaurant

Also, it's a basic usage of observable

<https://codesandbox.io/s/damp-shape-2rqz7j?file=/src/index.js>

### Of / From -> Observable

Before we start the source code part, I have to mention that we mostly use `of` and `from` to create the observables on our daily development.

**of**: can convert an instance to an observable

```ts
const observable = new Observable<number>((subscriber) => {
  subscriber.next(1);
  subscriber.next(2);
  subscriber.complete();
});

observable.subscribe({
  next: (value) => console.log("next:", value),
});

// equals to

of(1, 2).subscribe({
  next: (value) => console.log("next:", value),
});
```

**redux action**

```ts
const mountAction = { type: "mount" };
const fetchAction = { type: "fetch" };
const observable = of(mountAction, fetchAction).pipe(/* */);
```

**from**: can convert an promise to an observable
**fromEvent**
...

## Source code: Observable

Tip: we cannot go over all the source code in this session and I will pick the important parts and skip the complex conditions and unhappy routes

### new Observable

So what exactly happened when we construct a `Observable`?
Inside the `new Observable`

```ts
export class Observable<T> implements Subscribable<T> {
  // Observable.ts
  /**
   * @constructor
   * @param {Function} subscribe the function that is called when the Observable is
   * initially subscribed to. This function is given a Subscriber, to which new values
   * can be `next`ed, or an `error` method can be called to raise an error, or
   * `complete` can be called to notify of a successful completion.
   */
  constructor(
    subscribe?: (
      this: Observable<T>,
      subscriber: Subscriber<T>
    ) => TeardownLogic
  ) {
    if (subscribe) {
      this._subscribe = subscribe;
    }
  }
}

// Code
(subscriber) => subscriber.next(ingredients);
```

The initialization is easy

```ts
this._subscribe = subscribe;
```

Then the following is the `pipe`

```ts
.pipe(
    // Chef Mike
    pluck("data"),
    //  Chef John
    map((items) =>
      items.filter((item) => ["vegetable", "bread", "meat"].includes(item.type))
    )
    // ...
)
```

### Observable interface

The `Observable` **implements** `Subscribable` interface

```ts
// Observable.ts
class Observable<T> implements Subscribable<T> {
  /* */
}

// types.ts
export interface Subscribable<T> {
  subscribe(observer: Partial<Observer<T>>): Unsubscribable;
}

export interface Unsubscribable {
  unsubscribe(): void;
}
```

What is `Observer` interface?

```ts
export interface Observer<T> {
  next: (value: T) => void;
  error: (err: any) => void;
  complete: () => void;
}
```

observer has three abilities `next` `error` `complete`

Additionally, I have to mention that

```ts
export class Subscriber<T> extends Subscription implements Observer<T> {}
```

So for now you can take `subscriber` is `observer`

### Subscribe - observable.subscribe

**Example**
Subscribe with an observer - A waiter

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

```ts
// Observable.ts
subscribe(
    observerOrNext?: Partial<Observer<T>> | ((value: T) => void) | null,
    error?: ((error: any) => void) | null,
    complete?: (() => void) | null
  ): Subscription {
    const subscriber = isSubscriber(observerOrNext) ? observerOrNext : new SafeSubscriber(observerOrNext, error, complete);
    // ...
  }

```

we often give the a function to `observable.subscribe(()=>{})` , no a real subscriber(observer) object.

```ts
let sum = 0;
const subscriber = of(1, 2, 3).subscribe((value) => {
  console.log("Adding: " + value);
  sum = sum + value;
});
```

calling `observable.subscribe((data) => console.log(data))` will call another class `new SafeSubscriber`

SafeSubscriber is wrapping the functions(in the above example,it's the 'next' function) you provided to become a subscriber,

```ts
// Subscriber.ts
export class SafeSubscriber<T> extends Subscriber<T> {
  // ...
}
```

SO in the end, it's still a `Subscriber`

```ts
const observable = {
  subscribe(
    observerOrNext?: Partial<Observer<T>> | ((value: T) => void) | null,
    error?: ((error: any) => void) | null,
    complete?: (() => void) | null
  ): Subscription {
    const subscriber = isSubscriber(observerOrNext)
      ? observerOrNext
      : new SafeSubscriber(observerOrNext, error, complete);

    // We just talked the aboves

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

    return subscriber;
  },
};
```

Here we just care about `observable._trySubscribe()`

```ts
protected _trySubscribe(sink: Subscriber<T>): TeardownLogic {
 try {
   return this._subscribe(sink);
 } catch (err) {
   // ...
 }
}
```

`return subscriber.add(this._trySubscribe(subscriber));`

```ts
export class Subscriber<T> extends Subscription implements Observer<T> {
  constructor(destination?: Subscriber<any> | Observer<any>) {
    super();
    if (destination) {
      this.destination = destination;
      // Automatically chain subscriptions together here.
      // if destination is a Subscription, then it is a Subscriber.
      if (isSubscription(destination)) {
        destination.add(this);
      }
    } else {
      this.destination = EMPTY_OBSERVER;
    }
  }
}
```

### Pipe

```ts
// Observable.ts
pipe(...operations: OperatorFunction<any, any>[]): Observable<any> {
  return pipeFromArray(operations)(this);
}

/**
 * pipe() can be called on one or more functions, each of which can take one argument ("UnaryFunction")
 * and uses it to return a value.
 * It returns a function that takes one argument, passes it to the first UnaryFunction, and then
 * passes the result to the next one, passes that result to the next one, and so on.
 */
export function pipe(...fns: Array<UnaryFunction<any, any>>): UnaryFunction<any, any> {
  return pipeFromArray(fns);
}

/** @internal */
export function pipeFromArray<T, R>(fns: Array<UnaryFunction<T, R>>): UnaryFunction<T, R> {
  if (fns.length === 0) {
    return identity as UnaryFunction<any, any>;
  }

  if (fns.length === 1) {
    return fns[0];
  }

  //   if (fns.length >= 1)
  return function piped(input: T): R {
    return fns.reduce((prev: any, fn: UnaryFunction<T, R>) => fn(prev), input as any);
  };
}

/**
 * @param x Any value that is returned by this function
 * @returns The value passed as the first parameter to this function
 * This is useful in some cases when using things like `mergeMap`
 */
export function identity<T>(x: T): T {
  return x;
}

```

1. The pipe's assign take 9 generic types maximum
2. Reduce one by one, prev function result=>next function param
3. Returns an observable in the end, so the result has `subscribe` method

### Subscription(briefly)

```ts
/**
 * Represents a disposable resource, such as the execution of an Observable. A
 * Subscription has one important method, `unsubscribe`, that takes no argument
 * and just disposes the resource held by the subscription.
 *
 * Additionally, subscriptions may be grouped together through the `add()`
 * method, which will attach a child Subscription to the current Subscription.
 * When a Subscription is unsubscribed, all its children (and its grandchildren)
 * will be unsubscribed as well.
 *
 * @class Subscription
 */
export declare class Subscription implements SubscriptionLike {
  closed: boolean;
  constructor(initialTeardown?: (() => void) | undefined);
  add(teardown: TeardownLogic): void;
  remove(teardown: Exclude<TeardownLogic, void>): void;
  unsubscribe(): void;
  static EMPTY: Subscription;

  /**
   * Adds a finalizer to this subscription, so that finalization will be unsubscribed/called
   * when this subscription is unsubscribed. If this subscription is already {@link #closed},
   * because it has already been unsubscribed, then whatever finalizer is passed to it
   * will automatically be executed (unless the finalizer itself is also a closed subscription).
   *
   * Closed Subscriptions cannot be added as finalizers to any subscription. Adding a closed
   * subscription to a any subscription will result in no operation. (A noop).
   *
   * Adding a subscription to itself, or adding `null` or `undefined` will not perform any
   * operation at all. (A noop).
   *
   * `Subscription` instances that are added to this instance will automatically remove themselves
   * if they are unsubscribed. Functions and {@link Unsubscribable} objects that you wish to remove
   * will need to be removed manually with {@link #remove}
   *
   * @param teardown The finalization logic to add to this subscription.
   */
  add(teardown: TeardownLogic): void {
    // Only add the finalizer if it's not undefined
    // and don't add a subscription to itself.
    if (teardown && teardown !== this) {
      if (this.closed) {
        // If this subscription is already closed,
        // execute whatever finalizer is handed to it automatically.
        execFinalizer(teardown);
      } else {
        if (teardown instanceof Subscription) {
          // We don't add closed subscriptions, and we don't add the same subscription
          // twice. Subscription unsubscribe is idempotent.
          if (teardown.closed || teardown._hasParent(this)) {
            return;
          }
          teardown._addParent(this);
        }
        (this._finalizers = this._finalizers ?? []).push(teardown);
      }
    }
  }
```

```ts
export declare type TeardownLogic =
  | Subscription
  | Unsubscribable
  | (() => void)
  | void;
```

In the previous example, we input the function

```ts
(value) => {
  console.log("Adding: " + value);
  sum = sum + value;
};
```

when we initialize the `new Observable`

```ts
// subscriber.ts
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

```ts
// convert all the complex route/conditions above, we can simply treat the subscriber like
subscriber.add(this._trySubscribe(subscriber));
```

**unsubscribe**

unsubscribe is for closing the subscription, it calls teardown function and do the clean ups

Similar to `React.useEffect` the return function

initialTeardown will be called inside of unsubscribe,
but user won't care about this, it is mostly used internally

```ts
// Subscription.ts
/**
 * Disposes the resources held by the subscription. May, for instance, cancel
 * an ongoing Observable execution or cancel any other type of work that
 * started when the Subscription was created.
 * @return {void}
 */
unsubscribe(): void {
  if (!this.closed) {
    this.closed = true;

    // ...

    const { initialTeardown: initialFinalizer } = this;
    if (isFunction(initialFinalizer)) {
      // ...
    }

    // ...
  }
}

```

```ts
const subscription = new Subscription(() =>
  console.log("call initialTeardown when unsubscribe")
);
const observable = new Observable<number>((subscribe) => {
  subscribe.next(1);
  return subscription;
});
const subscription1 = observable.subscribe((value) => console.log(value));
subscription1.unsubscribe();
// 1
// call initialTeardown when unsubscribe
```

## Summary

Observable is are the key concepts of the rxjs, the "reactive" part, it's really implementing in the Observer and function programming pattern.
BTW I have to say that the source code is great, quite easy to read, and there even bring along with examples in the comments

## Next?

Subject and Operators Full tour on Subscription chain
