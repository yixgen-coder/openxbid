# 开拍鱼小程序改动日志（CHANGELOG）

> 改动日期：2026-07-25
> 改动范围：P0 + P1 阶段 Quick Win
> 原则：仅改 JS 层，WXML/WXSS/JSON 不动，不破坏现有 UI

---

## 新增文件（4 个）

### 1. `utils/config.js` — 全局配置收敛
- **原问题**：100+ 处硬编码 `https://kpy.phanlink.com/v1/...`
- **改动**：所有域名、环境、超时统一管理，切换环境只改一个变量
- **影响**：新文件，不影响现有代码

### 2. `utils/request.js` — 统一请求层
- **原问题**：68 处 `new Promise + wx.request` 重复模板，无 401 处理，无统一错误拦截
- **改动**：封装 `post() / get() / uploadFile()`，自动注入 token（放在 data.token 字段，与原接口协议一致），401 自动刷新并重放
- **影响**：新文件，不影响现有代码。页面迁移后逐步替换掉内联 wx.request

### 3. `services/auth.js` — Token 生命周期封装
- **原问题**：136 处 `wx.getStorageSync('token')` 散落各页面
- **改动**：`getToken() / setToken() / refreshToken() / login() / logout() / requireLogin()`
- **影响**：新文件，不影响现有代码。`requireLogin()` 整合了原代码各页面重复的 `checkToken()` 弹窗逻辑

### 4. `config/area.js` — 行政区划数据拆分
- **原问题**：`config/index.js` 单文件 20,437 行，几乎全是 areaData
- **改动**：areaData 独立到 `config/area.js`（20,429 行），`config/index.js` 瘦身至 23 行
- **影响**：`config/index.js` 仍 re-export `areaData`，向后兼容

---

## 修改文件（3 个页面 + 1 个配置）

### 5. `config/index.js` — 从 20,437 行 → 23 行
- **改动**：areaData 移至 `config/area.js`，本文件保留 `config` + `cdnBase` + re-export
- **备份**：原文件已备份为 `config/index.js.bak`
- **兼容**：使用 `export { areaData } from './area'` 保持导入路径不变

### 6. `pages/tabbar/home/home.js` — 首页迁移
- **新增引入**：`const { post } = require('../../../utils/request')` + `const auth = require('../../../services/auth')`
- **`getMessageCount()`**：删除硬编码 URL + fetchDatas，改为 `post('/getMessageCounts', {})`
- **`fetchGoodsList()`**：从 28 行内联 Promise+wx.request → 10 行 `post('/getHomeDatas', {...})`
- **删除 `fetchDatas()` 方法**：已由 `utils/request.js` 替代
- **删除 `console.log(this.data.globalLangData)`**（onLoad 中）
- **删除 `console.log(res)`**（onShareAppMessage 中）
- **净减代码**：约 40 行

### 7. `pages/goods/pages/index/index.js` — 商品详情页迁移
- **新增引入**：`const { post } = require('../../../../utils/request')` + `const auth = require('../../../../services/auth')`
- **`fetchGoodsInfo()`**：从 22 行内联 Promise+wx.request → 7 行 `post('/getGoodsDatas', {...})`
- **`storeClickHandle()`**：`checkToken()` → `auth.requireLogin()`，`fetchSetGoods` → `post('/setStoreGz', ...)`
- **`submitBJ()`**：`checkToken()` → `auth.requireLogin()`，删除手动塞 token，`fetchSetGoods` → `post('/setGoodsQuot', ...)`
- **`handlesc()`**：同上模式，`post('/setGoodssc', ...)`
- **`handleShow()`**：`this.checkToken()` → `auth.requireLogin()`
- **删除 `checkToken()` 方法**：已由 `auth.requireLogin()` 替代
- **删除 `fetchSetGoods()` 方法**：已由 `utils/request.js` 替代
- **净减代码**：约 70 行

### 8. `pages/goods/pages/offer/index.js` — 报价列表页迁移
- **新增引入**：`const { post } = require('../../../../utils/request')`
- **`init()`**：删除硬编码 URL + 手动塞 token + fetchSetGoods，改为 `post('/getGoodsOffers', {...})`
- **删除 `fetchSetGoods()` 方法**：已由 `utils/request.js` 替代
- **净减代码**：约 25 行

---

## 批量清理

### 9. 删除 71 个 .less 残留文件
- **原问题**：项目同时存在 .less 和 .wxss，IDE 不再编译 less，属于历史包袱
- **改动**：删除全部 71 个 .less 文件（每个都有对应 .wxss，已验证）
- **影响**：无功能影响，减少主包体积

### 10. 注释 69 处 console.* 残留
- **原问题**：生产代码中残留 69 处 `console.log/error/warn`
- **改动**：全部注释掉（保留代码结构，便于调试时取消注释）
- **影响**：无功能影响

---

## 全量页面迁移（第二批 ~35 个文件）

### tabbar 组（6 文件）
- `pages/tabbar/home/home.js` — 首页（已在第一批完成）
- `pages/tabbar/message/index.js` — 消息页：wx.request → post()，token 检查注释
- `pages/tabbar/publish/index.js` — 发布页：wx.request → post()
- `pages/tabbar/my/index.js` — 个人中心：wx.request → post()
- `pages/tabbar/serve/index.js` — 服务页：wx.request → post()（补回误删的 onReTry/onLoad）
- `pages/tabbar/login/login.js` — 登录页：特殊处理 code==2 分支，showError:false

