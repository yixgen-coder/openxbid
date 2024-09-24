Page({
  data: {
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

    const url = 'https://kpy.phanlink.com/v1/setDtZan';
    const formData = {};
    formData.token = wx.getStorageSync('token');
    formData.dtId = this.data.dtId;
    const res = await this.fetchDatas(url, formData);
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
      msg: e.detail.value,
    });
  },
  previewImage(e) {
    const current = e.currentTarget.dataset.src;
    wx.previewImage({
      current: current,
      urls: this.data.dtInfo.pic.map(row => row.url)
    });
  },
  handleSubmit: async function () {
    const formData = {};
    formData.msg = this.data.msg;
    formData.dtId = this.data.dtId;
    formData.token = wx.getStorageSync('token');

    if (formData.msg == '') {
      wx.showToast({
        title: '评论内容不能为空！',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    const url = 'https://kpy.phanlink.com/v1/setDtPl';
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
    const dtId = this.data.dtId;
    if (dtId > 0) {
      this.fetchHomeDatas();
    }

  },
  fetchHomeDatas: async function () {
    const url = 'https://kpy.phanlink.com/v1/getDtDatas';
    const formData = {};
    formData.token = wx.getStorageSync('token');
    formData.dtId = this.data.dtId;
    const res = await this.fetchDatas(url, formData);
    if (res.code == 1) {
      const nextList = res.result;
      if (nextList.id > 0) {
        this.setData({
          dtId: nextList.id,
          dtInfo: nextList
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
    let imgs = this.data.dtInfo.pic[0].url != '' ? this.data.dtInfo.pic[0].url : ''
    console.log(imgs);
    return {
      title: this.data.dtInfo.title,
      imageUrl: imgs,
      path: '/pages/news/pages/dt/index?dtId=' + this.dtId
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