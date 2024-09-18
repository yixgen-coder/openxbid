Page({
  data: {
    storeInfo: {},
    storeId: 0,
    crrentPage: true
  },

  onLoad(options) {
    if (options.storeId > 0) {
      this.setData({
        storeId: options.storeId,
        crrentPage: false
      });
    }

    this.init();
  },
  handleGoStore() {
    wx.navigateTo({
      url: '/pages/store/pages/list/index?storeId=' + this.data.storeId
    });
  },
  handleGoZx() {
    wx.navigateTo({
      url: '/pages/news/pages/message/chat/index?storeId=' + this.data.storeId
    });
  },

  handleDelLx(e) {
    const {
      id
    } = e.currentTarget.dataset;
    wx.showModal({
      title: '提示',
      content: '确定要删除吗？',
      showCancel: true,
      cancelText: '取消',
      confirmText: '确定',
      success: res => {
        if (res.confirm) {
          this.deleteGzData(id);
        }
      }
    });

  },
  deleteGzData: async function (id) {
    const url = 'https://kpy.phanlink.com/v1/setStoreLxDel';
    const formData = {};
    formData.token = wx.getStorageSync('token');
    formData.lxid = id;
    const oinfo = await this.fetchSetOrders(url, formData);

    if (oinfo.code == 1) {
      wx.showToast({
        title: oinfo.msg,
        icon: 'success',
        duration: 2000
      });
      this.removeDataById(id);
    } else {
      wx.showToast({
        title: oinfo.msg,
        icon: 'loadng',
        duration: 2000
      });
    }
  },
  removeDataById: function (id) {
    let storeInfo = this.data.storeInfo;
    storeInfo.lx = storeInfo.lx.filter(lx => lx.id !== id)
    this.setData({
      storeInfo: storeInfo
    });
  },
  init: async function () {

    const url = 'https://kpy.phanlink.com/v1/getStoreLxInfo';
    const formData = {};
    formData.token = wx.getStorageSync('token');
    formData.storeId = this.data.storeId;
    const oinfo = await this.fetchSetOrders(url, formData);

    if (oinfo.code == 1) {
      if (oinfo.result.id > 0) {
        this.setData({
          storeInfo: oinfo.result,
          storeId: oinfo.result.id,
        });
      }
    } else if (oinfo.code == -1) {
      wx.showModal({
        title: '提示',
        content: oinfo.msg,
        showCancel: true,
        cancelText: '退出',
        confirmText: '去认证',
        success: function (res) {
          if (res.confirm) {
            wx.redirectTo({
              url: '/pages/my/pages/approve/index'
            });
          } else if (res.cancel) {
            wx.navigateBack({
              delta: 1
            });
          }
        }
      });
    } else {
      wx.showToast({
        title: oinfo.msg,
        icon: 'success',
        duration: 2000
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
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    if (res.from === 'button') {

    }

    return {
      title: '商家名片：' + this.data.storeInfo.shop_name,
      imageUrl: this.data.storeInfo.shop_logo,
      path: '/pages/store/pages/card/index?storeId=' + this.data.storeId,
    }
  },
  onShareTimeline: function (res) {

    return {
      title: '商家名片：' + this.data.storeInfo.shop_name,
      query: 'storeId=' + this.data.storeId,
      imageUrl: this.data.storeInfo.shop_logo,
    }
  },
});