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

but inside the house the curtial part is serving.

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
- A customer can give multiple bags of Ingredients(Obserable can emits multiple dataF)
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

https://codesandbox.io/s/damp-shape-2rqz7j?file=/src/index.js

**of**: convert an instance to an observable

```javascript
const instance = { name: "bird" };
```

**from**: convert an promise to an observable

```javascript

```

**action**

```javascript
const fetchAction = { type: "fetch" };
const observable = of(fetchAction);

```


sourceCode

switchMap and mergeMap
