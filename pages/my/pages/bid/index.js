const app = getApp()
const { post } = require('../../../utils/request')
const { requireLogin } = require('../../../services/auth')
Page({
  data: {
    globalLangData: app.globalData.languagePack,
    itemTitle: app.globalData.languagePack.bid_dashboard,
    statusbar: '',
    jiaonangheight: '',
    loadStatus: 0,
    pageLoading: false,
    tabList: [{
      text: app.globalData.languagePack.bidding2,
      key: 4
    }, {
      text: app.globalData.languagePack.bid_successful,
      key: 1
    }, {
      text: app.globalData.languagePack.bid_failed,
      key: 5
    }],
    goodsList: [],
    tabIndex: 4,
    num: 0,
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
  onLoad() {
    const res = wx.getMenuButtonBoundingClientRect();
    this.setData({
      statusbar: res.top, // 胶囊顶部高度
      jiaonangheight: res.height // 胶囊高度
    })
  },
  onShow() {
    this.init();
  },
  goback: function () {
    wx.navigateBack({
      delta: 1
    });
  },
  goodListClickHandle(e) {
    wx.navigateTo({
      url: '/pages/goods/pages/index/index?spuId=' + e.detail.key,
    });
  },
  handleDelOrder(e) {
    // console.log(e);
    const formData = {};
    formData.ordId = e.detail.key;
    wx.showModal({
      title: app.globalData.languagePack.reminder,
      content: app.globalData.languagePack.sure_delete,
      success: function (res) {
        if (res.confirm) {
          // [改动] fetchDatas → post()
          post('/delOrder', { ordId: formData.ordId }, { showError: false });
          wx.showToast({
            title: app.globalData.languagePack.lang == 1 ? 'Deleted successfully' : '删除成功',
            icon: 'success',
            duration: 2000,
            mask: true
          });
          this.removeDataById(formData.ordId);
        }
      }.bind(this)
    });
  },
  removeDataById: function (id) {
    this.setData({
      goodsList: this.data.goodsList.filter(order => order.id !== id)
    });
  },

  init() {
    // [改动] wx.getStorageSync('token') + showModal → requireLogin()
    if (!requireLogin()) return;

    this.loadHomePage();
  },
  fetchHomeDatas: async function (fresh = false) {
    if (fresh) {
      wx.pageScrollTo({
        scrollTop: 0,
      });
    }

    this.setData({
      loadStatus: 1
    });
    // [改动] fetchDatas → post()
    try {
      const res = await post('/getOrderDatas', {
        limit: this.goodListPagination.num,
        page: fresh ? 1 : this.goodListPagination.index,
        action: this.data.tabIndex,
        lang: app.globalData.languagePack.lang,
      }, { showError: false });
      const nextList = res.result;
      this.setData({
        goodsList: fresh ? nextList : this.data.goodsList.concat(nextList),
      });
      if (nextList.length > 0) {
        this.goodListPagination.index = (fresh ? 1 : this.goodListPagination.index) + 1;
      }
      this.setData({
        loadStatus: 0
      });

    } catch (error) {
      this.setData({
        loadStatus: 3
      });

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