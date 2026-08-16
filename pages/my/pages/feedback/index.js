// pages/my/approve/auhor/index.js
const app = getApp()
const { post } = require('../../../utils/request')
const { requireLogin } = require('../../../services/auth')
Page({
  data: {
    globalLangData: app.globalData.languagePack,
    itemTitle: app.globalData.languagePack.feedback,
    statusbar: '',
    jiaonangheight: '',
    title: '',
    content: '',
    contact: '',
    type: 1,
    dtid: 0,
    artid: 0,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if (options.type == 2) {
      this.setData({
        type: 2,
        itemTitle: app.globalData.languagePack.complaint
      });
    }
    if (options.dtid) {
      this.setData({
        dtid: options.dtid,
      });
    }
    if (options.artid) {
      this.setData({
        artid: options.artid,
      });
    }

    // [改动] wx.getStorageSync('token') + showModal → requireLogin()
    if (!requireLogin()) return;
    const res = wx.getMenuButtonBoundingClientRect();
    this.setData({
      statusbar: res.top, // 胶囊顶部高度
      jiaonangheight: res.height // 胶囊高度
    })
  },


  handleGrInfos(e) {
    const {
      key
    } = e.currentTarget.dataset;
    const {
      value
    } = e.detail;

    this.setData({
      [key]: value,
    });
  },
  goback: function () {
    wx.navigateBack({
      delta: 1
    });
  },

  onFormSubmit: function (e) {

    const formData = {};
    formData.title = this.data.title;
    formData.content = this.data.content;
    formData.contact = this.data.contact;
    formData.type = this.data.type;
    formData.dtid = this.data.dtid;
    formData.artid = this.data.artid;
    formData.lang = app.globalData.languagePack.lang;

    // 发送数据到服务器
    this.sendFormData(formData);
  },
  sendFormData: async function (data) {
    // [改动] wx.request → post()
    try {
      const res = await post('/setMyFeedback', data, { showError: false });
      wx.showToast({
        title: res.msg,
        icon: 'success',
        duration: 2000,
        mask: true,
        success: () => {
          setTimeout(() => {
            wx.navigateBack({
              delta: 1
            });
          }, 2000);
        }
      });
    } catch (res) {
      wx.showToast({
        title: res.msg || '网络错误',
        icon: 'none',
        duration: 2000
      });
    }
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    wx.stopPullDownRefresh();
  },
})