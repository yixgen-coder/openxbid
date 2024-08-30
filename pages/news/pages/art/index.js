Page({
  data: {
    msg: "",
    artId: '',
    artInfo: {},
    visible: false,
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
  handleMsg(e) {
    this.setData({
      msg: e.detail.value,
    });
  },
  handleSubmit: async function () {
    const formData = {};
    formData.msg = this.data.msg;
    formData.artId = this.data.artId;
    formData.token = wx.getStorageSync('token');

    if (formData.msg == '') {
      wx.showToast({
        title: '评论内容不能为空！',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    const url = 'https://kpy.phanlink.com/v1/setArtPl';
    const res = await this.fetchDatas(url, formData);
    if (res.code == 1) {

      wx.showToast({
        title: '评论成功',
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
      wx.showToast({
        title: res.msg,
        icon: 'loading',
        duration: 500
      });
    } else {
      wx.showModal({
        title: '提示',
        content: res.msg,
        showCancel: false,
        confirmText: '知道了',
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
      wx.showToast({
        title: res.msg,
        icon: 'success',
        duration: 2000
      });

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
      wx.showToast({
        title: res.msg,
        icon: 'success',
        duration: 2000
      });

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
      wx.showToast({
        title: res.msg,
        icon: 'success',
        duration: 2000
      });

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