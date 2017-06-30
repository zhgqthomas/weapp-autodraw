在不久前结束的 Google I/O 大会上，Google 宣传公司将从以 "Mobile-first" 过渡到以 "AI-first" 为主旨的产品研发。并且在大会中还介绍了由 Google 实验室团队开发的一款基于机器学习的 [Auto Draw](https://aiexperiments.withgoogle.com/autodraw) 工具。该工具是基于用户的涂鸦经过机器学习处理后，推断出用户想要画的图像，是一款很好玩并且很使用的工具。只不过基于国内的网络环境是无法访问直接访问 Auto Draw 的网站的，必须借助于“梯子”才可以访问到。为了可以让国内更多的用户可以感受一下，Google 基于机器学习开发的 [Auto Draw](https://aiexperiments.withgoogle.com/autodraw)。故有了将其移植到小程序上的想法。下面将会详细的讲解，我是如何将 Google Auto Draw 移植到小程序上的。

### 了解微信小程序
既然是要把 Auto Draw 移植到小程序上，那首要任务就是要了解[小程序开发平台](https://mp.weixin.qq.com/)及相关的[开发文档](https://mp.weixin.qq.com/debug/wxadoc/dev/)。在这里推荐一个[小程序的官方 Demo](https://github.com/Hao-Wu/WeApp-Demo),此 Demo 详细的讲解了微信小程序中各组件的使用方法，结合着开发文档再对照着此 Demo，就很容易掌握小程序整体的开发流程。

微信小程序有专门的[官方开发工具](https://mp.weixin.qq.com/debug/wxadoc/dev/devtools/download.html)，使用开发工具建立项目会就可以基于生成的模板进行相应的业务逻辑开发。

### 文件结构
小程序包含一个描述整体程序的 app 和多个描述各自页面的 page。一个小程序主体部分由三个文件组成，必须放在项目的根目录，如下：

文件 | 必填 | 作用 
:---: | :---: | :---:
[app.js](https://mp.weixin.qq.com/debug/wxadoc/dev/framework/app-service/app.html) | 是 | 小程序逻辑 
[app.json](https://mp.weixin.qq.com/debug/wxadoc/dev/framework/config.html) | 是 | 小程序公共设置
[app.wxss](https://mp.weixin.qq.com/debug/wxadoc/dev/framework/view/wxss.html) | 否 | 小程序公共样式表

一个小程序页面由四个文件组成，分别是：

文件 | 必填 | 作用 
:---: | :---: | :---:
[js](https://mp.weixin.qq.com/debug/wxadoc/dev/framework/app-service/page.html) | 是 | 页面逻辑
[wxml](https://mp.weixin.qq.com/debug/wxadoc/dev/framework/view/wxml/) | 是 | 页面结构
[wxss](https://mp.weixin.qq.com/debug/wxadoc/dev/framework/view/wxss.html) | 否 | 页面样式表
[json](https://mp.weixin.qq.com/debug/wxadoc/dev/framework/config.html) | 否 | 页面配置

因为本人之前一直从事的是 Android 开发，看到小程序的文件结构的时候，将其与 Android 的文件结构进行了对比，发现这两者的文件结构其实是很相似的。

熟悉 Android 开发的应该也能看得出来， `app.js` 类似于 Android 中的 `Application`，是一个默认启动的全局变量。`app.json` 则可以看作是 `AndroidManifest` 一些跟页面相关的配置需要在这里进行配置。而 `app.wxss` 可以看作是 Android Resource 中的 `style`，通用组件的属性可以放在这里。 

小程序的页面文件组成中，`js` 可以看作 Android 中的 `Activity` 用于处理页面逻辑。`wxml` 则相当于 `layout` 用于对页面进行布局。`wxss` 同样可以看作是 `style` 只不过其作用范围只限于此页面。`json` 可以看作是 `AndroidManifest` 中的 `<activty></activty>` 标签，关于此页面的一些属性在这里进行配置。

不知道这样的解释是否可以让熟悉 Android 开发的小伙伴们，对理解小程序的文件结构更容易一些。

### 调试 Google Auto Draw
在使用 Google [Auto Draw](https://www.autodraw.com/) 时, 就考虑既然是会将用户的涂鸦交由机器学习进行学习，那应该是通过调用 API 接口来实现的。通过使用 Chrome 的 `Inspect` 调试后，然后果然如猜测的一样找到了请求的 API，如下图所示

![](https://user-gold-cdn.xitu.io/2017/6/30/32b9050bda30c0b6cb35dbaedf561198)

可以看到当用户在画板上结束绘画之后，就会向 **`https://inputtools.google.com/request?ime=handwriting&app=autodraw&dbg=1&cs=1&oe=UTF-8`** 发送一个 `POST` 请求，并将用户在画板上绘制的座标，即上图 `Request Payload` 部分通过 `application/json` 的方式传递给后台服务器，然后后台服务器经过机器学习的处理后，将预测的结构返回回来，如下图所示

![](https://user-gold-cdn.xitu.io/2017/6/30/036a8aac482e7e628276c368f7daf91d)

通过返回的 `Response` 可以明白，Auto Draw 将用户涂鸦后的图像经过机器学习处理后，是转化为了图像可能所对应的英语单词，而不是直接画出推测的图像。这不禁让我联想到了 Google 实验室更早些的时候推出的 [Quick Draw](https://aiexperiments.withgoogle.com/quick-draw), 就是根据用户的涂鸦，机器学习以英语单词的形式来推算你画的是什么。我接着对 `Quick Draw` 用相同的方法进行了调试，果然后台调用的 API 是一模一样的。原来 `Auto Draw` 是基于 `Quick Draw` 进行的开发。

已经知道了机器学习是先将用户的涂鸦转化为推测的英语单词，那么接下来的问题则需要搞清楚 `Auto Draw` 是如何将这些英语单词转变成图像的。

继续调试不难发现，Auto Draw 在第一次加载的时候还会调用一个 `GET` 的请求，如下图所示

![](https://user-gold-cdn.xitu.io/2017/6/30/ef09f5e889dec7ab7ddc200d95def8ad)

`Auto Draw` 在第一次加载的时候会发送向 **`https://www.autodraw.com/assets/stencils.json`** 发送一个 `GET` 请求。那这个请求又返回了什么呢? 

![](https://user-gold-cdn.xitu.io/2017/6/30/1e6e0c2c06ce04cd482f538670cecbcb)

啊哈！查看请求的 `Response` 的就会发现这是一个英语单词及单词所对应存放在 `Google storage` 上图像的 `JSON` 集合。原来 `Auto Draw` 是通过这个 `JSON` 集合，实现了英语单词到图像的转化。通过调试，`Auto Draw` 整体的一个核心 API 调用流程就很清楚了。

![](https://user-gold-cdn.xitu.io/2017/6/30/6f62492c0e32b9c6c221d800eaf8e205)

以上就是根据调试，得到的 `Auto Draw` 的时序图。

### 开发中的坑
通过上面的调试已经摸清楚了 `Auto Draw` 的调用流程。那下面就可以进入到实战的开发阶段了。但是没想到高兴的太早了，实际在开发当中遇到了很多的坑，下面就来讲讲遇到了哪些坑，又是如何把坑给填平的。

#### 小程序开发文档简陋
目前微信小程序的开发文档还是过于的简陋，好多在实际开发中很重要的点，文档都没有涉及到。

例如，在 [`SKetch`](https://www.sketchapp.com/) 里要给小程序做设计的时候，应该基于什么样的分辨率的画板下，文档中并没有很好的涉及到。

还有我在开发当中想自定义 `button` 的边框，于是在 `WXSS` 当中为 `button` 添加了如下的属性

```css
border:1px solid rgba(0, 0, 0, 0.2);
```
但实际效果会边框出现两条线，自定义的边框只是在默认边框上进行了绘制，默认边框并没有消失，很是难看，`button` 的自定义问题在开发文档中一点都没有提及到。

> 幸亏腾讯前端工程师在知乎上的[《有用！关于微信小程序，那些开发文档没有告诉你的》](https://zhuanlan.zhihu.com/p/23536784)这篇文章拯救了我。强烈推荐想开发小程序的小伙伴再看了开发文档之后，一定要阅读这篇文章。

微信小程序的坑还不止这些，但是相信随着微信团队的不断维护，微信小程序会越来越趋向成熟稳定。

#### 服务器域名
文中最开始已经提到了，想将 `Auto Draw` 移植到小程序，是因为国内访问 `Auto Draw` 会收到各种的限制。最初的想法是将小程序的网络请求先经过我在国外的 VPS，然后转发给 Google 的服务器，变相的绕过了拦截。可是在看了小程序的开发文档后，发现微信对小程序可以访问的网络请求拥有很严格的限制，**必须是 `HTTPS` 和备案过的域名才可以**。

支持 `HTTPS` 还好说现在有好多免费办法证书的机构，但是必须是备案过的域名确实难搞。备案需要准备相应文件和差不多一周的审核时间，而且我这还涉及到了访问 Google 的服务。看到微信小程序的这些限制后，让我一度有了这项目做不了的想法。

幸亏天无绝人之路，我突然想到之前开发手机 App 经常用到 BaaS 提供商 [LeanCloud](https://leancloud.cn/)。LeanCloud 不光有支持 `HTTPS` 和备案过的域名，而且它们还有一个云引擎服务。

> 云引擎是 LeanCloud 推出的服务端托管平台。提供了多种运行环境（Node.js, Python 等）来运行服务端程序。需要提供服务端的业务逻辑（网站或云函数等），而服务端的多实例负载均衡，不中断服务的平滑升级等都由云引擎提供支持。

简单的讲，你可以把你写的脚本或者后台程序放在 LeanCloud 提供的云平台。更重要的是 LeanCloud 有国内和美国两个节点，美国的节点可以畅通无阻的直接访问 Google 服务。这完全符合我的需求，简直就是量身定做。哈哈哈

在 LeanCloud 的开发文档中果然发现了支持微信小程序的[文档](https://leancloud.cn/docs/weapp.html)。文档比较详细，反正比微信小程序的官方文档是要好很多，哈哈。

根据开发文档我讲微信小程序的服务器域名配置如下

```txt
request合法域名

https://api.bmob.cn
https://api.leancloud.cn
https://app-router.leancloud.cn
https://router-g0-push.leancloud.cn
https://vcn64yge.api.lncld.net
https://vcn64yge.engine.lncld.net
https://us-api.leancloud.cn
https://router-a0-push.leancloud.cn
https://storage.googleapis.com
```

```txt
socket合法域名

wss://api.bmob.cn
wss://cn-n1-cell1.leancloud.cn
wss://cn-n1-cell2.leancloud.cn
wss://cn-n1-cell5.leancloud.cn
wss://cn-n1-cell7.leancloud.cn
```

```txt
uploadFile合法域名

https://api.bmob.cn
https://up.qbox.me
```

```txt
downloadFile合法域名

https://api.bmob.cn
https://dn-vCn64yGe.qbox.me
```

以上是 LeanCloud 国内和美国站点的服务器域名，因为微信对小程序修改服务器域名每个月有次数限制，故建议一次性都写进去，不管是否会用的着。

> 关于如何使用 LeanCloud 的云引擎，[官方文档](https://leancloud.cn/docs/leanengine_overview.html)已经介绍的很详细，这里就不再重复。关于 Auto Draw 小程序 LeanCloud 云引擎的脚本，可以在[这里查看](https://gist.github.com/zhgqthomas/d500c32f78859eddfa7f624f255368ba)。

解决了域名和 `HTTPS` 的问题，剩下的就是愉快写代码了~

### 开源相关
- [Auto Draw 小程序代码](https://github.com/zhgqthomas/weapp-autodraw)
- [LeanCloud 云引擎脚本](https://gist.github.com/zhgqthomas/d500c32f78859eddfa7f624f255368ba)

### 参考
- [Google Auto Draw](https://www.autodraw.com/)
- [关于微信小程序，那些开发文档没有告诉你的](https://zhuanlan.zhihu.com/p/23536784)
- [微信小程序开发资源汇总](http://www.ctolib.com/javascript/categories/javascript-wechat-weapp.html)
- [小程序官方 Demo](https://github.com/Hao-Wu/WeApp-Demo)

### 小程序二维码
最后附上 Auto Draw 移植到小程序上的二维码，感兴趣的小伙伴可以扫描玩玩~

![](https://user-gold-cdn.xitu.io/2017/6/30/227e1515f8ab45ca9b394780c589f382)
