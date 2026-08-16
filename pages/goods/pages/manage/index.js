const app = getApp()
// [改动] 引入统一请求层和认证服务
const { post } = require('../../../../utils/request')
const { requireLogin } = require('../../../../services/auth')
Page({
  data: {
    globalLangData: app.globalData.languagePack,
    itemTitle: app.globalData.languagePack.quote,
    statusbar: '',
    jiaonangheight: '',
    loadStatus: 0,
    pageLoading: false,
    typeText: app.globalData.languagePack.selling,
    goodsList: [],
    tabIndex: 1,
    num: 0,
    btype: 1,
    scount: 0,
    ecount: 0,
  },
  goodListPagination: {
    index: 1,
    num: 20,
  },
  tabChangeHandle(e) {
    this.setData({
      tabIndex: e.detail.value
    })
    this.fetchHomeDatas(true);
  },
  handleGoOffer(e) {
    const {
      key
    } = e.currentTarget.dataset;
    wx.navigateTo({
      url: '/pages/goods/pages/offer/index?goodsId=' + key,
    });
  },
  handleGoGoodsAdd(e) {
    const {
      key
    } = e.currentTarget.dataset;
    wx.navigateTo({
      url: '/pages/goods/pages/add/index?goodsId=' + key,
    });
  },

  handleGoGoodsDel: function (e) {
    const {
      key
    } = e.currentTarget.dataset;
    // 显示确认提示框
    wx.showModal({
      title: app.globalData.languagePack.reminder,
      content: app.globalData.languagePack.sure_delete,
      showCancel: true,
      cancelText: app.globalData.languagePack.cancel,
      confirmText: app.globalData.languagePack.sure,
      success: res => {
        if (res.confirm) {
          this.deleteData(key);
        }
      }
    });
  },
  deleteData: async function (id) {
    // [改动] fetchDatas → post()
    try {
      await post('/setGoodsDelDatas', { goodsId: id }, { showError: false });
      this.setData({
        goodsList: this.data.goodsList.filter(item => item.id !== id)
      });
      wx.showToast({ title: 'sucess', icon: 'none', duration: 2000 });
    } catch (err) {
      wx.showToast({ title: 'failed', icon: 'none', duration: 2000 });
    }
  },
  onLoad(options) {
    if (options.btype) {
      const btype = options.btype;
      if (btype == 2) {
        this.setData({
          typeText: app.globalData.languagePack.buying,
          btype: 2,
          itemTitle: app.globalData.languagePack.buy
        })
      }
    }

    this.init();
  },
  goback: function () {
    wx.navigateBack({
      delta: 1
    });
  },
  goodListClickHandle(e) {
    wx.navigateTo({
      url: '/pages/goods/pages/index/index?spuId=' + e.currentTarget.dataset.key,
    });
  },
  delGoodsOrder(e) {
    const {
      key
    } = e.currentTarget.dataset;
    wx.showModal({
      title: app.globalData.languagePack.reminder,
      content: app.globalData.languagePack.lang == 1 ? 'Are you sure you want to end the quotation?' : '确定要结束报价吗？',
      showCancel: true,
      cancelText: app.globalData.languagePack.cancel,
      confirmText: app.globalData.languagePack.sure,
      success: res => {
        if (res.confirm) {
          this.deleteGoodsOrderData(key);
        }
      }
    });
  },
  deleteGoodsOrderData: async function (id) {
    // [改动] fetchDatas → post()
    try {
      await post('/delGoodsOrder', { goodsId: id }, { showError: false });
      this.setData({
        scount: this.data.scount - 1,
        goodsList: this.data.goodsList.filter(item => item.id !== id),
      });
      wx.showToast({
        title: app.globalData.languagePack.lang == 1 ? 'Operation successful' : '操作成功',
        icon: 'none', duration: 2000
      });
    } catch (err) {
      wx.showToast({
        title: app.globalData.languagePack.lang == 1 ? 'Operation failed' : '操作失败',
        icon: 'none', duration: 2000
      });
    }
  },
  init() {
    // [改动] 登录检查 → requireLogin()
    if (!requireLogin()) return;
    const res = wx.getMenuButtonBoundingClientRect();
    this.setData({
      statusbar: res.top,
      jiaonangheight: res.height
    })
    this.loadHomePage();
  },
  fetchHomeDatas: async function (fresh = false) {
    if (fresh) {
      wx.pageScrollTo({ scrollTop: 0 });
    }
    this.setData({ loadStatus: 1 });
    const formData = {};
    formData.limit = this.goodListPagination.num;
    formData.btype = this.data.btype;
    formData.action = this.data.tabIndex;
    formData.lang = app.globalData.languagePack.lang;
    formData.page = fresh ? 1 : this.goodListPagination.index;
    // [改动] fetchDatas → post()
    try {
      const res = await post('/getGoodsLists', formData, { showError: false });
      const nextList = res.result.pros;
      this.setData({
        goodsList: fresh ? nextList : this.data.goodsList.concat(nextList),
        ecount: res.result.ecount,
        scount: res.result.scount,
      });
      if (nextList.length > 0) {
        this.goodListPagination.index = formData.page + 1;
      }
      this.setData({ loadStatus: 0 });
    } catch (error) {
      this.setData({ loadStatus: 3 });
    }
  },
  onPullDownRefresh() {
    this.fetchHomeDatas(true);
    wx.stopPullDownRefresh();
  },
  onReTry() {
    this.fetchHomeDatas();
  },
  loadHomePage() {
    wx.stopPullDownRefresh();
    this.fetchHomeDatas(true);
  },
  onReachBottom() {
    if (this.data.loadStatus === 0) {
      this.fetchHomeDatas();
    }
  },
})