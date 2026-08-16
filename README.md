# 开拍鱼小程序（auctionFish）项目文档

> 版本：1.0 | 更新日期：2026-07-26 | AppID：wx80284d8c1ba6124d

---

## 目录

1. [项目概述](#1-项目概述)
2. [技术栈](#2-技术栈)
3. [项目结构](#3-项目结构)
4. [页面路由与功能说明](#4-页面路由与功能说明)
5. [核心架构设计](#5-核心架构设计)
6. [自定义组件库](#6-自定义组件库)
7. [API 接口清单](#7-api-接口清单)
8. [国际化（i18n）](#8-国际化i18n)
9. [开发指南](#9-开发指南)
10. [部署与发布](#10-部署与发布)
11. [代码重构记录](#11-代码重构记录)
12. [已知问题与后续规划](#12-已知问题与后续规划)

---

## 1. 项目概述

### 1.1 产品简介

**开拍鱼（openXbid）** 是一个面向全球海鲜水产行业的 B2B 交易撮合微信小程序。平台连接海鲜供应商（厂家/贸易商）与采购方，提供商品发布、在线报价/议价、商家认证、资讯社区等核心功能。

### 1.2 核心业务功能

| 功能模块 | 说明 |
|---------|------|
| **商品发布** | 支持出售商品和求购信息两种发布类型，含图片上传、规格填写、有效期设置 |
| **报价/议价** | 买家对商品发起报价，卖家可查看报价列表并进行议价交互 |
| **商家认证** | 支持企业营业执照认证和个人身份证认证两种方式 |
| **商铺管理** | 商家可创建商铺、设置商铺信息、管理联系方式、上传资质 |
| **资讯社区** | 发布动态/文章，支持评论、点赞、分享，类似朋友圈功能 |
| **消息系统** | 系统通知、议价消息、商家咨询、关注提醒等多类消息 |
| **服务资质** | 清关服务、融资服务、代采服务、冷库物流等增值服务认证 |
| **海报分享** | 商品详情页自动生成包含商品信息和小程序码的分享海报 |

### 1.3 目标用户

- 海鲜水产生产厂家
- 海鲜贸易商
- 海鲜采购方 / 餐饮企业
- 冷链物流服务商

### 1.4 平台定位

全球海鲜水产行业的在线竞价交易平台，帮助买卖双方高效对接、降低交易成本。

---

## 2. 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| **开发框架** | 微信小程序原生开发 | 基础库 3.4.7 |
| **UI 组件库** | TDesign MiniProgram | ^1.5.0 |
| **项目模板** | tdesign-miniprogram-starter-retail | 1.0.0 |
| **日期处理** | dayjs | ^1.9.3 |
| **构建工具** | 微信开发者工具内置 | - |
| **代码规范** | ESLint + Prettier | ESLint ^6.8.0 / Prettier ^2.1.2 |
| **Git 规范** | commitlint + husky + commitizen | Angular 规范 |
| **渲染引擎** | WebView（未启用 Skyline） | - |
| **分包加载** | lazyCodeLoading: requiredComponents | - |

### 后端服务

| 服务 | 地址 |
|------|------|
| API 服务 | `https://kpy.phanlink.com/v1` |
| CDN / 图片服务 | `https://imgs.phanlink.com/program` |
| 二维码生成 | `https://kpy.phanlink.com/generate_qrcode.php` |

---

## 3. 项目结构

```
auctionFish/
├── app.js                          # 应用入口，初始化语言和 auth
├── app.json                        # 全局配置（页面路由、tabBar、窗口）
├── app.wxss                        # 全局样式
├── sitemap.json                    # 搜索索引配置
├── project.config.json             # 开发者工具项目配置
├── package.json                    # npm 依赖管理
├── .eslintrc.js                    # ESLint 配置
├── commitlint.config.js            # Git 提交规范配置
│
├── custom-tab-bar/                 # 自定义底部导航栏
│   ├── index.js                    #   组件逻辑（tab 切换、消息角标）
│   ├── index.wxml                  #   组件模板
│   ├── index.wxss                  #   组件样式
│   ├── index.json                  #   组件配置
│   └── data.js                     #   tab 数据源（5 个 tab 配置）
│
├── common/                         # 公共模块
│   ├── lang.js                     #   国际化语言包（中/英双语）
│   └── updateManager.js            #   小程序版本更新管理
│
├── config/                         # 配置文件
│   ├── index.js                    #   主配置（re-export areaData）
│   ├── area.js                     #   行政区划数据（20,429 行）
│   └── eslintCheck.js              #   ESLint 检查脚本
│
├── utils/                          # 工具函数
│   ├── config.js                   #   全局配置收敛（域名/环境/超时）
│   ├── request.js                  #   统一网络请求层
│   ├── util.js                     #   通用工具（格式化/验证等）
│   └── mock.js                     #   Mock 数据
│
├── services/                       # 业务服务层
│   └── auth.js                     #   认证服务（Token 生命周期管理）
│
├── components/                     # 自定义组件库（24 个组件）
│   ├── goods-card/                 #   商品卡片
│   ├── goods-list/                 #   商品列表
│   ├── good-list/                  #   商品列表（简版）
│   ├── goods-category/             #   商品分类选择器
│   ├── store-list/                 #   店铺列表
│   ├── fwstore-list/               #   服务店铺列表
│   ├── bidding-popup/              #   议价弹窗
│   ├── bidding-list/               #   议价列表
│   ├── collection-list/            #   收藏列表
│   ├── collection-art-list/        #   资讯收藏列表
│   ├── attention-list/             #   关注列表
│   ├── order-pj-list/              #   评价列表
│   ├── dt-list/                    #   动态列表
│   ├── filter/                     #   筛选器
│   ├── filter-popup/               #   筛选弹窗
│   ├── price/                      #   价格展示
│   ├── loading-content/            #   加载骨架屏
│   ├── load-more/                  #   加载更多
│   ├── swipeout/                   #   滑动删除
│   └── webp-image/                 #   WebP 图片适配
│
├── pages/                          # 页面目录
│   ├── tabbar/                     #   主包页面（TabBar 页面）
│   ├── goods/                      #   商品子包
│   ├── my/                         #   个人中心子包
│   ├── news/                       #   资讯/消息子包
│   └── store/                      #   店铺子包
│
└── node_modules/                   # 依赖包
    ├── tdesign-miniprogram/        #   TDesign 组件库
    ├── dayjs/                      #   日期处理
    └── tslib/                      #   TypeScript 运行时
```

### 分包策略

| 包 | 路径 | 页面数 | 说明 |
|----|------|--------|------|
| **主包** | `pages/tabbar/` | 6 | TabBar 页面，必须放主包 |
| **商品子包** | `pages/goods/` | 7 | 商品详情、发布、评价、管理 |
| **个人中心子包** | `pages/my/` | 18 | 个人信息、认证、收藏、粉丝等 |
| **资讯子包** | `pages/news/` | 9 | 资讯发布、消息中心、聊天 |
| **店铺子包** | `pages/store/` | 8 | 店铺管理、认证、名片等 |

---

## 4. 页面路由与功能说明

### 4.1 主包页面（TabBar）

| 路由 | 功能 | 说明 |
|------|------|------|
| `pages/tabbar/home/home` | 首页 | 轮播图、商品列表、搜索、国家/分类筛选、推荐/最新排序 |
| `pages/tabbar/serve/index` | 分类 | 按议价中/报价中/关注商家/收藏商品分类浏览，支持滑动删除 |
| `pages/tabbar/publish/index` | 发布 | 发布入口页，选择发布产品/求购/资讯/动态 |
| `pages/tabbar/message/index` | 消息 | 消息中心，4 个 tab：商家社区/供需看板/市场资讯/政府法规 |
| `pages/tabbar/my/index` | 我的 | 个人中心，用户信息、常用功能入口、商家管理入口 |
| `pages/tabbar/login/login` | 登录 | 微信授权登录 + 手机号/邮箱验证码登录 |

### 4.2 商品子包（pages/goods）

| 路由 | 功能 | 说明 |
|------|------|------|
| `pages/goods/pages/index/index` | 商品详情 | 商品信息、报价列表、议价弹窗、收藏、分享海报生成 |
| `pages/goods/pages/offer/index` | 报价列表 | 查看某商品的所有报价记录及详情 |
| `pages/goods/pages/add/index` | 添加商品 | 发布出售/求购商品，含规格、图片、有效期 |
| `pages/goods/pages/info/index` | 商品信息 | 商品补充信息编辑 |
| `pages/goods/pages/review/index` | 商品评价 | 查看商品评价列表 |
| `pages/goods/pages/list/index` | 商品列表 | 商品搜索结果/分类列表 |
| `pages/goods/pages/manage/index` | 商品管理 | 管理已发布商品 |

### 4.3 个人中心子包（pages/my）

| 路由 | 功能 |
|------|------|
| `pages/my/pages/info/index` | 个人信息编辑（头像、昵称等） |
| `pages/my/pages/approve/index` | 认证类型选择（企业/个人） |
| `pages/my/pages/approve/auhor/index` | 认证信息填写与提交 |
| `pages/my/pages/bid/index` | 我的议价管理 |
| `pages/my/pages/collect/index` | 我的收藏 |
| `pages/my/pages/fans/index` | 我的粉丝 |
| `pages/my/pages/follow/index` | 我的关注 |
| `pages/my/pages/feedback/index` | 意见反馈 |
| `pages/my/pages/publish/index` | 我的发布 |
| `pages/my/pages/review/index` | 评价管理 |
| `pages/my/pages/review/info/index` | 评价详情 |
| `pages/my/pages/system/index` | 系统设置 |
| `pages/my/pages/about/index` | 关于平台 |
| `pages/my/pages/mobile/index` | 手机号修改 |
| `pages/my/pages/mail/index` | 邮箱修改 |
| `pages/my/pages/service/rate/index` | 费率服务 |
| `pages/my/pages/service/tariff/index` | 关税查询 |
| `pages/my/pages/service/import/index` | 导入服务 |
| `pages/my/pages/service/synergy/index` | 协同服务 |

### 4.4 资讯子包（pages/news）

| 路由 | 功能 |
|------|------|
| `pages/news/pages/dt/index` | 动态详情 |
| `pages/news/pages/dtadd/index` | 发布动态 |
| `pages/news/pages/art/index` | 文章详情 |
| `pages/news/pages/artadd/index` | 发布文章 |
| `pages/news/pages/message/chat/index` | 在线聊天 |
| `pages/news/pages/message/info/index` | 系统消息 |
| `pages/news/pages/message/result/index` | 议价结果消息 |
| `pages/news/pages/message/goods/index` | 商品消息 |
| `pages/news/pages/message/gz/index` | 关注消息 |

### 4.5 店铺子包（pages/store）

| 路由 | 功能 |
|------|------|
| `pages/store/pages/index/index` | 店铺首页 |
| `pages/store/pages/list/index` | 店铺列表 |
| `pages/store/pages/info/index` | 店铺信息 |
| `pages/store/pages/card/index` | 商家名片 |
| `pages/store/pages/lxadd/index` | 添加联系方式 |
| `pages/store/pages/pj/index` | 店铺评价 |
| `pages/store/pages/dc/index` | 店铺认证 |
| `pages/store/pages/dc/auth/index` | 认证授权 |

---

## 5. 核心架构设计

### 5.1 整体架构

```
┌─────────────────────────────────────────────────────┐
│                    页面层 (Pages)                     │
│  tabbar/  goods/  my/  news/  store/                 │
├─────────────────────────────────────────────────────┤
│                  自定义组件层 (Components)              │
│  goods-card  bidding-popup  filter  dt-list  ...     │
├─────────────────────────────────────────────────────┤
│                    服务层 (Services)                   │
│  auth.js — Token 管理 / 登录态 / requireLogin()       │
├─────────────────────────────────────────────────────┤
│                   基础设施层 (Utils)                    │
│  request.js — 统一请求  config.js — 配置  util.js     │
├─────────────────────────────────────────────────────┤
│                   公共模块 (Common)                    │
│  lang.js — 国际化    updateManager.js — 版本更新       │
├─────────────────────────────────────────────────────┤
│              微信小程序原生 API (wx.*)                  │
└─────────────────────────────────────────────────────┘
```

### 5.2 配置层 — `utils/config.js`

统一管理所有环境域名、CDN 地址和超时设置，替代原代码中 100+ 处硬编码 URL。

```javascript
// 环境切换只需改这一个变量
const APP_ENV = 'production'; // 'development' | 'staging' | 'production'

// 导出常量
module.exports = {
  ENV: APP_ENV,
  API_BASE: 'https://kpy.phanlink.com/v1',     // API 基础路径
  API_HOST: 'https://kpy.phanlink.com',          // API 主机（非 /v1 接口）
  CDN_BASE: 'https://imgs.phanlink.com/program', // CDN 基础路径
  CDN_HOST: 'https://imgs.phanlink.com',         // CDN 主机
  REQUEST_TIMEOUT: 15000,                        // 请求超时 15s
  UPLOAD_TIMEOUT: 60000,                         // 上传超时 60s
};
```

**使用方式：**
```javascript
const { API_BASE, API_HOST } = require('../../utils/config');
// wx.uploadFile url: `${API_BASE}/uploadImgs`
```

### 5.3 网络请求层 — `utils/request.js`

统一封装 `wx.request`，提供 `post()` / `get()` / `uploadFile()` 三个快捷方法。

#### 核心特性

| 特性 | 说明 |
|------|------|
| **Token 自动注入** | 从 `auth.getToken()` 获取，放入 `data.token` 字段（非 header），与后端协议一致 |
| **401 自动刷新** | 收到 401 后自动调用 `auth.refreshToken()` 刷新并重放请求（防并发刷新） |
| **统一错误处理** | `showError: true`（默认）自动 toast；`showError: false` 静默处理 |
| **业务码判断** | 响应 `code === 1` 时 resolve，否则 reject（reject body 含 code/msg） |
| **Loading 管理** | `showLoading: true` 自动显示/隐藏加载提示 |
| **超时控制** | 默认 15s，可自定义 |

#### API 签名

```javascript
// POST 请求（项目主要使用）
const res = await post('/getHomeDatas', { page: 1, type: 0 });

// 静默请求（不弹错误提示）
const res = await post('/getMessageCounts', {}, { showError: false });

// 带多 code 分支处理（原代码常见模式）
try {
  const res = await post('/getauthorLogin', { code, openid }, { showError: false });
  // code === 1 的处理
} catch (res) {
  if (res.code === 2) { /* 需设置头像 */ }
}

// 文件上传
const res = await uploadFile({
  url: '/uploadImgs',
  filePath: tempFilePath,
  name: 'file',
  formData: { type: 1 },
});
```

#### 响应格式

```javascript
// 成功 (code === 1) → resolve
{ code: 1, data: {...}, result: {...}, msg: "成功" }

// 失败 (code !== 1) → reject
{ code: -1, msg: "参数错误" }
{ code: -2, msg: "未认证" }
{ code: 2,  msg: "需要设置头像" }
```

### 5.4 认证服务层 — `services/auth.js`

Token 全生命周期管理，替代原代码中 136 处散落的 `wx.getStorageSync('token')`。

#### API 清单

| 方法 | 签名 | 说明 |
|------|------|------|
| `init()` | `() → void` | 从 storage 加载 token 到内存缓存，app.js onLaunch 调用 |
| `getToken()` | `() → string` | 同步获取 token（优先内存缓存） |
| `getOpenid()` | `() → string` | 同步获取 openid |
| `isLoggedIn()` | `() → boolean` | 是否已登录 |
| `setToken(token)` | `(string) → void` | 设置 token（同时写内存+storage） |
| `setOpenid(openid)` | `(string) → void` | 设置 openid |
| `refreshToken()` | `() → Promise<string>` | 刷新 token，返回新 token |
| `login()` | `() → Promise<{token, openid}>` | 微信登录（code → 后台换 token） |
| `logout()` | `() → void` | 清除 token 和 openid |
| `requireLogin()` | `() → boolean` | 检查登录态，未登录弹窗引导，返回是否已登录 |

#### requireLogin() 使用模式

```javascript
const { requireLogin } = require('../../services/auth');

Page({
  onShow() {
    // 未登录则弹窗引导，已登录继续执行
    if (!requireLogin()) return;
    this.loadData();
  },
});
```

### 5.5 国际化 — `common/lang.js`

基于微信系统语言自动选择中/英文语言包，所有文案通过 `app.globalData.languagePack` 访问。

```javascript
// app.js onLaunch
this.globalData.languagePack = getLanguage();

// 页面中使用
const app = getApp();
Page({
  data: {
    globalLangData: app.globalData.languagePack,
  },
  // WXML: {{globalLangData.home}}
});
```

支持 **300+ 条** 文案的双语翻译，涵盖所有界面文字。

### 5.6 自定义 TabBar — `custom-tab-bar/`

```javascript
// app.json 配置
"tabBar": {
  "custom": true,  // 启用自定义 TabBar
  "list": [...]
}
```

5 个 Tab：首页、分类、发布（中间凸起按钮）、消息、我的。

特色功能：
- 消息角标：通过 `this.getTabBar().init(count)` 更新未读消息数
- 多语言：Tab 文字从 `languagePack` 动态读取
- 图标：使用 CDN 远程图片

### 5.7 版本更新 — `common/updateManager.js`

小程序热更新管理，`app.js onShow` 时触发检查，有新版本时弹窗提示用户重启。

---

## 6. 自定义组件库

### 6.1 组件清单

| 组件 | 路径 | 功能说明 |
|------|------|---------|
| `goods-card` | `components/goods-card/` | 商品卡片（列表项展示） |
| `goods-list` | `components/goods-list/` | 商品列表容器（含分页加载） |
| `good-list` | `components/good-list/` | 商品列表（简版） |
| `goods-category` | `components/goods-category/` | 商品分类选择器（含侧边栏+标签栏） |
| `store-list` | `components/store-list/` | 店铺列表 |
| `fwstore-list` | `components/fwstore-list/` | 服务店铺列表 |
| `bidding-popup` | `components/bidding-popup/` | 议价/报价弹窗 |
| `bidding-list` | `components/bidding-list/` | 议价记录列表 |
| `collection-list` | `components/collection-list/` | 收藏列表 |
| `collection-art-list` | `components/collection-art-list/` | 资讯收藏列表 |
| `attention-list` | `components/attention-list/` | 关注列表 |
| `order-pj-list` | `components/order-pj-list/` | 评价列表 |
| `dt-list` | `components/dt-list/` | 动态列表（含评论交互） |
| `filter` | `components/filter/` | 筛选器 |
| `filter-popup` | `components/filter-popup/` | 筛选弹窗 |
| `price` | `components/price/` | 价格展示组件 |
| `loading-content` | `components/loading-content/` | 骨架屏加载 |
| `load-more` | `components/load-more/` | 上拉加载更多 |
| `swipeout` | `components/swipeout/` | 滑动删除操作 |
| `webp-image` | `components/webp-image/` | WebP 图片格式适配 |

### 6.2 TDesign 组件使用

项目基于 TDesign MiniProgram，主要使用的 TDesign 组件包括：

- `t-tabs` — 标签页切换
- `t-swiper` — 轮播图
- `t-search` — 搜索框
- `t-cell` — 列表项
- `t-button` — 按钮
- `t-dialog` — 对话框
- `t-toast` — 轻提示
- `t-loading` — 加载指示器
- `t-image` — 图片
- `t-icon` — 图标
- `t-popup` — 弹出层
- `t-picker` — 选择器
- `t-date-time-picker` — 日期选择器
- `t-checkbox` — 复选框
- `t-swipe-cell` — 滑动单元格
- `t-pull-down-refresh` — 下拉刷新
- `t-back-top` — 返回顶部
- `t-message` — 消息条

---

## 7. API 接口清单

### 7.1 认证相关

| 接口 | 方法 | 说明 |
|------|------|------|
| `/getToken` | POST | 微信登录（code 换 token） |
| `/refreshToken` | POST | 刷新 token |
| `/getauthorLogin` | POST | 手机号授权登录 |
| `/sendCode` | POST | 发送验证码 |
| `/accountLogin` | POST | 账号密码登录 |
| `/codeLogin` | POST | 验证码登录 |

### 7.2 首页与商品

| 接口 | 方法 | 说明 |
|------|------|------|
| `/getHomeDatas` | POST | 首页商品列表（含搜索、筛选、排序） |
| `/getGoodsDatas` | POST | 商品详情 |
| `/getGoodsOffers` | POST | 商品报价列表 |
| `/setGoodsQuot` | POST | 提交报价/议价 |
| `/setGoodssc` | POST | 商品收藏/取消收藏 |
| `/setStoreGz` | POST | 关注/取消关注店铺 |
| `/getMessageCounts` | POST | 获取未读消息数 |

### 7.3 商品发布

| 接口 | 方法 | 说明 |
|------|------|------|
| `/uploadImgs` | POST(Upload) | 上传商品图片 |
| `/uploadFile` | POST(Upload) | 上传单文件 |
| `/setGoodsDatas` | POST | 发布/编辑商品 |
| `/getGoodsInfo` | POST | 获取商品编辑信息 |

### 7.4 用户与认证

| 接口 | 方法 | 说明 |
|------|------|------|
| `/getmyInfo` | POST | 获取个人信息 |
| `/setmyInfo` | POST | 更新个人信息 |
| `/setApprove` | POST | 提交认证申请 |
| `/getApproveInfo` | POST | 获取认证状态 |

### 7.5 店铺

| 接口 | 方法 | 说明 |
|------|------|------|
| `/getStoreInfo` | POST | 店铺信息 |
| `/setStoreInfo` | POST | 更新店铺 |
| `/getStoreList` | POST | 店铺列表 |
| `/setStoreLx` | POST | 添加联系方式 |

### 7.6 资讯与消息

| 接口 | method | 说明 |
|------|--------|------|
| `/getDtList` | POST | 动态列表 |
| `/getDtInfo` | POST | 动态详情 |
| `/setDt` | POST | 发布动态 |
| `/setDtPl` | POST | 发表评论 |
| `/getArtList` | POST | 文章列表 |
| `/setArt` | POST | 发布文章 |
| `/getMessageList` | POST | 消息列表 |

### 7.7 接口协议约定

```
请求格式：POST application/json
Token 位置：data.token 字段（非 header）

成功响应：
{
  "code": 1,
  "data": { ... },     // 单个对象
  "result": [ ... ],   // 列表数组
  "msg": "成功"
}

失败响应：
{
  "code": -1,          // -1=通用失败, -2=未认证, 2=需设置头像
  "msg": "错误描述"
}
```

---

## 8. 国际化（i18n）

### 8.1 语言包结构

`common/lang.js` 导出 `langs` 对象，包含 `en` 和 `zh_CN` 两个语言包：

```javascript
const langs = {
  en: { lang: 1, home: 'Home', service: 'Service', ... },
  'zh_CN': { lang: 2, home: '首页', service: '服务', ... }
};
```

### 8.2 语言切换逻辑

```javascript
function getLanguage() {
  const systemInfo = wx.getAppBaseInfo();
  let language = systemInfo.language || 'en';
  language = language.replace('-', '_');
  return isChinese(language) ? langs['zh_CN'] : langs['en'];
}
```

- 中文系统 → 简体中文（zh_CN，lang=2）
- 其他语言 → 英文（en，lang=1）
- `lang` 字段值会传给后端接口，用于返回对应语言的数据

### 8.3 商品分类术语

| 中文 | 英文 | 说明 |
|------|------|------|
| 鱼类 | Fish | 商品大类 |
| 甲壳类 | Crustacean | 商品大类 |
| 软体类 | Cephalopod | 商品大类 |
| 其他类 | Others | 商品大类 |
| 活 | Live | 商品性质 |
| 冰鲜 | Fresh | 商品性质 |
| 冻品 | Frozen | 商品性质 |
| 干(盐)品 | Dry(salt) | 商品性质 |

---

## 9. 开发指南

### 9.1 环境搭建

1. **安装微信开发者工具**：下载最新稳定版
2. **导入项目**：选择 `小程序代码4-12/auctionFish/` 目录
3. **填入 AppID**：`wx80284d8c1ba6124d`（已在 project.config.json 中配置）
4. **安装 npm 依赖**：
   ```bash
   cd 小程序代码4-12/auctionFish
   npm install
   ```
5. **构建 npm**：开发者工具 → 工具 → 构建 npm

### 9.2 环境切换

修改 `utils/config.js` 中的 `APP_ENV` 变量：

```javascript
const APP_ENV = 'development';  // 开发环境
// const APP_ENV = 'staging';   // 预发布环境
// const APP_ENV = 'production'; // 生产环境
```

### 9.3 域名白名单配置

在微信公众平台 → 开发管理 → 开发设置中配置以下域名：

| 类型 | 域名 |
|------|------|
| request 合法域名 | `https://kpy.phanlink.com` |
| uploadFile 合法域名 | `https://kpy.phanlink.com` |
| downloadFile 合法域名 | `https://imgs.phanlink.com` |

### 9.4 代码规范

项目使用 ESLint + Prettier 进行代码检查，主要规则：

- 2 空格缩进
- 单引号字符串
- 末尾无逗号
- `prefer-const` / `prefer-template` 强制使用
- `no-console` warn（允许 warn/error）
- `eqeqeq` warn（建议严格相等）
- Git 提交遵循 Angular Conventional Commits 规范

```bash
# 代码检查
npm run lint

# 提交（使用 commitizen 交互式提交）
git cz
```

### 9.5 新页面开发模板

```javascript
const app = getApp()
const { post } = require('../../utils/request')
const { requireLogin } = require('../../services/auth')

Page({
  data: {
    globalLangData: app.globalData.languagePack,
    loading: true,
    dataList: [],
  },

  onLoad(options) {
    if (!requireLogin()) return
    this.loadData(options.id)
  },

  async loadData(id) {
    try {
      const res = await post('/getDatas', { id }, { showError: false })
      // code === 1 自动 resolve，此处直接使用 res.data / res.result
      this.setData({ dataList: res.result, loading: false })
    } catch (err) {
      // code !== 1 进入 catch
      if (err.code === -2) {
        // 未认证处理
      }
      this.setData({ loading: false })
    }
  },

  onShareAppMessage() {
    return {
      title: '开拍鱼',
      path: '/pages/xxx/xxx?id=' + this.data.id,
    }
  },
})
```

### 9.6 权限说明

`app.json` 中声明的权限：

| 权限 | 用途说明 |
|------|---------|
| `scope.userLocation` | 位置信息展示（当前未深度使用） |
| `scope.writePhotosAlbum` | 保存海报图片到相册 |

---

## 10. 部署与发布

### 10.1 发布流程

1. **代码检查**：`npm run lint` 确保无 ESLint 错误
2. **环境确认**：`utils/config.js` 中 `APP_ENV` 设为 `'production'`
3. **上传代码**：开发者工具 → 上传 → 填写版本号和备注
4. **体验版测试**：微信公众平台 → 版本管理 → 设为体验版
5. **提交审核**：微信公众平台 → 提交审核 → 等待微信团队审核
6. **发布上线**：审核通过后 → 发布

### 10.2 版本更新机制

小程序内置了 `updateManager`，用户打开小程序时自动检查更新：

- 检测到新版本 → 后台下载
- 下载完成 → 弹窗提示「新版本已准备好，是否重启」
- 用户确认 → 自动应用更新并重启

### 10.3 分包预加载建议

当前未配置 `preloadRule`，建议在 `app.json` 中添加：

```json
{
  "preloadRule": {
    "pages/tabbar/home/home": {
      "network": "all",
      "packages": ["pages/goods"]
    },
    "pages/tabbar/my/index": {
      "network": "all",
      "packages": ["pages/my"]
    }
  }
}
```

---

## 11. 代码重构记录

### 2026-07-24/25 — P0+P1 阶段重构

本次重构聚焦于基础设施建设和代码质量提升，**仅改 JS 层，不破坏现有 UI**。

#### 新增基础设施（4 个文件）

| 文件 | 作用 | 替代的问题 |
|------|------|-----------|
| `utils/config.js` | 全局配置收敛 | 100+ 处硬编码 URL |
| `utils/request.js` | 统一请求层 | 68 处 `new Promise + wx.request` |
| `services/auth.js` | Token 生命周期管理 | 136 处 `wx.getStorageSync('token')` |
| `config/area.js` | 行政区划数据拆分 | `config/index.js` 20,437 行 |

#### 改造统计

| 指标 | 改前 | 改后 |
|------|------|------|
| `config/index.js` 行数 | 20,437 | 23 |
| .less 残留文件 | 71 个 | 0 |
| 未注释 console.* | 69 处 | 0 |
| wx.request → post() 迁移 | 0 | ~35 个文件 |
| `wx.getStorageSync('token')` 散落 | 136 处 | 1 处（auth.js 内部） |
| 硬编码 kpy.phanlink.com | 100+ 处 | 0 处（仅 config.js 配置源） |

详细改动记录见 `CHANGELOG.md`。

---

## 12. 已知问题与后续规划

### 12.1 已知技术债务

| 优先级 | 问题 | 现状 | 建议 |
|--------|------|------|------|
| P2 | WebSocket 缺失 | 0 处 WebSocket 实现，实时报价依赖轮询 | 接入 `wx.connectSocket` 实现实时报价推送 |
| P2 | setData 批量化 | 444 处 setData，部分页面高频调用 | 合并 setData 调用，减少桥通信开销 |
| P3 | ESLint 版本过旧 | v6.8.0（已 EOL） | 升级到 v8/v9 |
| P3 | Skyline 渲染引擎 | 未启用 | 评估启用 Skyline 提升渲染性能 |
| P3 | CI/CD | 无自动化构建 | 接入 miniprogram-ci 实现自动化部署 |
| P3 | 分包预加载 | 未配置 preloadRule | 添加预加载规则减少跳转白屏 |
| P3 | 代码测试 | 无测试用例 | 引入 miniprogram-simulate 组件测试 |

### 12.2 建议优化方向

#### 性能优化

1. **启动速度**：当前主包未启用按需注入的完整配置，可进一步优化
2. **图片优化**：CDN 图片未使用 WebP 格式（虽有 webp-image 组件但未全面使用）
3. **列表虚拟化**：商品列表较长时考虑虚拟列表方案
4. **数据预取**：首页加载时预取分类页数据

#### 功能增强

1. **实时报价**：WebSocket 推送报价更新，替代当前轮询模式
2. **订阅消息**：接入 `wx.requestSubscribeMessage`，报价/议价结果通知
3. **小程序直播**：海鲜拍卖直播场景
4. **视频号联动**：商品详情页嵌入视频号内容

#### 工程化

1. **TypeScript 迁移**：当前纯 JS，建议逐步迁移 TS
2. **组件文档**：为自定义组件编写使用文档和示例
3. **接口类型定义**：定义 API 请求/响应的 TypeScript 类型
4. **错误监控**：接入微信小程序性能监控和错误上报

---

## 附录

### A. 关键文件索引

| 文件 | 说明 |
|------|------|
| `app.js` | 应用入口 |
| `app.json` | 全局配置 |
| `utils/config.js` | 环境与域名配置 |
| `utils/request.js` | 统一请求层 |
| `services/auth.js` | 认证服务 |
| `common/lang.js` | 国际化语言包 |
| `custom-tab-bar/data.js` | TabBar 配置 |
| `.eslintrc.js` | 代码规范配置 |
| `project.config.json` | 项目配置 |
| `CHANGELOG.md` | 改动日志 |

### B. 微信平台配置项

| 配置项 | 值 |
|--------|-----|
| AppID | `wx80284d8c1ba6124d` |
| 基础库版本 | 3.4.7 |
| 请求超时 | 15,000ms |
| 上传超时 | 60,000ms |
| TabBar | 自定义（5 个 Tab） |
| 分包 | 4 个子包 |
| 搜索索引 | 允许全部页面 |

### C. 业务术语表

| 术语 | 说明 |
|------|------|
| 出售 (btype=1) | 供应商发布的可售商品 |
| 求购 (btype=2) | 采购方发布的求购需求 |
| 报价 | 买家对商品发起的价格提议 |
| 议价 | 买卖双方就价格进行多轮交互 |
| 认证 | 商家身份验证（企业/个人） |
| 铺位 (store) | 商家在平台上的店铺 |
| 动态 (dt) | 商家社区中发布的短内容 |
| 文章 (art) | 资讯类长内容 |
