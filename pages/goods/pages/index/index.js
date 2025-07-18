const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    globalLangData: app.globalData.languagePack,
    isShow: false,
    isShareShow: false,
    statusbar: '',
    jiaonangheight: '',
    current: 1,
    autoplay: true,
    duration: 500,
    interval: 5000,
    paginationPosition: 'bottom-right',
    goodsInfo: [],
    orderInfos: [],
    goodsId: '',
    storeId: '',
    sc: 0,
    goodslabs: 0,
    hideMydata: false,
    gg: [],
    total: {
      stock: 0,
      weight: 0,
      price: 0
    },
    currentPage: 0,
    fxId: 0,
    fxuId: 0,

  },
  previewImage(e) {
    const index = e.detail.index;
    const current = this.data.goodsInfo.pics[index];
    wx.previewImage({
      current: current,
      urls: this.data.goodsInfo.pics
    });
  },
  // 判断是否有上一页
  canGoBack: function () {
    const pages = getCurrentPages();
    const currentPageIndex = pages.length - 1;

    if (currentPageIndex > 0) {
      return true;
    } else {
      return false;
    }
  },
  goback: function () {
    if (this.canGoBack()) {
      wx.navigateBack({
        delta: 1
      });
    } else {
      wx.switchTab({
        url: '/pages/tabbar/home/home',
      });
    }
  },
  async storeClickHandle() {
    if (!this.checkToken()) {
      return false;
    }
    const {
      storeId
    } = this.data;
    const url = 'https://kpy.phanlink.com/v1/setStoreGz';
    const formData = {};
    formData.token = wx.getStorageSync('token');
    formData.storeId = storeId;
    const res = await this.fetchSetGoods(url, formData);
    let goodsInfo = this.data.goodsInfo;
    if (res.code == 1) {
      goodsInfo.gz = res.action
      this.setData({
        goodsInfo: goodsInfo
      });
      // wx.showToast({
      //   title: res.msg,
      //   icon: 'success',
      //   duration: 2000
      // });

    }
  },
  onVisibleChange() {
    const goodsInfo = this.data.goodsInfo;
    this.setData({
      isShow: false,
      gg: [],
      goodsInfo: goodsInfo
    })

  },
  checkToken() {
    let token = wx.getStorageSync('token');
    if (!token) {

      wx.showModal({
        title: app.globalData.languagePack.reminder,
        content: app.globalData.languagePack.function_registered,
        cancelText: app.globalData.languagePack.cancel,
        confirmText: app.globalData.languagePack.login,
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/tabbar/login/login',
            });
          }
        }
      })
      return false;
    } else {
      return true;
    }
  },
  handleShow() {
    if (this.checkToken()) {
      this.setData({
        isShow: true
      })
    }
  },
  onShareVisibleChange() {
    this.setData({
      isShareShow: false
    })
  },
  handleShareShow() {
    this.setData({
      isShareShow: true
    })
  },
  handleGoReview() {
    const goodsId = this.data.goodsId;
    wx.navigateTo({
      url: '/pages/goods/pages/review/index?goodsId=' + goodsId
    });
  },
  handleGoOffer() {
    const goodsId = this.data.goodsId;
    wx.navigateTo({
      url: '/pages/goods/pages/offer/index?goodsId=' + goodsId
    });
  },
  async init() {

    const res1 = wx.getMenuButtonBoundingClientRect()
    this.setData({
      statusbar: res1.top, // 胶囊顶部高度
      jiaonangheight: res1.height // 胶囊高度
    })
    const res = await this.fetchGoodsInfo(this.data.goodsId, this.data.fxId);
    if (res.code == 1) {
      let total = this.data.total;
      total.stock = res.data.goods.stock;
      total.weight = res.data.goods.weight;
      total.price = res.data.goods.price;
      this.setData({
        goodsInfo: res.data.goods,
        storeId: res.data.goods.storeid,
        orderInfos: res.data.orderInfos,
        sc: res.data.goods.sc,
        total: total,
        fxuId: res.data.goods.fxId,
        hideMydata: res.data.goods.hideMydata,
      })
    }
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    wx.stopPullDownRefresh();
  },
  submitBJ: async function () {
    const formData = {};
    formData.token = wx.getStorageSync('token');
    formData.goodsId = this.data.goodsId;
    formData.gg = this.data.gg;
    formData.lang = this.data.globalLangData.lang;
    const url = 'https://kpy.phanlink.com/v1/setGoodsQuot';
    if (formData.gg.length == 0) {
      wx.showToast({
        title: app.globalData.languagePack.lang == 1 ? 'Please make a bid first' : '请先出价',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    const res = await this.fetchSetGoods(url, formData);
    if (res.code == 1) {
      this.onVisibleChange();
      wx.showToast({
        title: res.msg,
        icon: 'success',
        duration: 2000
      })

      this.init();
    } else if (res.code == -1) {
      wx.showModal({
        title: app.globalData.languagePack.reminder,
        content: res.msg,
        showCancel: true,
        cancelText: app.globalData.languagePack.exit,
        confirmText: app.globalData.languagePack.immediate_certification,
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
    let goodsspec = this.data.goodsInfo.spec;
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    if (options.cpage == 1) {
      this.setData({
        currentPage: 1
      });
    }
    if (options.fxId > 0) {
      this.setData({
        fxId: options.fxId
      });
    }
    this.setData({
      fxId: options.fxId,
      goodsId: options.spuId
    });

    //this.init();
  },
  onShow() {
    this.init();
  },
  onTabsClick(e) {
    const index = e.detail.value;
    this.setData({
      goodslabs: index
    })
  },
  fetchGoodsInfo(spuId, fxId) {
    let token = wx.getStorageSync('token');
    const url = 'https://kpy.phanlink.com/v1/getGoodsDatas';
    var lang = this.data.globalLangData.lang;
    return new Promise((resolve, reject) => {
      wx.request({
        url: url,
        method: 'POST',
        data: {
          'token': token,
          'spuId': spuId,
          'fxId': fxId,
          'lang': lang,
        },
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
  handleFinish: async function () {
    const goodsId = this.data.goodsId;
    const res = await this.fetchGoodsInfo(goodsId);
    if (res.code == 1) {
      this.setData({
        goodsInfo: res.data.goods,
      })
    }
  },
  handlesc: async function (e) {
    if (!this.checkToken()) {
      return false;
    }
    const url = 'https://kpy.phanlink.com/v1/setGoodssc';
    const token = wx.getStorageSync('token');
    var data = {};
    data.token = token;
    data.goodsId = e.currentTarget.id;
    const res = await this.fetchSetGoods(url, data);
    if (res.code == 1) {
      this.setData({
        sc: res.action,
      })
    }
  },
  fetchSetGoods(url, data) {
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
      this.setData({
        isShareShow: false
      })
    }
    let title = this.data.goodsInfo.btype == 1 ? app.globalData.languagePack.sell : app.globalData.languagePack.buy;
    title += this.data.goodsInfo.place + ' ';
    title += this.data.goodsInfo.nature + ' ';
    title += this.data.goodsInfo.title + ' ';
    return {
      title: title,
      imageUrl: 'https://imgs.phanlink.com/' + this.data.goodsInfo.pic,
      path: '/pages/goods/pages/index/index?cpage=1&spuId=' + this.data.goodsInfo.id + '&fxId=' + this.data.fxuId,
    }
  },
  onShareTimeline: function (res) {
    let title = this.data.goodsInfo.btype == 1 ? app.globalData.languagePack.sell : app.globalData.languagePack.buy;
    title += this.data.goodsInfo.place + ' ';
    title += this.data.goodsInfo.nature + ' ';
    title += this.data.goodsInfo.title + ' ';
    return {
      title: title, //字符串  自定义标题
      query: 'spuId=' + this.data.goodsInfo.id + '&fxId=' + this.data.fxuId, //页面携带参数
      imageUrl: 'https://imgs.phanlink.com/' + this.data.goodsInfo.pic //图片地址
    }
  },
})