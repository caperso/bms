---
slug: 20210120
title: 20210120-rtmp or http-flv(ws-flv)
author: Yao
author_title: fe
author_url: https://github.com/caperso
# author_image_url:
tags: [md, fe, daily]
---

# 20210120-rtmp or http-flv(ws-flv)

## http-flv

> [直播未来属于 RTMP 还是 HTTP？](https://www.cnblogs.com/tinywan/p/6122065.html)

实际上就是利用的 flv 文件的特点，
只需要一个 matedata 和音视频各自 header，
后面的音视频数据就可以随意按照时间戳传输，
当然视频得按照 gop 段来传输，
这种直播数据实际上就是一个无限大的 http 传输的 flv 文件，视频地址类似：

<http://mywebsite.com/live.flv>，
客户端利用 flv 特性，可以一边接受数据边解码播放。

**问题**:
1.flv 文件格式大体怎样?
2.header 字段内容?
3.h264编码的flv content 是否和其他流内容一样

## rtmp 和 http-flv 延迟

：这两种协议大致数据一致，所以延时原因都是差不多的。

按理说 tcp 流式传输直播因该都是延时极低的，为什么 rtmp 和 http-flv 还有延时呢？

原因在 h264 上，rtmp 和 http-flv 都是传输的 flv tag，视频 tag 的数据平常就是 h264 数据，h264 解码有个 IBP

I 是关键帧，是一帧完整的图像，必须要先有个 I 才能解码后面的 BP，BP 帧可以随便少，但是 I 帧不能少，所以 I 帧必须是在 flv tag 传输中第二个传输的，

但是 I 帧在 h264 流里不是常有的，是隔一段才有个 I 帧，这个一段的间隔，俗称 GOP :group of pics

当编码时候 GOP 设置很短，当客户端连接上来，服务器会以最快速度找到流中最近 I 帧，从 I 帧开始发送直播数据.

然而当 GOP 很长，I 帧间隔很长，或者等待下一个 I 帧开始向新连接发送数据，或者在缓存里找最近的上一个 I 帧开始发送.

这里就是 rtmp 和 hls 协议延时的关键了.

在各大 cdn 平台，叫“rtmp 秒开技术”，原理就是将推流数据二次解编码，设置很小的 gop。

总的来说，gop 设置 1s，在不考虑网络传输链路延时情况，数据延时最大就为 1s，运气好刚好就是 I 帧就是 0 延时
