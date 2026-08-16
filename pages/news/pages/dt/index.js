const app = getApp()
const { post } = require('../../../../utils/request')
Page({
  data: {
    globalLangData: app.globalData.languagePack,
    msg: "",
    dtId: '',
    dtInfo: {},
    visible: false,
    keyboardheight: 0
  },
  handlekeyboardheight(e) {
    this.setData({
      keyboardheight: e.detail.height
    })
  },
  onLoad: function (options) {

    if (options.dtId > 0) {
      this.setData({
        dtId: options.dtId
      })
    } else {
      this.goback();
    }
    this.init();
  },
  async HandleZan(e) {
    // [改动] fetchDatas → post()
    const res = await post('/setDtZan', { dtId: this.data.dtId }, { showError: false });
    let dtInfo = this.data.dtInfo;
    if (res.code == 1) {
      dtInfo.zan = res.action
      if (res.action == 1) {
        dtInfo.zans += 1
      } else {
        dtInfo.zans -= 1
      }

      this.setData({
        dtInfo: dtInfo
      });
      wx.showToast({
        title: res.msg,
        icon: 'success',
        duration: 2000
      });

    }
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
  handleMsg(e) {
    this.setData({
      msg: this.filterEmojis(e.detail.value),
    });
  },
  previewImage(e) {
    const current = e.currentTarget.dataset.src;
    wx.previewImage({
      current: current,
      urls: this.data.dtInfo.pic.map(row => row.url)
    });
  },
  filterEmojis(input) {
    // 使用正则表达式匹配表情符号
    return input.replace(/[\uD83C-\uDBFF\uDC00-\uDFFF]+/g, '');
  },
  handleSubmit: async function () {
    const formData = {};
    formData.msg = this.data.msg;
    formData.dtId = this.data.dtId;

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
      const res = await post('/setDtPl', formData, { showError: false });
      wx.showToast({
        title: 'Sucess',
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
    const dtId = this.data.dtId;
    if (dtId > 0) {
      this.fetchHomeDatas();
    }

  },
  fetchHomeDatas: async function () {
    // [改动] fetchDatas → post()，try/catch 处理 code!=1
    try {
      const res = await post('/getDtDatas', { dtId: this.data.dtId }, { showError: false });
      const nextList = res.result;
      if (nextList.id > 0) {
        this.setData({
          dtId: nextList.id,
          dtInfo: nextList
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
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    wx.stopPullDownRefresh();
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: async function (res) {
    if (res.from === 'button') {
      // [改动] fetchDatas → post()
      try {
        const res2 = await post('/setDtZf', { dtId: this.data.dtId }, { showError: false });
        let dtInfo = this.data.dtInfo;
        dtInfo.zf += 1;
        this.setData({ dtInfo: dtInfo });
      } catch (e) {}
    }
    let imgs = this.data.dtInfo.pic[0].url != '' ? this.data.dtInfo.pic[0].url : ''
    return {
      title: this.data.dtInfo.title,
      imageUrl: imgs,
      path: '/pages/news/pages/dt/index?dtId=' + this.data.dtId
    }
  },
  onShareTimeline: function (res) {
    let imgs = this.data.dtInfo.pic[0].url != '' ? this.data.dtInfo.pic[0].url : ''
    return {
      title: this.data.dtInfo.title,
      query: 'dtId=' + this.data.dtId,
      imageUrl: imgs
    }
  },
})