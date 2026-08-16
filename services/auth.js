/**
 * services/auth.js
 * [改动] Token / 用户态统一封装 —— 替代原代码中 136 处 wx.getStorageSync('token')
 *
 * 改动说明：
 *   - 新增文件
 *   - 原代码在每个页面直接 wx.getStorageSync('token') 读取 token，
 *     散落 136 处，无统一管理
 *   - 本文件封装后，页面只需 auth.getToken() 或 auth.requireLogin()
 *
 * 关键对接（基于原项目实际接口）：
 *   1. 登录接口：POST /v1/getToken { code } → { token, openid }
 *   2. 刷新接口：POST /v1/refreshToken { token } → { code:1, token }
 *   3. token 存在 wx.storage 的 'token' 字段
 *   4. 原代码 checkToken() 弹窗逻辑保留为 requireLogin()
 *
 * 依赖：utils/config.js
 */

const { API_BASE } = require('../utils/config');

// ---- 内存缓存（避免高频同步读 storage）----
let tokenCache = null; // null = 未初始化
let openidCache = null;

/**
 * 初始化：从 storage 读取到内存
 * [改动] 应在 app.js onLaunch 中调用，替代原 app.js 第 10-11 行的 var token = wx.getStorageSync('token')
 */
function init() {
  tokenCache = wx.getStorageSync('token') || '';
  openidCache = wx.getStorageSync('openid') || '';
}

/**
 * 同步获取 token
 * [改动] 替代原代码 wx.getStorageSync('token') 的 136 处调用
 * @returns {string}
 */
function getToken() {
  if (tokenCache === null) init();
  return tokenCache;
}

/**
 * 同步获取 openid
 * @returns {string}
 */
function getOpenid() {
  if (openidCache === null) init();
  return openidCache;
}

/**
 * 是否已登录
 * @returns {boolean}
 */
function isLoggedIn() {
  return !!getToken();
}

/**
 * 设置 token（同时写内存 + storage）
 * @param {string} token
 */
function setToken(token) {
  tokenCache = token || '';
  wx.setStorageSync('token', tokenCache);
}

/**
 * 设置 openid
 * @param {string} openid
 */
function setOpenid(openid) {
  openidCache = openid || '';
  wx.setStorageSync('openid', openidCache);
}

/**
 * 刷新 token
 * [改动] 原代码无此能力，401 后只能用户手动重登
 * @returns {Promise<string>} 新 token
 */
function refreshToken() {
  return new Promise((resolve, reject) => {
    const oldToken = getToken();
    wx.request({
      url: `${API_BASE}/refreshToken`,
      method: 'POST',
      data: { token: oldToken },
      header: { 'content-type': 'application/json' },
      success(res) {
        if (res.statusCode === 200 && res.data && res.data.code === 1 && res.data.token) {
          setToken(res.data.token);
          resolve(res.data.token);
        } else {
          reject({ code: -1, msg: 'Token 刷新失败' });
        }
      },
      fail(err) {
        reject({ code: -1, msg: '网络异常', detail: err });
      },
    });
  });
}

/**
 * 微信登录（code → 后台换 token）
 * [改动] 整合原 app.js loginAgain() 的逻辑（第 24-48 行）
 * @returns {Promise<{token:string, openid:string}>}
 */
function login() {
  return new Promise((resolve, reject) => {
    wx.login({
      success(res) {
        if (!res.code) {
          reject({ code: -1, msg: '微信登录失败：code 为空' });
          return;
        }
        wx.request({
          url: `${API_BASE}/getToken`,
          method: 'POST',
          data: { code: res.code },
          header: { 'content-type': 'application/json' },
          success(apiRes) {
            if (apiRes.statusCode === 200 && apiRes.data && apiRes.data.token) {
              const { token, openid } = apiRes.data;
              setToken(token);
              if (openid) setOpenid(openid);
              resolve(apiRes.data);
            } else {
              reject({ code: -1, msg: '换取 token 失败' });
            }
          },
          fail(err) {
            reject({ code: -1, msg: '网络异常', detail: err });
          },
        });
      },
      fail(err) {
        reject({ code: -1, msg: '微信登录失败', detail: err });
      },
    });
  });
}

/**
 * 登出
 */
function logout() {
  tokenCache = '';
  openidCache = '';
  wx.removeStorageSync('token');
  wx.removeStorageSync('openid');
}

/**
 * 检查登录态，未登录则弹窗引导
 * [改动] 整合原代码各页面重复的 checkToken() 方法（home.js, goods/index.js 等都有）
 * @returns {boolean} 是否已登录
 */
function requireLogin() {
  if (isLoggedIn()) return true;

  const app = getApp();
  const lang = (app.globalData && app.globalData.languagePack) || {};

  wx.showModal({
    title: lang.reminder || '提示',
    content: lang.function_registered || '此功能仅对注册会员开放',
    cancelText: lang.cancel || '取消',
    confirmText: lang.login || '登录',
    success: (res) => {
      if (res.confirm) {
        wx.navigateTo({ url: '/pages/tabbar/login/login' });
      }
    },
  });
  return false;
}

module.exports = {
  init,
  getToken,
  getOpenid,
  isLoggedIn,
  setToken,
  setOpenid,
  refreshToken,
  login,
  logout,
  requireLogin,
};
