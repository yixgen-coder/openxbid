Page({
  data: {
    artId: '',
    artInfo: {},
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