---
slug: 20210111
title: Hidden effect dependency
author: Yao
author_title: senior developer
author_url: https://github.com/caperso
author_image_url: https://avatars.githubusercontent.com/u/34877623?s=400&u=8da3f1b8199cdbd5591ea229149fa663f2011065&v=4
tags: [react, react-hooks]
---

自定义 hook 时的一大坑

## 问题源码

一个自定义 hook, 导致无限重复渲染

刚开始以为是这个 hook 的问题

```tsx
const [totalDistance, , , , fliedRate] = useDistance({
  wps: currentTask!.wayPointGroups.map((wpg) => wpg.points).flat(),
  completed: fliedSum,
});
```

<!--truncate-->

```tsx
/**
 * 计算总距离, 预计到达时间
 * @param {WayPoint[]} wpgs
 * @param {number} [completed] 当前已飞总数
 * @returns totalDistance, eta, currentDistance, remainDistance, fliedRate
 */
export const useDistance = (props: { wps: WayPoint[]; completed?: number }) => {
  const { hangar } = plantStore;
  const { wps, completed } = props;

  const [waypoints, setWaypoints] = useState<WayPoint[]>([]);
  const [totalPoints, setTotalPoints] = useState<WayPoint[]>([]);
  const [totalDistance, setTotalDistance] = useState("0");
  const [currentDistance, setCurrentDistance] = useState("0");
  const [remainDistance, setRemainDistance] = useState("0");
  const [fliedRate, setFliedRate] = useState("0%");
  const [eta, setEta] = useState("0");

  useEffect(() => {
    if (wps.length) {
      try {
        // 扁平所有wp点,头尾增加机库点
        const endPoint: WayPoint = getHangarWp(hangar);
        setTotalPoints([endPoint, ...wps, endPoint]);
        setWaypoints(wps);
      } catch (e) {
        console.error("[距离计算出错]", e);
      }
    }
  }, [wps, hangar]);

  useEffect(() => {
    if (totalPoints.length) {
      const totalDistance = calcTotalDistance(totalPoints);
      const eta = totalDistance / DRONE_ESTIMATE_SPEED;
      let distDone = 0;
      if (completed && completed <= totalPoints.length) {
        distDone = calcTotalDistance(totalPoints.slice(0, completed));
      }

      // 完成比
      if (completed) {
        const rate = completed / waypoints.length;
        setFliedRate(`${(rate * 100).toFixed(2)} %`);
      }

      setTotalDistance(`${(totalDistance / 1000).toFixed(2)}km`);
      setEta(`${Math.floor(eta / 60)} 分钟 ${Math.floor(eta % 60)} 秒`);
      setCurrentDistance(`${(distDone / 1000).toFixed(2)}km`);
      setRemainDistance(`${((totalDistance - distDone) / 1000).toFixed(2)}km`);
    }
  }, [totalPoints, completed, waypoints.length]);

  return [
    totalDistance,
    eta,
    currentDistance,
    remainDistance,
    fliedRate,
  ] as const;
};
```

1. 以下称 effect-dependencies 为 ed.
2. 检查了若干遍 并没有存在以下错误依赖

   `This can happen when a component calls setState inside useEffect, but useEffect either doesn't have a dependency array, or one of the dependencies changes on every render.`

   - useEffect 涵括到了所有的 ed
   - 问题可能出现在某个 ed 在每个 render 中 change.

3. 一番查找,找到问题所在
   - 一直以来, effect 编写依赖很大程度依靠了 eslint,在提示中补充好.
   - 但是如若 ed 来自于 props,ed 也正确填写,eslint 将不再检查.
   - 这很有可能导致上述问题

4.解释

- hooks 没有错
- 调用者错了

  ```tsx
  const [totalDistance, , , , fliedRate] = useDistance({
    wps: currentTask!.wayPointGroups.map((wpg) => wpg.points).flat(),
    completed: fliedSum,
  });
  ```

  关键语句

  - effect 中存在 states
  - 使用该 hook 可理解为在组件内展开整个 hook.
  - setState 时,该组件刷新,生成新的 wps(申明新的内存区域)
    `wps: currentTask!.wayPointGroups.map((wpg) => wpg.points).flat(),`

  ```tsx
  wps: currentTask!.wayPointGroups.map((wpg) => wpg.points).flat();
  ```

  - 于是 `hook得到了新的props=>hook认为wps为新的=>hook 被重新调用=>重新setState=>hook再次得到新的props=>循环`

1. 预防

   ed 若来自 props,一定要确保外部传入的值不变(唯一内存地址).
