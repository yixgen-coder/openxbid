const app = getApp()
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
    const url = 'https://kpy.phanlink.com/v1/setStoreGz';
    const formData = {};
    formData.token = wx.getStorageSync('token');
    formData.storeId = storeId;
    const res = await this.fetchDatas(url, formData);
    let storeInfo = this.data.storeInfo;
    if (res.code == 1) {
      storeInfo.gz = res.action
      this.setData({
        storeInfo: storeInfo
      });
      // wx.showToast({
      //   title: res.msg,
      //   icon: 'success',
      //   duration: 2000
      // });

    }
  },
  handlePlSubmit: async function (e) {
    const formData = {};
    formData.msg = e.detail.msg;
    formData.dtId = e.detail.dtId;
    formData.token = wx.getStorageSync('token');

    const url = 'https://kpy.phanlink.com/v1/setDtPl';
    const res = await this.fetchDatas(url, formData);
    if (res.code == 1) {
      let goodsList = this.data.goodsList;
      if (res.result.length > 0) {
        goodsList[e.detail.dtIndex].plDat = res.result;
        goodsList[e.detail.dtIndex].pl += 1;
      }

      wx.showToast({
        title: 'Success',
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

    } else {
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
  async artZanClickHandle(e) {

    const dtId = e.detail.id;
    const index = e.detail.index;
    const url = 'https://kpy.phanlink.com/v1/setDtZan';
    const formData = {};
    formData.token = wx.getStorageSync('token');
    formData.dtId = dtId;
    const res = await this.fetchDatas(url, formData);
    let goodsList = this.data.goodsList;
    if (res.code == 1) {
      goodsList[index].zan = res.action == 1 ? goodsList[index].zan + 1 : goodsList[index].zan - 1;
      goodsList[index].zans = res.action == 1 ? 1 : 0
      this.setData({
        goodsList: goodsList
      });
      // wx.showToast({
      //   title: res.msg,
      //   icon: 'success',
      //   duration: 2000
      // });

    } else {
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
    const url = 'https://kpy.phanlink.com/v1/getStoreListDatas';
    const formData = {};
    formData.token = wx.getStorageSync('token');
    formData.limit = this.goodListPagination.num;
    formData.searchName = this.data.searchName;
    formData.page = fresh ? 1 : this.goodListPagination.index;
    formData.action = this.data.tabIndex;
    formData.storeId = this.data.storeId;
    formData.lang = app.globalData.languagePack.lang;

    try {
      const res = await this.fetchDatas(url, formData);
      if (res.code == 1) {
        const nextList = res.result.data;
        this.setData({
          goodsList: fresh ? nextList : this.data.goodsList.concat(nextList),
          storeInfo: res.result.storeInfo
        });
        if (nextList.length > 0) {
          this.goodListPagination.index = formData.page + 1;

        }

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
  fetchDatas(url, data) {
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
      // 来自页面内转发按钮
      console.log(res);
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