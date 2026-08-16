// pages/publish/index.js
const app = getApp()
const { post } = require('../../../utils/request')
const { requireLogin } = require('../../../services/auth')
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
    // [改动] wx.getStorageSync('token') + showModal → requireLogin()
    if (!requireLogin()) return;
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
    // [改动] wx.request → post()
    const that = this;
    post('/getmyInfo', {}, { showError: false }).then(res => {
      that.merchantVerifi(res.data);
      that.setData({
        items: res.data.company_type
      })
    });
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    wx.stopPullDownRefresh();
  },

})