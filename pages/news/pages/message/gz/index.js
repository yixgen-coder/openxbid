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
  },
  goodListPagination: {
    index: 0,
    num: 20,
  },
  async handleDel(e) {
    const {
      uid
    } = e.currentTarget.dataset;
    // [改动] fetchDatas → post()
    try {
      const res = await post('/delmyFans', { uid }, { showError: false });
      this.setData({
        goodsList: this.data.goodsList.filter(fans => fans.uid !== uid)
      });
      wx.showToast({
        title: res.msg,
        icon: 'success',
        duration: 2000
      });
    } catch (res) {
      wx.showToast({
        title: res.msg,
        icon: 'none',
        duration: 2000
      });
    }
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
      const res = await post('/getmyGzs', {
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
    wx.setNavigationBarTitle({
      title: app.globalData.languagePack.new_follower
    });
    // [改动] wx.getStorageSync('token') + navigateTo → requireLogin()
    if (!requireLogin()) return;
    this.init(true);
  },
})