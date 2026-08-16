/**
 * utils/request.js
 * [改动] 统一网络请求层 —— 替代原代码中 68 处内联 new Promise + wx.request
 *
 * 改动说明：
 *   - 新增文件
 *   - 原代码每个页面都自己写 fetchDatas / fetchSetGoods / fetchGoodsList 方法，
 *     内部都是 new Promise + wx.request 的重复模板
 *   - 本文件统一封装后，页面只需调用 post('/getHomeDatas', { ... }) 即可
 *
 * 关键对接（基于原项目实际接口协议）：
 *   1. token 放在 data.token 字段（不是 header），与原代码一致
 *   2. 响应格式 { code: 1, data: {...}, result: {...}, msg: "..." }，code=1 为成功
 *   3. URL 拼接 API_BASE + url，如 https://kpy.phanlink.com/v1 + /getHomeDatas
 *
 * 依赖：utils/config.js, services/auth.js
 */

const { API_BASE, REQUEST_TIMEOUT } = require('./config');
const { getToken, refreshToken, setToken } = require('../services/auth');

// ---- 内部状态 ----
let refreshingPromise = null; // 防止并发刷新

/**
 * 401 自动刷新 token 并重放请求
 */
async function waitForRefreshAndRetry(options) {
  if (!refreshingPromise) {
    refreshingPromise = refreshToken()
      .then((newToken) => {
        setToken(newToken);
        refreshingPromise = null;
        return newToken;
      })
      .catch((err) => {
        refreshingPromise = null;
        throw err;
      });
  }
  await refreshingPromise;
  return request({ ...options, _isRetry: true });
}

/**
 * 通用请求
 *
 * @param {object} opts
 * @param {string} opts.url          - 接口路径，相对于 API_BASE，如 '/getHomeDatas'
 * @param {string} [opts.method]     - 默认 'POST'（项目惯例全是 POST）
 * @param {object} [opts.data]       - 请求体，token 会自动注入
 * @param {boolean} [opts.showLoading] - 是否显示 loading，默认 false
 * @param {boolean} [opts.showError]   - 是否自动 toast 错误，默认 true
 * @param {number} [opts.timeout]    - 超时毫秒
 * @returns {Promise<{code:number, msg:string, data:any, result:any}>}
 */
function request(opts = {}) {
  const {
    url,
    method = 'POST',
    data = {},
    showLoading = false,
    showError = true,
    timeout = REQUEST_TIMEOUT,
  } = opts;

  if (showLoading) {
    wx.showLoading({ title: '加载中...', mask: true });
  }

  return new Promise((resolve, reject) => {
    const token = getToken();

    wx.request({
      url: `${API_BASE}${url}`,
      method,
      // [关键] token 放在 data 字段，与原项目接口协议一致
      data: { ...data, token },
      timeout,
      header: {
        'content-type': 'application/json',
      },
      success(res) {
        if (showLoading) wx.hideLoading();

        // 401 → 自动刷新 token 并重放
        if (res.statusCode === 401) {
          if (!opts._isRetry) {
            return waitForRefreshAndRetry(opts).then(resolve).catch(reject);
          }
          wx.showModal({
            title: '提示',
            content: '登录已过期，请重新登录',
            showCancel: false,
            success: () => {
              wx.reLaunch({ url: '/pages/tabbar/login/login' });
            },
          });
          return reject({ code: 401, msg: '登录已过期' });
        }

        // 200 系列
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const body = res.data;
          // 业务层 code：1 = 成功（原项目惯例）
          if (body && body.code !== undefined) {
            if (body.code === 1) {
              resolve(body);
            } else {
              if (showError) {
                wx.showToast({ title: body.msg || '请求失败', icon: 'none' });
              }
              reject(body);
            }
          } else {
            resolve(body);
          }
        } else {
          if (showError) {
            wx.showToast({ title: `请求失败(${res.statusCode})`, icon: 'none' });
          }
          reject({ code: res.statusCode, msg: (res.data && res.data.msg) || '服务异常' });
        }
      },
      fail(err) {
        if (showLoading) wx.hideLoading();

        const isTimeout = err.errMsg && err.errMsg.includes('timeout');
        const networkMsg = isTimeout ? '网络超时，请重试' : '网络异常，请检查网络';

        if (showError) {
          wx.showToast({ title: networkMsg, icon: 'none' });
        }
        reject({ code: -1, msg: networkMsg, detail: err });
      },
    });
  });
}

/**
 * 上传文件
 * @param {object} opts
 * @param {string} opts.url - 接口路径
 * @param {string} opts.filePath - 本地文件路径
 * @param {string} [opts.name] - 文件字段名，默认 'file'
 * @param {object} [opts.formData] - 额外表单数据，token 自动注入
 * @param {boolean} [opts.showLoading] - 默认 true
 */
function uploadFile({ url, filePath, name = 'file', formData = {}, showLoading = true }) {
  if (showLoading) wx.showLoading({ title: '上传中...', mask: true });

  return new Promise((resolve, reject) => {
    const token = getToken();

    wx.uploadFile({
      url: `${API_BASE}${url}`,
      filePath,
      name,
      formData: { ...formData, token },
      header: { 'content-type': 'multipart/form-data' },
      success(res) {
        if (showLoading) wx.hideLoading();
        try {
          const body = JSON.parse(res.data);
          resolve(body);
        } catch (e) {
          reject({ code: -1, msg: '解析响应失败' });
        }
      },
      fail(err) {
        if (showLoading) wx.hideLoading();
        wx.showToast({ title: '上传失败', icon: 'none' });
        reject({ code: -1, msg: '上传失败', detail: err });
      },
    });
  });
}

/**
 * POST 快捷方法
 * @param {string} url - 接口路径，如 '/getHomeDatas'
 * @param {object} [data] - 请求体（不含 token，自动注入）
 * @param {object} [opts] - 额外选项
 */
function post(url, data = {}, opts = {}) {
  return request({ ...opts, url, method: 'POST', data });
}

/**
 * GET 快捷方法
 */
function get(url, data = {}, opts = {}) {
  return request({ ...opts, url, method: 'GET', data });
}

module.exports = {
  request,
  uploadFile,
  get,
  post,
};
