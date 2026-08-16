const app = getApp()
const { post } = require('../../../../utils/request')
Page({
  data: {
    globalLangData: app.globalData.languagePack,
    msg: "",
    artId: '',
    artInfo: {},
    visible: false,
    keyboardheight: 0
  },
  handlekeyboardheight(e) {
    this.setData({
      keyboardheight: e.detail.height
    })
  },
  onLoad: function (options) {
    if (options.artId > 0) {
      this.setData({
        artId: options.artId
      })
    } else {
      this.goback();
    }
    this.init();
  },
  goback: function () {
    wx.navigateBack({
      delta: 1
    });
  },
  handleShowMsg() {
    this.setData({
      visible: !this.data.visible,
      msg: '',
    });
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
    formData.artId = this.data.artId;
    formData.lang = app.globalData.languagePack.lang;

    if (formData.msg == '') {
      wx.showToast({
        title: app.globalData.languagePack.lang==1?'The comment content cannot be empty!':'评论内容不能为空！',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    // [改动] fetchDatas → post()，try/catch 处理 code!=1
    try {
      const res = await post('/setArtPl', formData, { showError: false });
      wx.showToast({
        title: 'Success',
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
      wx.showToast({
        title: res.msg,
        icon: 'none',
        duration: 2000
      });
    }
  },
  init() {
    const artId = this.data.artId;
    if (artId > 0) {
      this.fetchHomeDatas();
    }

  },
  fetchHomeDatas: async function () {
    // [改动] fetchDatas → post()，try/catch 处理 code!=1
    try {
      const res = await post('/getArtDatas', { artId: this.data.artId }, { showError: false });
      const nextList = res.result;
      if (nextList.id > 0) {
        this.setData({
          artId: nextList.id,
          artInfo: nextList
        });
      }
    } catch (res) {
      wx.showModal({
        title: app.globalData.languagePack.reminder,
        content: res.msg,
        showCancel: false,
        confirmText: app.globalData.languagePack.sure,
        success: rs => {
          if (rs.confirm) {
            wx.navigateBack({ delta: 1 });
          }
        }
      });
    }
  },
  async storeClickHandle() {
    // [改动] fetchDatas → post()
    try {
      const res = await post('/setStoreGz', { storeId: this.data.artInfo.store.id }, { showError: false });
      let artInfo = this.data.artInfo;
      artInfo.gz = res.action
      this.setData({ artInfo: artInfo });
    } catch (e) {}
  },
  async artZanClickHandle() {
    // [改动] fetchDatas → post()
    try {
      const res = await post('/setArtZan', { artId: this.data.artId }, { showError: false });
      let artInfo = this.data.artInfo;
      artInfo.zan = res.action
      this.setData({ artInfo: artInfo });
    } catch (e) {}
  },
  async artScClickHandle() {
    // [改动] fetchDatas → post()
    try {
      const res = await post('/setArtSc', { artId: this.data.artId }, { showError: false });
      let artInfo = this.data.artInfo;
      artInfo.sc = res.action
      this.setData({ artInfo: artInfo });
    } catch (e) {}
  },
   /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    wx.stopPullDownRefresh();
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      // console.log(res);
    }
    return {
      title: this.data.artInfo.title,
      imageUrl: 'https://imgs.phanlink.com/' + this.data.artInfo.pic,
      path: '/pages/news/pages/art/index?artId=' + this.data.artId
    }
  },
  onShareTimeline: function (res) {
    return {
      title: this.data.artInfo.title,
      query: 'artId=' + this.data.artId,
      imageUrl: 'https://imgs.phanlink.com/' + this.data.artInfo.pic
    }
  },
})