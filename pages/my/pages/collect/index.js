const app = getApp()
const { post } = require('../../../utils/request')
const { requireLogin } = require('../../../services/auth')
Page({
  data: {
    globalLangData: app.globalData.languagePack,
    itemTitle: app.globalData.languagePack.mysaved_items,
    statusbar: '',
    jiaonangheight: '',
    loadStatus: 0,
    pageLoading: false,
    tabList: [{
      text: app.globalData.languagePack.saved_items,
      key: 3
    }, {
      text: app.globalData.languagePack.saved_news,
      key: 6
    }],
    goodsList: [],
    tabIndex: 3,
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
  onLoad(options) {
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
  goodsClickHandle(e) {
    const {
      id
    } = e.detail;
    // 显示确认提示框
    wx.showModal({
      title: app.globalData.languagePack.reminder,
      content: app.globalData.languagePack.sure_delete,
      showCancel: true,
      cancelText: app.globalData.languagePack.cancel,
      confirmText: app.globalData.languagePack.sure,
      success: res => {
        if (res.confirm) {
          this.deleteData(id);
        }
      }
    });
  },
  deleteData: async function (id) {
    // [改动] fetchDatas → post()
    const tabIndex = this.data.tabIndex;
    const url = tabIndex == 6 ? '/setArtSc' : '/setGoodssc';
    const payload = tabIndex == 6 ? { artId: id } : { goodsId: id };
    try {
      const res = await post(url, payload, { showError: false });
      this.setData({
        goodsList: this.data.goodsList.filter(item => item.id !== id),
      });
      wx.showToast({
        title: 'success',
        icon: 'none',
        duration: 2000
      });
    } catch (res) {
      wx.showToast({
        title: 'failed',
        icon: 'none',
        duration: 2000
      });
    }
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
        title: res.msg,
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