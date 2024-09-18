Page({
  data: {
    list: [],
    tabList: [{
      text: "参与竞价",
      key: 0
    }, {
      text: "竞价成功",
      key: 1
    }, {
      text: "关注商家",
      key: 2
    }, {
      text: "收藏商品",
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
    regions: []
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
      title: '提示',
      content: '确定要删除吗？',
      showCancel: true,
      cancelText: '取消',
      confirmText: '确定',
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
        title: '删除成功',
        icon: 'success',
        duration: 2000
      });
    } else {
      wx.showToast({
        title: '删除失败',
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
      title: '提示',
      content: '确定要取消关注吗？',
      showCancel: true,
      cancelText: '取消',
      confirmText: '确定',
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
        title: '请输入关键词',
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
    this.checkUserLogin();
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
    if (this.data.current == 2) {
      action = 5;
    }
    var searchName = this.data.searchName;
    if (fresh) {
      pageIndex = 1;
    }

    try {
      const res = await this.fetchGoodsList(pageIndex, pageSize, action, searchName, fwtype, region);
      if (res.code == 1) {
        const nextList = res.result;
        this.setData({
          goodsList: fresh ? nextList : this.data.goodsList.concat(nextList),
          regions: res.regions,
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
  fetchGoodsList(pageIndex, pageSize, action, searchName, fwtype, region) {
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
          'region': region
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
  },
  checkUserLogin: function () {
    let token = wx.getStorageSync('token');
    if (!token) {
      // 用户未登录，跳转到登录页面
      wx.navigateTo({
        url: '/pages/tabbar/login/login',
      });
    }
  },
  onReTry() {
    this.loadGoodsList();
  },
  onLoad() {
    this.init(true);
  },
  onShow() {
    this.getTabBar().init();
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