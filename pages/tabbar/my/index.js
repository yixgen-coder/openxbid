const app = getApp()
Page({
  data: {
    userinfo: {},
  },

  onLoad() {
    let token = wx.getStorageSync('token');
    if (!token) {
      // 用户未登录，跳转到登录页面
      wx.showModal({
        title: app.globalData.languagePack.reminder, // 标题
        content: app.globalData.languagePack.function_registered, // 内容
        cancelText: app.globalData.languagePack.cancel, // 取消按钮文字（可选，默认为"取消"）
        confirmText: app.globalData.languagePack.login, // 确认按钮文字（可选，默认为"确定"）
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/tabbar/login/login',
            });
          } else if (res.cancel) {
            wx.reLaunch({
              url: '/pages/tabbar/home/home' // 替换为你的 tabBar 页面路径
            });
          }
        }
      })
    }
    this.getVersionInfo();
  },

  onShow() {
    this.init();
    this.getMessageCount();
  },
  async getMessageCount() {
    const url = 'https://kpy.phanlink.com/v1/getMessageCounts';
    const formData = {};
    formData.token = wx.getStorageSync('token');
    const res = await this.fetchDatas(url, formData);
    if (res.code == 1) {
      this.getTabBar().init(res.result.messageCount);
    }
  },
  onPullDownRefresh() {
    this.init();
    wx.stopPullDownRefresh();
  },

  init() {
    this.fetUseriInfoHandle();
  },

  fetUseriInfoHandle() {
    const token = wx.getStorageSync('token');
    const that = this;
    wx.request({
      url: 'https://kpy.phanlink.com/v1/getmyInfo',
      method: 'POST',
      data: {
        token: token
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.data.code == 1) {
          that.setData({
            userinfo: res.data.data
          })
          if (that.checkUserInfo(res.data.data)) {
            wx.showModal({
              title: app.globalData.languagePack.reminder, // 标题
              content: app.globalData.languagePack.no_complete, // 内容
              confirmText: app.globalData.languagePack.to_improve, // 确认按钮文字（可选，默认为"确定"）
              success: (res) => {
                if (res.confirm) {
                  wx.navigateTo({
                    url: '/pages/my/pages/info/index',
                  });
                }
              }
            })
          }
        }
      }
    });
  },
  merchantVerifi() {
    const userinfo = this.data.userinfo;
    console.log(userinfo.company_status)
    if (userinfo.company_status < 1) {
      wx.navigateTo({
        url: '/pages/my/pages/approve/index',
      });
    } else if (userinfo.company_status == 2) {
      wx.showModal({
        title: app.globalData.languagePack.reminder, // 标题
        content: app.globalData.languagePack.lang==1?'Your merchant authentication has been authenticated successfully. Re-certification will erase the original certification content!':'您的商家认证' + (userinfo.company_type == 2 ? '企业认证' : '个人认证') + '已经认证成功。重新认证会冲掉原有认证内容!',
        cancelText: app.globalData.languagePack.cancel,
        confirmText: app.globalData.languagePack.lang==1?'Re-certification':'重新认证',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/my/pages/approve/auhor/index?items=' + (userinfo.company_type == 1 ? 1 : 2),
            });
          } else if (res.cancel) {
            wx.reLaunch({
              url: 'pages/tabbar/home/home' // 替换为你的 tabBar 页面路径
            });
          }
        }
      })
    } else {
      wx.showModal({
        title: app.globalData.languagePack.reminder,
        content: app.globalData.languagePack.lang==1?'Your merchant authentication is currently under review. We are waiting for the review result from the administrator!':'您的商家认证已经在审核中，等待管理员审核结果！',
        showCancel: false, // 隐藏取消按钮
        confirmText: app.globalData.languagePack.sure, // 自定义确认按钮文案
        confirmColor: "#007AFF", // 自定义确认按钮颜色
      });
    }
  },
  checkUserInfo(userInfo) {
    return userInfo.nickname.startsWith('KPY_') && !userInfo.avatar.includes('uploads/');
  },
  getVersionInfo() {
    const versionInfo = wx.getAccountInfoSync();
    const {
      version,
      envVersion = __wxConfig
    } = versionInfo.miniProgram;
    this.setData({
      versionNo: envVersion === 'release' ? version : envVersion,
    });
  },
  fetchDatas(url, data) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: url,
        method: 'POST',
        data: data,
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          resolve(res.data);
        },
        fail: function (err) {
          reject(err);
        }
      });
    });
  },
});