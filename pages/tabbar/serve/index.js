const app = getApp()
const { post } = require('../../../utils/request')
const auth = require('../../../services/auth')
Page({
  data: {
    globalLangData: app.globalData.languagePack,
    list: [],
    tabList: [{
      text: app.globalData.languagePack.bidding2,
      key: 0
    }, {
      text: app.globalData.languagePack.bidding3,
      key: 9
    }, {
      text: app.globalData.languagePack.followed_shops,
      key: 2
    }, {
      text: app.globalData.languagePack.saved_items,
      key: 3
    }],
    pageLoading: false,
    goodsList: [],
    goodsListLoadStatus: 0,
    current: 1,
    statusbar: '',
    jiaonangheight: '',
    num: 0,
    tabIndex: 0,
    searchName: '',
    fwtype: 0,
    region: 0,
    regions: [],
    storenavs: []
  },

  goodListPagination: {
    index: 1,
    num: 20,
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
    const formData = {};
    formData.goodsId = id;
    try {
      await post('/setGoodssc', formData, { showError: false });
      this.setData({
        goodsList: this.data.goodsList.filter(item => item.id !== id),
      });
      wx.showToast({
        title: 'Success',
        icon: 'success',
        duration: 2000
      });
    } catch (err) {
      wx.showToast({
        title: 'Failed',
        icon: 'loading',
        duration: 2000
      });
    }
  },
  storeClickHandle(e) {
    const {
      id
    } = e.detail;
    wx.showModal({
      title: app.globalData.languagePack.reminder,
      content: app.globalData.languagePack.lang==1?'Are you sure you want to unfollow?':'确定要取消关注吗？',
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
    const formData = {};
    formData.storeId = id;
    try {
      const res = await post('/setStoreGz', formData, { showError: false });
      wx.showToast({
        title: res.msg,
        icon: 'success',
        duration: 2000
      });
      this.removeDataById(id);
    } catch (err) {
      // 静默处理
    }
  },
  removeDataById: function (id) {
    this.setData({
      goodsList: this.data.goodsList.filter(message => message.id !== id)
    });
  },
  goodListClickHandle(e) {
    wx.navigateTo({
      url: '/pages/goods/pages/index/index?spuId=' + e.detail.key,
    });
  },
  delGoodsOrders(e) {
    const {
      key
    } = e.detail;
    wx.showModal({
      title: app.globalData.languagePack.reminder,
      content: app.globalData.languagePack.lang==1?'Are you sure you want to end the quotation??':'确定要结束报价吗？',
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
    const formData = {};
    formData.goodsId = id;
    try {
      await post('/delGoodsOrder', formData, { showError: false });
      this.setData({
        goodsList: this.data.goodsList.filter(item => item.id !== id),
      });
      wx.showToast({
        title: 'Success',
        icon: 'success',
        duration: 2000
      });
    } catch (err) {
      wx.showToast({
        title: 'Failed',
        icon: 'loading',
        duration: 2000
      });
    }
  },
  delOrders(e) {
    const {
      key
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
          this.deleteOrderData(key);
        }
      }
    });
  },
  deleteOrderData: async function (id) {
    const formData = {};
    formData.ordId = id;
    try {
      await post('/delOrder', formData, { showError: false });
      this.setData({
        goodsList: this.data.goodsList.filter(item => item.id !== id),
      });
      wx.showToast({
        title: 'Success',
        icon: 'success',
        duration: 2000
      });
    } catch (err) {
      wx.showToast({
        title: 'Failed',
        icon: 'loading',
        duration: 2000
      });
    }
  },
  FwtypeHandle(e) {
    this.setData({
      fwtype: e.detail.fwTypeValue
    });
    this.loadGoodsList(true);
  },
  regionHandle(e) {
    this.setData({
      region: e.detail.region
    });
    this.loadGoodsList(true);
  },
  handleSearchValue(e) {
    const {
      value
    } = e.detail;
    this.setData({
      searchName: value
    });
  },
  handleSearh() {
    const searchName = this.data.searchName;
    if (searchName == '') {
      wx.showToast({
        title: app.globalData.languagePack.keywords,
        icon: 'none',
        duration: 2000
      });
      return;
    }
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

  loadHomePage() {
    wx.stopPullDownRefresh();
    this.loadGoodsList(true);
  },
  tabChangeHandle(e) {
    this.setData({
      tabIndex: e.detail.value
    })

    this.loadGoodsList(true);
  },
  handleNavChange(e) {
    this.setData({
      current: e.currentTarget.dataset.key
    })
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

    const pageSize = this.goodListPagination.num;
    var pageIndex = this.goodListPagination.index;

    var action = this.data.tabIndex;
    const fwtype = this.data.fwtype;
    const region = this.data.region;
    const lang = app.globalData.languagePack.lang;
    if (this.data.current == 2) {
      action = 8;
    }
    var searchName = this.data.searchName;
    if (fresh) {
      pageIndex = 1;
    }

    try {
      const res = await post('/getOrderDatas', {
        page: pageIndex,
        limit: pageSize,
        action: action,
        searchName: searchName,
        fwtype: fwtype,
        region: region,
        lang: lang,
      }, { showError: false });
      const nextList = res.result;
      this.setData({
        goodsList: fresh ? nextList : this.data.goodsList.concat(nextList),
        regions: res.regions,
        storenavs: res.storenavs,
      });
      if (nextList.length > 0) {
        this.goodListPagination.index = pageIndex + 1;
      }
      this.setData({
        goodsListLoadStatus: 0
      });

    } catch (err) {
      this.setData({
        goodsListLoadStatus: 3
      });
    }
  },
  onReTry() {
    this.loadGoodsList();
  },
  onLoad() {
    this.init(true);
  },
  onPullDownRefresh() {
    this.init();
    wx.stopPullDownRefresh();
  },
  onShow() {
    auth.requireLogin();
    this.getMessageCount();
    this.init();
  },
  async getMessageCount() {
    try {
      const res = await post('/getMessageCounts', {}, { showError: false });
      this.getTabBar().init(res.result.messageCount);
    } catch (err) {
      // 静默处理
    }
  },
});