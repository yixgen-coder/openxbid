const app = getApp()
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
    formData.token = wx.getStorageSync('token');
    formData.lang = app.globalData.languagePack.lang;

    if (formData.msg == '') {
      wx.showToast({
        title: app.globalData.languagePack.lang==1?'The comment content cannot be empty!':'评论内容不能为空！',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    const url = 'https://kpy.phanlink.com/v1/setArtPl';
    const res = await this.fetchDatas(url, formData);
    if (res.code == 1) {

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

    } else {
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
    const url = 'https://kpy.phanlink.com/v1/getArtDatas';
    const formData = {};
    formData.token = wx.getStorageSync('token');
    formData.artId = this.data.artId;
    const res = await this.fetchDatas(url, formData);
    if (res.code == 1) {
      const nextList = res.result;
      if (nextList.id > 0) {
        this.setData({
          artId: nextList.id,
          artInfo: nextList
        });
      }

    } else {
      wx.showModal({
        title: app.globalData.languagePack.reminder,
        content: res.msg,
        showCancel: false,
        confirmText:  app.globalData.languagePack.sure,
        success: rs => {
          if (rs.confirm) {
            wx.navigateBack({
              delta: 1
            });
          }
        }
      });
    }


  },
  async storeClickHandle() {
    const storeId = this.data.artInfo.store.id;
    const url = 'https://kpy.phanlink.com/v1/setStoreGz';
    const formData = {};
    formData.token = wx.getStorageSync('token');
    formData.storeId = storeId;
    const res = await this.fetchDatas(url, formData);
    let artInfo = this.data.artInfo;
    if (res.code == 1) {
      artInfo.gz = res.action
      this.setData({
        artInfo: artInfo
      });
      // wx.showToast({
      //   title: res.msg,
      //   icon: 'success',
      //   duration: 2000
      // });

    }
  },
  async artZanClickHandle() {
    const artId = this.data.artId;
    const url = 'https://kpy.phanlink.com/v1/setArtZan';
    const formData = {};
    formData.token = wx.getStorageSync('token');
    formData.artId = artId;
    const res = await this.fetchDatas(url, formData);
    let artInfo = this.data.artInfo;
    if (res.code == 1) {
      artInfo.zan = res.action
      this.setData({
        artInfo: artInfo
      });
      // wx.showToast({
      //   title: res.msg,
      //   icon: 'success',
      //   duration: 2000
      // });

    }
  },
  async artScClickHandle() {
    const artId = this.data.artId;
    const url = 'https://kpy.phanlink.com/v1/setArtSc';
    const formData = {};
    formData.token = wx.getStorageSync('token');
    formData.artId = artId;
    const res = await this.fetchDatas(url, formData);
    let artInfo = this.data.artInfo;
    if (res.code == 1) {
      artInfo.sc = res.action
      this.setData({
        artInfo: artInfo
      });
      // wx.showToast({
      //   title: res.msg,
      //   icon: 'success',
      //   duration: 2000
      // });

    }
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
      console.log(res);
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