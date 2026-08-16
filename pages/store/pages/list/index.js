const app = getApp()
// [改动] 引入统一请求层
const { post } = require('../../../../utils/request')
Page({
  data: {
    globalLangData: app.globalData.languagePack,
    itemTitle: app.globalData.languagePack.products_center,
    statusbar: '',
    jiaonangheight: '',
    loadStatus: 0,
    pageLoading: false,
    tabList: [{
      text: app.globalData.languagePack.products,
      key: 1
    }, {
      text: app.globalData.languagePack.buy,
      key: 2
    }, {
      text: app.globalData.languagePack.reviews,
      key: 3
    }, {
      text: app.globalData.languagePack.share,
      key: 4
    }],

    goodsList: [],
    storeInfo: {},
    tabIndex: 1,
    num: 0,
    searchName: '',
    storeId: 0,
  },
  goodListPagination: {
    index: 1,
    num: 20,
  },


  tabChangeHandle(e) {
    const {
      value
    } = e.detail;
    this.setData({
      tabIndex: value,
    })
    this.fetchHomeDatas(true);
  },
  onLoad(options) {
    this.setData({
      storeId: options.storeId,
    })
    this.init();
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
    this.fetchHomeDatas(true);
  },
  goback: function () {
    wx.navigateBack({
      delta: 1
    });
  },
  goodListClickHandle(e) {
    const {
      id
    } = e.detail.goods;

    wx.navigateTo({
      url: `/pages/goods/pages/index/index?spuId=${id}`,
    });
  },

  async storeClickHandle() {
    const {
      storeId
    } = this.data;
    // [改动] fetchDatas → post()
    try {
      const res = await post('/setStoreGz', { storeId: storeId }, { showError: false });
      let storeInfo = this.data.storeInfo;
      storeInfo.gz = res.action
      this.setData({
        storeInfo: storeInfo
      });
    } catch (res) {
      // 静默处理
    }
  },
  handlePlSubmit: async function (e) {
    // [改动] fetchDatas → post()
    try {
      const res = await post('/setDtPl', {
        msg: e.detail.msg,
        dtId: e.detail.dtId,
        lang: app.globalData.languagePack.lang
      }, { showError: false });
      let goodsList = this.data.goodsList;
      if (res.result.length > 0) {
        goodsList[e.detail.dtIndex].plDat = res.result;
        goodsList[e.detail.dtIndex].pl += 1;
      }
      wx.showToast({
        title: res.msg,
        icon: 'success',
        duration: 2000,
        mask: true,
        complete: () => {
          setTimeout(() => {
            this.setData({
              visible: false,
              goodsList: goodsList
            });
          }, 2000);
        }
      });
    } catch (res) {
      wx.showModal({
        title: app.globalData.languagePack.reminder, // 标题
        content: res.msg, // 内容
        showCancel: false,
        confirmText: app.globalData.languagePack.sure, // 确认按钮文字（可选，默认为"确定"）
      })
    }
  },
  async artZanClickHandle(e) {

    const dtId = e.detail.id;
    const index = e.detail.index;
    // [改动] fetchDatas → post()
    try {
      const res = await post('/setDtZan', { dtId: dtId }, { showError: false });
      let goodsList = this.data.goodsList;
      goodsList[index].zan = res.action == 1 ? goodsList[index].zan + 1 : goodsList[index].zan - 1;
      goodsList[index].zans = res.action == 1 ? 1 : 0
      this.setData({
        goodsList: goodsList
      });
    } catch (res) {
      wx.showModal({
        title: app.globalData.languagePack.reminder, // 标题
        content: app.globalData.languagePack.function_registered, // 内容
        cancelText: app.globalData.languagePack.cancel, // 取消按钮文字（可选，默认为"取消"）
        confirmText: app.globalData.languagePack.login, // 确认按钮文字（可选，默认为"确定"）
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/tabbar/login/login',
            });
          } else if (res.cancel) {
            wx.navigateBack();
          }
        }
      })
    }
  },
  init() {

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
    try {
      const res = await post('/getStoreListDatas', {
        limit: this.goodListPagination.num,
        searchName: this.data.searchName,
        page: fresh ? 1 : this.goodListPagination.index,
        action: this.data.tabIndex,
        storeId: this.data.storeId,
        lang: app.globalData.languagePack.lang
      }, { showError: false });
      const nextList = res.result.data;
      this.setData({
        goodsList: fresh ? nextList : this.data.goodsList.concat(nextList),
        storeInfo: res.result.storeInfo
      });
      if (nextList.length > 0) {
        this.goodListPagination.index = (fresh ? 1 : this.goodListPagination.index) + 1;
      }
      this.setData({
        loadStatus: 0
      });
    } catch (res) {
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
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      // console.log(res);
    }
    return {
      title: this.data.storeInfo.shop_name,
      imageUrl: this.data.storeInfo.shop_logo,
      path: '/pages/store/list/index?storeId=' + this.data.storeId,
    }
  },
  onShareTimeline: function (res) {
    return {
      title: this.data.storeInfo.shop_name,
      query: 'storeId=' + this.data.storeId,
      imageUrl: this.data.storeInfo.shop_logo,
    }
  },
})