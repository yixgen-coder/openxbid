const app = getApp()
Page({
  data: {
    globalLangData: app.globalData.languagePack,
    statusbar: '',
    jiaonangheight: '',
    orderInfo: {},
    ordId: 0,
    visible: false,
    pjvisible: false,
    isShow: false,
    gg: [],
    orderSpec: [],
    total: {
      stock: 0,
      weight: 0,
      price: 0
    },
    pjvalue: 1,
    msg: '',
    cj: 0,
    pj: 0,
  },
  handleShow() {
    this.setData({
      isShow: !this.data.isShow
    })
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    wx.stopPullDownRefresh();
  },
  handleShowPJ() {
    this.setData({
      pjvisible: !this.data.pjvisible
    })
  },
  onPJChange(e) {
    const {
      value
    } = e.detail;
    this.setData({
      pjvalue: value,
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
    formData.ordId = this.data.ordId;
    formData.pjvalue = this.data.pjvalue;
    formData.token = wx.getStorageSync('token');
    formData.lang = app.globalData.languagePack.lang;
    const url = 'https://kpy.phanlink.com/v1/setOrderPJ';
    const res = await this.fetchSetOrders(url, formData);
    if (res.code == 1) {
      wx.showToast({
        title: 'success',
        icon: 'success',
        duration: 2000,
        mask: true,
        complete: () => {
          setTimeout(() => {
            wx.navigateBack({
              delta: 1
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
  handleShowDel() {

    const formData = {};
    formData.token = wx.getStorageSync('token');
    formData.ordId = this.data.ordId;
    wx.showModal({
      title: app.globalData.languagePack.reminder,
      content: app.globalData.languagePack.sure_delete,
      success: function (res) {
        if (res.confirm) {
          const url = 'https://kpy.phanlink.com/v1/delOrder';
          this.fetchSetOrders(url, formData);
          wx.showToast({
            title: 'Success',
            icon: 'success',
            duration: 2000,
            mask: true
          });
          setTimeout(() => {
            wx.navigateBack();
          }, 2000);
        }
      }.bind(this)
    });

  },
  onVisibleChange() {
    this.setData({
      isShow: !this.data.isShow
    })
  },
  cancel() {
    this.setData({
      visible: !this.data.visible,
    });
  },
  handleShowOfferInfo(e) {
    this.setData({
      visible: !this.data.visible,
    });
  },
  onLoad(options) {
    if (options.cj == 1) {
      this.setData({
        isShow: true,
        cj: 1,
      });
    }
    if (options.pj == 1) {
      this.setData({
        pjvisible: true,
        pj: 1,
      });
    }
    this.setData({
      ordId: options.ordId,
    });
    this.init();

  },
  goback: function () {
    wx.navigateBack({
      delta: 1
    });
  },
  submitBJ: async function () {
    const formData = {};
    formData.token = wx.getStorageSync('token');
    formData.goodsId = this.data.orderInfo.goods_id;
    formData.gg = this.data.gg;
    formData.lang = app.globalData.languagePack.lang;
    const url = 'https://kpy.phanlink.com/v1/setGoodsQuot';
    if (formData.gg.length == 0) {
      wx.showToast({
        title: app.globalData.languagePack.lang == 1 ? 'Please make a bid first' : '请先出价',
        icon: 'none',
        duration: 2000
      });

      return;
    }
    const res = await this.fetchSetOrders(url, formData);
    if (res.code == 1) {
      this.onVisibleChange();
      wx.showToast({
        title: res.msg,
        icon: 'success',
        duration: 2000
      });
      if (this.data.cj == 1) {
        setTimeout(() => {
          wx.navigateBack();
        }, 2000);
      }
    } else {
      wx.showModal({
        title: app.globalData.languagePack.reminder,
        content: res.msg,
        showCancel: false, // 隐藏取消按钮
        confirmText: app.globalData.languagePack.sure, // 自定义确认按钮文案
        confirmColor: "#007AFF", // 自定义确认按钮颜色
      });

    }
  },
  ggainput(e) {
    let goodsspec = this.data.orderSpec;
    let total = this.data.total;
    total.price = 0;
    const gg = e.detail[0].gg;
    for (let i = 0; i < gg.length; i++) {

      total.price += parseFloat(goodsspec[i].a4 * gg[i]);
    }

    this.setData({
      gg: gg,
      total: total,
    });
  },
  checkUserLogin: function () {
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
          } else if (res.cancel) {
            wx.navigateBack();
          }
        }
      })
    }
  },
  handleGoChat() {
    wx.navigateTo({
      url: '/pages/news/pages/message/chat/index?storeId=' + this.data.orderInfo.storeid,
    });
  },
  init: async function () {
    const res = wx.getMenuButtonBoundingClientRect()
    this.setData({
      statusbar: res.top, // 胶囊顶部高度
      jiaonangheight: res.height // 胶囊高度
    })
    this.checkUserLogin();
    const url = 'https://kpy.phanlink.com/v1/getOrderInfo';
    const formData = {};
    formData.token = wx.getStorageSync('token');
    formData.ordId = this.data.ordId;
    const oinfo = await this.fetchSetOrders(url, formData);
    if (oinfo.code == 1) {
      const total = this.data.total;
      total.stock = oinfo.result.orderQuantity;
      total.weight = oinfo.result.orderWeight;
      total.price = oinfo.result.orderTotal;
      this.setData({
        orderInfo: oinfo.result,
        orderSpec: JSON.parse(oinfo.result.orderSpec),
        total: total,
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