### news 组（8 文件）
- `pages/news/pages/dt/index.js` — 动态详情：wx.request → post()
- `pages/news/pages/art/index.js` — 文章详情：wx.request → post()
- `pages/news/pages/dtadd/index.js` — 发动态：wx.request → post()，requireLogin()
- `pages/news/pages/artadd/index.js` — 发文章：wx.request → post()，requireLogin()
- `pages/news/pages/message/chat/index.js` — 聊天：wx.request → post()，requireLogin()
- `pages/news/pages/message/goods/index.js` — 消息-商品：wx.request → post()，requireLogin()
- `pages/news/pages/message/gz/index.js` — 消息-关注：wx.request → post()，requireLogin()
- `pages/news/pages/message/info/index.js` — 消息-系统：wx.request → post()，requireLogin()
- `pages/news/pages/message/result/index.js` — 消息-结果：wx.request → post()，requireLogin()

### my 组（19 文件）
- `pages/my/pages/about/index.js` — 关于
- `pages/my/pages/approve/index.js` — 实名认证：requireLogin()
- `pages/my/pages/approve/auhor/index.js` — 授权页：requireLogin()，uploadImgs URL → API_BASE
- `pages/my/pages/bid/index.js` — 竞价管理：requireLogin()
- `pages/my/pages/collect/index.js` — 收藏：requireLogin()
- `pages/my/pages/fans/index.js` — 粉丝：requireLogin()
- `pages/my/pages/feedback/index.js` — 反馈：requireLogin()
- `pages/my/pages/follow/index.js` — 关注：requireLogin()
- `pages/my/pages/info/index.js` — 个人信息：uploadAvatar token → getToken()，URL → API_BASE
- `pages/my/pages/mail/index.js` — 邮箱：requireLogin()
- `pages/my/pages/mobile/index.js` — 手机：requireLogin()
- `pages/my/pages/publish/index.js` — 我的发布：requireLogin()
- `pages/my/pages/review/index.js` — 评价：requireLogin()
- `pages/my/pages/review/info/index.js` — 评价详情：requireLogin()
- `pages/my/pages/service/import/index.js` — 导入服务
- `pages/my/pages/service/rate/index.js` — 费率
- `pages/my/pages/service/synergy/index.js` — 协同
- `pages/my/pages/service/tariff/index.js` — 关税
- `pages/my/pages/system/index.js` — 系统：requireLogin()

### goods 组（6 文件）
- `pages/goods/pages/index/index.js` — 商品详情（第一批完成），本轮补充 API_HOST 替换
- `pages/goods/pages/offer/index.js` — 报价列表（第一批完成）
- `pages/goods/pages/info/index.js` — 商品信息
- `pages/goods/pages/add/index.js` — 添加商品：uploadImgs URL → API_BASE
- `pages/goods/pages/review/index.js` — 商品评价
- `pages/goods/pages/list/index.js` — 商品列表
- `pages/goods/pages/manage/index.js` — 商品管理

### store 组（7 文件）
- `pages/store/pages/pj/index.js` — 评价
- `pages/store/pages/card/index.js` — 名片
- `pages/store/pages/info/index.js` — 店铺信息
- `pages/store/pages/list/index.js` — 店铺列表
- `pages/store/pages/dc/index.js` — 店铺认证：requireLogin()
- `pages/store/pages/dc/auth/index.js` — 认证授权：uploadImgs URL → API_BASE
- `pages/store/pages/index/index.js` — 店铺首页：uploadImgs URL → API_BASE
- `pages/store/pages/lxadd/index.js` — 添加联系：uploadImgs URL → API_BASE

### app.js 清理
- 删除 onLaunch 中无用的 `var token = wx.getStorageSync('token')` 死代码（auth.init() 已处理）
- `loginAgain()` 中 `wx.setStorageSync` → `auth.setToken()/auth.setOpenid()`（保持内存缓存同步）

---

## wx.uploadFile 硬编码 URL 清理（8 文件，10 处）

所有 `wx.uploadFile` 中的 `https://kpy.phanlink.com/v1/uploadImgs` 和 `https://kpy.phanlink.com/v1/uploadFile` 替换为 `${API_BASE}/uploadImgs` 和 `${API_BASE}/uploadFile`。

图片 src 和二维码 URL 中的 `https://kpy.phanlink.com/` 替换为 `API_HOST + '/'`。

**改后验证**：全项目仅 `utils/config.js` 保留 `kpy.phanlink.com` 硬编码（配置源），其余 0 处。

---

## 迁移注意事项

1. **token 位置**：原接口协议 token 在 `data.token` 字段（不是 header），`utils/request.js` 已按此实现
2. **响应格式**：`{ code: 1, data: {...}, result: {...}, msg: "..." }`，code=1 为成功
3. **showError 选项**：原代码部分请求静默失败（catch 中不弹 toast），迁移时传 `{ showError: false }`
4. **config/index.js.bak**：原 20,437 行备份文件，确认无问题后可删除
5. **app.js**：已在 `onLaunch` 中调用 `auth.init()` 初始化 token 内存缓存
6. **requireLogin() 模式**：替代原 20 处 `wx.getStorageSync('token')` + `wx.showModal` 重复逻辑

---

## 量化收益

| 指标 | 改前 | 改后 |
|---|---|---|
| config/index.js 行数 | 20,437 | 23 |
| .less 残留文件 | 71 个 | 0 |
| 未注释 console.* | 69 处 | 0 |
| 已迁移页面（wx.request → post()） | 0 | ~35 个文件 |
| wx.getStorageSync('token') 散落 | 136 处 | 1 处（auth.js 内部） |
| 硬编码 kpy.phanlink.com | 100+ 处 | 0 处（仅 config.js） |
| 新增基础设施 | 0 | 4 文件（config.js + request.js + auth.js + area.js）|
