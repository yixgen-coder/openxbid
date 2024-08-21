Page({

  /**
   * 页面的初始数据
   */
  data: {
    isShow: false,
    isShareShow: false,
    statusbar: '',
    jiaonangheight: '',
    current: 1,
    autoplay: true,
    duration: 500,
    interval: 5000,
    goodsInfo: [],
    goodsId: '',
    sc: 0,
    goodslabs: 0,
    gg: [],
    total: {
      stock: 0,
      weight: 0,
      price: 0
    }

  },
  goback: function () {
    wx.navigateBack({
      delta: 1
    });
  },
  onVisibleChange() {
    const goodsInfo = this.data.goodsInfo;
    this.setData({
      isShow: false,
      gg: [],
      goodsInfo: goodsInfo
    })

  },
  handleShow() {
    this.setData({
      isShow: true
    })
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
  init() {

    const res = wx.getMenuButtonBoundingClientRect()
    this.setData({
      statusbar: res.top, // 胶囊顶部高度
      jiaonangheight: res.height // 胶囊高度
    })

  },
  submitBJ: async function () {
    const formData = {};
    formData.token = wx.getStorageSync('token');
    formData.goodsId = this.data.goodsId;
    formData.gg = this.data.gg;
    const url = 'https://kpy.phanlink.com/v1/setGoodsQuot';
    if (formData.gg.length == 0) {
      wx.showToast({
        title: '请先出价',
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
    this.init();
    const res = await this.fetchGoodsInfo(options.spuId);
    if (res.code == 1) {
      const total = this.data.total;
      total.stock = res.data.goods.stock;
      total.weight = res.data.goods.weight;
      total.price = res.data.goods.price;
      this.setData({
        goodsInfo: res.data.goods,
        goodsId: options.spuId,
        sc: res.data.goods.sc,
        total: total,
      })
    }
  },
  onTabsClick(e) {
    const index = e.detail.value;
    this.setData({
      goodslabs: index
    })
  },
  fetchGoodsInfo(spuId) {
    let token = wx.getStorageSync('token');
    const url = 'https://kpy.phanlink.com/v1/getGoodsDatas';
    return new Promise((resolve, reject) => {
      wx.request({
        url: url,
        method: 'POST',
        data: {
          'token': token,
          'spuId': spuId,
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
  onShareAppMessage() {

  }
})