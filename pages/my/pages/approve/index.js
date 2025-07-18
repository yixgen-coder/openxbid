// pages/publish/index.js
const app = getApp()
Page({
  data: {
    globalLangData: app.globalData.languagePack,
    statusbar: '',
    jiaonangheight: '',
    items: 3,
  },
  goback: function () {
    wx.navigateBack({
      delta: 1
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
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
            wx.navigateBack();
          }
        }
      })
    }
    const res = wx.getMenuButtonBoundingClientRect()
    this.setData({
      statusbar: res.top, // 胶囊顶部高度
      jiaonangheight: res.height // 胶囊高度
    })
  },
  onShow() {
    this.fetchData()
  },
  merchantVerifi(userinfo) {
    if (userinfo.company_status == 2) {
      wx.showModal({
        title: app.globalData.languagePack.reminder, // 标题
        content: app.globalData.languagePack.lang == 1 ? 'Your business authentication has been successfully verified. Re-certification will erase the original certification content' : '您的商家认证' + (userinfo.company_type == 2 ? '企业认证' : '个人认证') + '已经认证成功。重新认证会冲掉原有认证内容!',
        cancelText: app.globalData.languagePack.cancel,
        confirmText: app.globalData.languagePack.lang == 1 ? 'Re-certification' : '重新认证',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/my/pages/approve/auhor/index?items=' + (userinfo.company_type == 1 ? 1 : 2),
            });
          } else if (res.cancel) {
            wx.reLaunch({
              url: '/pages/tabbar/home/home'
            });
          }
        }
      })
    } else if (userinfo.company_status == 1 || userinfo.company_status == 3) {
      wx.showModal({
        title: app.globalData.languagePack.reminder,
        content: app.globalData.languagePack.lang == 1 ? 'Your business authentication is currently under review. We are waiting for the review result from the administrator! ' : '您的商家认证已经在审核中，等待管理员审核结果！',
        showCancel: false,
        confirmText: app.globalData.languagePack.sure,
        confirmColor: "#007AFF",
        success: (res) => {
          wx.reLaunch({
            url: '/pages/tabbar/home/home'
          });
        }
      });
    }
  },
  fetchData() {
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
          that.merchantVerifi(res.data.data);
          that.setData({
            items: res.data.data.company_type
          })
        }
      }
    });
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    wx.stopPullDownRefresh();
  },

})