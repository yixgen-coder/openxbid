const app = getApp()
const { post } = require('../../../utils/request')
const { requireLogin } = require('../../../services/auth')
Page({
  data: {
    itemTitle: app.globalData.languagePack.myfollowing,
    statusbar: '',
    jiaonangheight: '',
    loadStatus: 0,
    pageLoading: false,
    goodsList: [],
    tabIndex: 2,
    num: 0,
  },
  goodListPagination: {
    index: 1,
    num: 20,
  },

  onLoad(options) {
    this.init();
  },
  goback: function () {
    wx.navigateBack({
      delta: 1
    });
  },
  storeClickHandle(e) {
    const {
      id
    } = e.detail;
    wx.showModal({
      title: app.globalData.languagePack.reminder,
      content: app.globalData.languagePack.lang == 1 ? 'Are you sure you want to unfollow?' : '确定要取消关注吗？',
      showCancel: true,
      cancelText: app.globalData.languagePack.cancel,
      confirmText: app.globalData.languagePack.sure,
      success: res => {
        if (res.confirm) {
          this.deleteGzData(id);
        }
      }
    });

  },
  deleteGzData: async function (id) {
    // [改动] fetchDatas → post()
    try {
      const res = await post('/setStoreGz', { storeId: id }, { showError: false });
      this.removeDataById(id);
    } catch (res) {
      // 静默失败
    }
  },
  removeDataById: function (id) {
    this.setData({
      goodsList: this.data.goodsList.filter(message => message.id !== id)
    });
  },

  init() {
    // [改动] wx.getStorageSync('token') + showModal → requireLogin()
    if (!requireLogin()) return;
    const res = wx.getMenuButtonBoundingClientRect();
    this.setData({
      statusbar: res.top, // 胶囊顶部高度
      jiaonangheight: res.height // 胶囊高度
    })
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
    const page = fresh ? 1 : this.goodListPagination.index;
    try {
      const res = await post('/getOrderDatas', {
        limit: this.goodListPagination.num,
        page: page,
        action: this.data.tabIndex,
      }, { showError: false });
      const nextList = res.result;
      this.setData({
        goodsList: fresh ? nextList : this.data.goodsList.concat(nextList),
      });
      if (nextList.length > 0) {
        this.goodListPagination.index = page + 1;
      }
      this.setData({
        loadStatus: 0
      });
      wx.showToast({
        // title: res.msg,
        icon: 'loading',
        duration: 500
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