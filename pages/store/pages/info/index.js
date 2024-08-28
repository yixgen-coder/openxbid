Page({
  data: {
    statusbar: '',
    jiaonangheight: '',
    storeInfo: {},
    storeId: 0,
  },

  onLoad(options) {
    this.setData({
      storeId: options.storeId,
    });
    this.init();

  },
  goback: function () {
    wx.navigateBack({
      delta: 1
    });
  },


  init: async function () {
    const res = wx.getMenuButtonBoundingClientRect()
    this.setData({
      statusbar: res.top, // 胶囊顶部高度
      jiaonangheight: res.height // 胶囊高度
    })
    const url = 'https://kpy.phanlink.com/v1/getStoreInfo';
    const formData = {};
    formData.token = wx.getStorageSync('token');
    formData.storeId = this.data.storeId;
    const oinfo = await this.fetchSetOrders(url, formData);
    if (oinfo.result != null) {
      this.setData({
        storeInfo: oinfo.result,
      });
    }
  },
  fetchSetOrders(url, data) {
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
});