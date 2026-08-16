// pages/goods/pages/review/index.js
const app = getApp()
// [改动] 引入统一请求层和认证服务
const { post } = require('../../../../utils/request')
const { requireLogin } = require('../../../../services/auth')
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
    // [改动] 登录检查 → requireLogin()
    return requireLogin();
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
    formData.lang = app.globalData.languagePack.lang;

    if (formData.msg == '') {
      wx.showToast({
        title: app.globalData.languagePack.lang==1?'The content of the comment cannot be empty':'评论内容不能为空！',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    // [改动] fetchSetGoods → post()
    try {
      const res = await post('/setGoodsReviews', formData, { showError: false });
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
    } catch (res) {
      wx.showToast({ title: res.msg, icon: 'none', duration: 2000 });
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
    // [改动] fetchSetGoods → post()
    try {
      const res = await post('/getGoodsReviews', {
        goodsId: this.data.goodsId,
        lang: app.globalData.languagePack.lang
      }, { showError: false });
      this.setData({ reviewList: res.result });
    } catch (res) {
      wx.showToast({ title: res.msg, icon: 'none', duration: 2000 });
    }
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    wx.stopPullDownRefresh();
  },
})