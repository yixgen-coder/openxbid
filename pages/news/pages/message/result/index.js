const { post } = require('../../../../../utils/request')
const { requireLogin } = require('../../../../../services/auth')
Page({
  data: {
    statusbar: "",
    jiaonangheight: "",
    pageLoading: false,
    goodsList: [],
    goodsListLoadStatus: 0,
  },
  goodListPagination: {
    index: 0,
    num: 20,
  },
  async init() {
    const res = wx.getMenuButtonBoundingClientRect()
    this.setData({
      statusbar: res.top, // 胶囊顶部高度
      jiaonangheight: res.height // 胶囊高度
    })

    this.loadHomePage();
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
      const res = await post('/getStoreConsults', {
        action: this.data.newsTabCurrent,
        limit: this.goodListPagination.num,
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
    // [改动] wx.getStorageSync('token') + navigateTo → requireLogin()
    if (!requireLogin()) return;
  },
  onShow() {
    this.init(true);
  },
})