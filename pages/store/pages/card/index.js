const app = getApp()
Page({
  data: {
    globalLangData: app.globalData.languagePack,
    storeInfo: {},
    storeId: 0,
    itemTitle: app.globalData.languagePack.business_card,
    crrentPage: true,
    tabList: [{
      text: app.globalData.languagePack.business_card,
      key: 1
    }, {
      text: app.globalData.languagePack.cardcase,
      key: 2
    }],
    goodsList: [],
    tabIndex: 1,
    isFirstPage: true
  },
  goodListPagination: {
    index: 1,
    num: 20,
  },
  checkPageStack() {
    const pages = getCurrentPages()
    this.setData({
      isFirstPage: pages.length === 1
    })
  },
  tabChangeHandle(e) {
    this.setData({
      tabIndex: e.detail.value
    })
    if (e.detail.value == 1) {
      this.init();
    } else {
      this.fetchHomeDatas(true);
    }
  },
  onLoad(options) {
    if (options.storeId > 0) {
      this.setData({
        storeId: options.storeId,
        crrentPage: false
      });
    }
    const res = wx.getMenuButtonBoundingClientRect()
    this.setData({
      statusbar: res.top,
      jiaonangheight: res.height
    })
  },
  goback: function () {
    if (this.data.isFirstPage) {
      wx.reLaunch({
        url: '/pages/tabbar/home/home'
      })
    } else {
      wx.navigateBack()
    }
  },
  onShow() {
    const tabIndex = this.data.tabIndex;
    if (tabIndex == 1) {
      this.init();
    } else {
      this.fetchHomeDatas(true);
    }
    this.checkPageStack()
  },
  async storeClickHandle() {
    const {
      storeId
    } = this.data;
    const url = 'https://kpy.phanlink.com/v1/setStoreGz';
    const formData = {};
    formData.token = wx.getStorageSync('token');
    formData.storeId = storeId;
    const res = await this.fetchSetOrders(url, formData);
    let storeInfo = this.data.storeInfo;
    if (res.code == 1) {
      storeInfo.gz = res.action
      this.setData({
        storeInfo: storeInfo
      });
      wx.showToast({
        title: res.msg,
        icon: 'success',
        duration: 2000
      });

    }
  },
  handleGoStore() {
    wx.navigateTo({
      url: '/pages/store/pages/list/index?storeId=' + this.data.storeId
    });
  },
  handleGoZx() {
    wx.navigateTo({
      url: '/pages/news/pages/message/chat/index?storeId=' + this.data.storeId
    });
  },

  handleDelLx(e) {
    const {
      id
    } = e.currentTarget.dataset;
    wx.showModal({
      title: app.globalData.languagePack.reminder,
      content: app.globalData.languagePack.sure_delete,
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
    const url = 'https://kpy.phanlink.com/v1/setStoreLxDel';
    const formData = {};
    formData.token = wx.getStorageSync('token');
    formData.lxid = id;
    const oinfo = await this.fetchSetOrders(url, formData);

    if (oinfo.code == 1) {
      wx.showToast({
        title: oinfo.msg,
        icon: 'success',
        duration: 2000
      });
      this.removeDataById(id);
    } else {
      wx.showToast({
        title: oinfo.msg,
        icon: 'loadng',
        duration: 2000
      });
    }
  },
  removeDataById: function (id) {
    let storeInfo = this.data.storeInfo;
    storeInfo.lx = storeInfo.lx.filter(lx => lx.id !== id)
    this.setData({
      storeInfo: storeInfo
    });
  },
  init: async function () {

    const url = 'https://kpy.phanlink.com/v1/getStoreLxInfo';
    const formData = {};
    formData.token = wx.getStorageSync('token');
    formData.storeId = this.data.storeId;
    formData.lang = app.globalData.languagePack.lang;
    const oinfo = await this.fetchSetOrders(url, formData);

    if (oinfo.code == 1) {
      if (oinfo.result.id > 0) {
        this.setData({
          storeInfo: oinfo.result,
          storeId: oinfo.result.id,
        });
      }
    } else if (oinfo.code == -1) {
      wx.showModal({
        title: app.globalData.languagePack.reminder,
        content: oinfo.msg,
        showCancel: true,
        cancelText: app.globalData.languagePack.exit,
        confirmText: app.globalData.languagePack.immediate_certification,
        success: function (res) {
          if (res.confirm) {
            wx.redirectTo({
              url: '/pages/my/pages/approve/index'
            });
          } else if (res.cancel) {
            wx.navigateBack({
              delta: 1
            });
          }
        }
      });
    } else {
      wx.showToast({
        title: oinfo.msg,
        icon: 'success',
        duration: 2000
      });
    }
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
    const url = 'https://kpy.phanlink.com/v1/getOrderDatas';
    const formData = {};
    formData.token = wx.getStorageSync('token');
    formData.limit = this.goodListPagination.num;
    formData.page = fresh ? 1 : this.goodListPagination.index;

    formData.action = this.data.tabIndex;
    formData.lang = this.data.globalLangData.lang;;
    try {
      const res = await this.fetchSetOrders(url, formData);
      if (res.code == 1) {
        const nextList = res.result;
        this.setData({
          goodsList: fresh ? nextList : this.data.goodsList.concat(nextList),
        });
        if (nextList.length > 0) {
          this.goodListPagination.index = formData.page + 1;
        }
      }
      this.setData({
        loadStatus: 0
      });
      wx.showToast({
        title: res.msg,
        icon: 'none',
        duration: 500
      });
    } catch (error) {
      this.setData({
        loadStatus: 3
      });

    }
  },
  fetchSetOrders(url, data) {
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

    }

    return {
      title: '商家名片：' + this.data.storeInfo.shop_name,
      imageUrl: this.data.storeInfo.shop_logo,
      path: '/pages/store/pages/card/index?storeId=' + this.data.storeId,
    }
  },
  onShareTimeline: function (res) {

    return {
      title: '商家名片：' + this.data.storeInfo.shop_name,
      query: 'storeId=' + this.data.storeId,
      imageUrl: this.data.storeInfo.shop_logo,
    }
  },
});