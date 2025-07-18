// pages/goods/pages/review/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    globalLangData: app.globalData.languagePack,
    reviewList: [],
    goodsId: '',
    visible: false,
    msg: '',
    keyboardheight: 0
  },
  checkToken() {
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
          }
        }
      })
      return false;
    } else {
      return true;
    }
  },
  handleShowMsg() {
    if (!this.checkToken()) {
      return false;
    }
    this.setData({
      visible: !this.data.visible,
    });
  },
  handlekeyboardheight(e) {
    this.setData({
      keyboardheight: e.detail.height
    })
  },
  filterEmojis(input) {
    // 使用正则表达式匹配表情符号
    return input.replace(/[\uD83C-\uDBFF\uDC00-\uDFFF]+/g, '');
  },
  handleMsg(e) {
    this.setData({
      msg: this.filterEmojis(e.detail.value),
    });
  },
  handleSubmit: async function () {
    const formData = {};
    formData.msg = this.data.msg;
    formData.goodsId = this.data.goodsId;
    formData.token = wx.getStorageSync('token');
    formData.lang = app.globalData.languagePack.lang;

    if (formData.msg == '') {
      wx.showToast({
        title: app.globalData.languagePack.lang==1?'The content of the comment cannot be empty':'评论内容不能为空！',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    const url = 'https://kpy.phanlink.com/v1/setGoodsReviews';
    const res = await this.fetchSetGoods(url, formData);
    if (res.code == 1) {

      wx.showToast({
        title: res.msg,
        icon: 'success',
        duration: 2000,
        mask: true,
        complete: () => {
          setTimeout(() => {
            this.init();
            this.setData({
              visible: !this.data.visible,
              msg: '',
            });
          }, 2000);
        }
      });

    } else {
      wx.showToast({
        title: res.msg,
        icon: 'none',
        duration: 2000
      });
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {

    this.setData({
      goodsId: options.goodsId,
    });
    this.init();
  },
  init: async function () {
    const url = 'https://kpy.phanlink.com/v1/getGoodsReviews';
    const formData = {};
    formData.token = wx.getStorageSync('token');
    formData.goodsId = this.data.goodsId;
    formData.lang = app.globalData.languagePack.lang;
    const res = await this.fetchSetGoods(url, formData);
    if (res.code == 1) {
      this.setData({
        reviewList: res.result,
      });
    } else {
      wx.showToast({
        title: res.msg,
        icon: 'none',
        duration: 2000
      });
    }
  },
  fetchSetGoods(url, data) {
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
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    wx.stopPullDownRefresh();
  },
})