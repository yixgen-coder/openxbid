const app = getApp()
const { post } = require('../../../../../utils/request')
const { requireLogin } = require('../../../../../services/auth')
Page({
  data: {
    globalLangData: app.globalData.languagePack,
    statusbar: "",
    jiaonangheight: "",
    pageLoading: false,
    goodsList: [],
    goodsListLoadStatus: 0,
    tabList: [{
      text: app.globalData.languagePack.my_biding,
      key: 1
    }, {
      text: app.globalData.languagePack.my_quotation,
      key: 2
    }],
    tabIndex: 2,
  },
  goodListPagination: {
    index: 0,
    num: 20,
  },
  tabChangeHandle(e) {
    this.setData({
      tabIndex: e.detail.value
    })
    this.loadGoodsList(true);
  },
  async init() {
    const res = wx.getMenuButtonBoundingClientRect()
    this.setData({
      statusbar: res.top, // 胶囊顶部高度
      jiaonangheight: res.height // 胶囊高度
    })

    this.loadHomePage();
  },
  handleGoGoods(e) {
    wx.navigateTo({
      url: '/pages/goods/pages/index/index?spuId=' + e.currentTarget.dataset.id,
    });
  },
  loadHomePage() {
    wx.stopPullDownRefresh();
    this.loadGoodsList(true);

  },

  onReachBottom() {
    if (this.data.goodsListLoadStatus === 0) {
      this.loadGoodsList();
    }
  },

  async loadGoodsList(fresh = false) {
    if (fresh) {
      wx.pageScrollTo({
        scrollTop: 0,
      });
    }

    this.setData({
      goodsListLoadStatus: 1
    });

    const page = fresh ? 1 : this.goodListPagination.index;
    // [改动] fetchDatas → post()
    try {
      const res = await post('/getMyOrderDatas', {
        action: this.data.tabIndex,
        limit: this.goodListPagination.num,
        lang: app.globalData.languagePack.lang,
        page
      }, { showError: false });
      const nextList = res.result;
      if (nextList.length > 0) {
        this.goodListPagination.index = page + 1;
      }
      this.setData({
        goodsList: fresh ? nextList : this.data.goodsList.concat(nextList),
      });
      this.setData({
        goodsListLoadStatus: 0
      });

    } catch (err) {
      this.setData({
        goodsListLoadStatus: 3
      });
    }
  },

  onPullDownRefresh() {
    this.init();
  },


  onLoad() {
    wx.setNavigationBarTitle({
      title: app.globalData.languagePack.bid_updates
    });
    // [改动] wx.getStorageSync('token') + navigateTo → requireLogin()
    if (!requireLogin()) return;
  },
  onShow() {
    this.init(true);
  },
})