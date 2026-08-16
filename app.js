import updateManager from './common/updateManager';
const {
  getLanguage
} = require('./common/lang')
const auth = require('./services/auth') // [改动] 引入 auth 模块
const { API_BASE } = require('./utils/config') // [改动] 引入配置常量
App({
  onLaunch: function () {
    // 设置全局语言
    this.globalData.languagePack = getLanguage()
    // [改动] 初始化 auth 模块，将 token 从 storage 加载到内存缓存
    auth.init()
  },
  globalData: {
    languagePack: null,
  },
  onShow: function () {
    updateManager();
  },
  loginAgain: function () {
    wx.login({
      success: function (res) {
        if (res.code) {
          // [改动] 硬编码 URL → config.API_BASE（此函数是 bootstrap 登录，不能用 post() 因为 token 尚不存在）
          wx.request({
            url: API_BASE + '/getToken',
            method: 'POST',
            data: {
              code: res.code
            },
            header: {
              'content-type': 'application/json'
            },
            success: function (res) {
              // [改动] wx.setStorageSync → auth.setToken/setOpenid（保持内存缓存同步）
              auth.setToken(res.data.token);
              if (res.data.openid) auth.setOpenid(res.data.openid);
            }
          });
        }
      }
    });
  },
});