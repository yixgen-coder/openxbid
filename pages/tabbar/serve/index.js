const app = getApp()
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
    const url = 'https://kpy.phanlink.com/v1/setGoodssc';
    const formData = {};
    formData.token = wx.getStorageSync('token');
    formData.goodsId = id;
    const res = await this.fetchSetOrders(url, formData);
    if (res.code == 1) {
      this.setData({
        goodsList: this.data.goodsList.filter(item => item.id !== id),
      });
      wx.showToast({
        title: 'Success',
        icon: 'success',
        duration: 2000
      });
    } else {
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
    const url = 'https://kpy.phanlink.com/v1/setStoreGz';
    const formData = {};
    formData.token = wx.getStorageSync('token');
    formData.storeId = id;
    const res = await this.fetchSetOrders(url, formData);

    if (res.code == 1) {
      wx.showToast({
        title: res.msg,
        icon: 'success',
        duration: 2000
      });
      this.removeDataById(id);
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
    let url = 'https://kpy.phanlink.com/v1/delGoodsOrder';
    const formData = {};
    formData.token = wx.getStorageSync('token');
    formData.goodsId = id;
    const res = await this.fetchSetOrders(url, formData);
    if (res.code == 1) {
      this.setData({
        goodsList: this.data.goodsList.filter(item => item.id !== id),
      });
      wx.showToast({
        title: 'Success',
        icon: 'success',
        duration: 2000
      });
    } else {
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
    let url = 'https://kpy.phanlink.com/v1/delOrder';
    const formData = {};
    formData.token = wx.getStorageSync('token');
    formData.ordId = id;
    const res = await this.fetchSetOrders(url, formData);
    if (res.code == 1) {
      this.setData({
        goodsList: this.data.goodsList.filter(item => item.id !== id),
      });
      wx.showToast({
        title: 'Success',
        icon: 'success',
        duration: 2000
      });
    } else {
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
      const res = await this.fetchGoodsList(pageIndex, pageSize, action, searchName, fwtype, region, lang);
      if (res.code == 1) {
        const nextList = res.result;
        this.setData({
          goodsList: fresh ? nextList : this.data.goodsList.concat(nextList),
          regions: res.regions,
          storenavs: res.storenavs,
        });
        if (nextList.length > 0) {
          this.goodListPagination.index = pageIndex + 1;
        }
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
  fetchGoodsList(pageIndex, pageSize, action, searchName, fwtype, region, lang) {
    let token = wx.getStorageSync('token');
    const url = 'https://kpy.phanlink.com/v1/getOrderDatas';
    return new Promise((resolve, reject) => {
      wx.request({
        url: url,
        method: 'POST',
        data: {
          'token': token,
          'page': pageIndex,
          'limit': pageSize,
          'action': action,
          'searchName': searchName,
          'fwtype': fwtype,
          'region': region,
          'lang': lang,
        },
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
    this.init();
    wx.stopPullDownRefresh();
  },
  checkUserLogin: function () {
    let token = wx.getStorageSync('token');
    if (!token) {
      // 用户未登录，跳转到登录页面
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
            wx.reLaunch({
              url: 'pages/tabbar/home/home' // 替换为你的 tabBar 页面路径
            });
          }
        }
      })
    }
  },
  onReTry() {
    this.loadGoodsList();
  },
  onLoad() {

    this.init(true);
  },
  onShow() {
    this.checkUserLogin();
    this.getMessageCount();
    this.init();
  },
  async getMessageCount() {
    const url = 'https://kpy.phanlink.com/v1/getMessageCounts';
    const formData = {};
    formData.token = wx.getStorageSync('token');
    const res = await this.fetchSetOrders(url, formData);
    if (res.code == 1) {
      this.getTabBar().init(res.result.messageCount);
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
});