const app = getApp()
const { post } = require('../../../utils/request')
Page({
  data: {
    globalLangData: app.globalData.languagePack,
    list: [],
    tabList: [{
      text: app.globalData.languagePack.business_community,
      key: 0
    }, {
      text: app.globalData.languagePack.supply_board,
      key: 3
    }, {
      text: app.globalData.languagePack.market_intelligence,
      key: 5
    }, {
      text: app.globalData.languagePack.regulatory_updates,
      key: 6
    }],
    pageLoading: false,
    goodsList: [],
    goodsListLoadStatus: 0,
    current: 1,
    statusbar: '',
    jiaonangheight: '',
    num: 0,
    tabCurrent: 1,
    newsTabCurrent: 0,
    visible: false,
    searchName: '',
    messCount: {},
    messTime: {},
    messGl: 0,
    messageCount: 0,
  },

  goodListPagination: {
    index: 0,
    num: 20,
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
    this.loadGoodsList(true);
  },
  handlePlSubmit: async function (e) {
    const formData = {};
    formData.msg = e.detail.msg;
    formData.dtId = e.detail.dtId;
    formData.lang = app.globalData.languagePack.lang;

    try {
      const res = await post('/setDtPl', formData, { showError: false });
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
    } catch (err) {
      wx.showModal({
        title: app.globalData.languagePack.reminder,
        content: (err && err.msg) || app.globalData.languagePack.function_registered,
        showCancel: false,
        confirmText: app.globalData.languagePack.sure,
      })
    }
  },
  async artHandleNosee(e) {
    const storeid = e.detail.storeid;
    const formData = {};
    formData.storeid = storeid;
    try {
      const res = await post('/setDtNosee', formData, { showError: false });
      let goodsList = this.data.goodsList;
      const dtList = goodsList.filter(item => item.storeid !== storeid);
      this.setData({
        goodsList: dtList
      });
    } catch (err) {
      wx.showModal({
        title: app.globalData.languagePack.reminder,
        content: app.globalData.languagePack.function_registered,
        cancelText: app.globalData.languagePack.cancel,
        confirmText: app.globalData.languagePack.login,
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
    const formData = {};
    formData.dtId = dtId;
    try {
      const res = await post('/setDtZan', formData, { showError: false });
      let goodsList = this.data.goodsList;
      goodsList[index].zan1 = res.action
      if (res.action == 1) {
        goodsList[index].zan += 1
      } else {
        goodsList[index].zan -= 1
      }
      this.setData({
        goodsList: goodsList
      });
    } catch (err) {
      wx.showModal({
        title: app.globalData.languagePack.reminder,
        content: app.globalData.languagePack.function_registered,
        cancelText: app.globalData.languagePack.cancel,
        confirmText: app.globalData.languagePack.login,
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

    let url = '/getDtListDatas';
    if (this.data.tabCurrent == 1 && this.data.newsTabCurrent > 0) {
      url = '/getArtListDatas';
    }
    if (this.data.tabCurrent == 0) {
      url = '/getMyConsults';
    }
    const formData = {};
    formData.action = this.data.newsTabCurrent;
    formData.limit = this.goodListPagination.num;
    formData.searchName = this.data.searchName;
    formData.page = fresh ? 1 : this.goodListPagination.index;

    try {
      const res = await post(url, formData, { showError: false });
      const nextList = res.result;
      if (nextList.length > 0) {
        this.goodListPagination.index = formData.page + 1;
      }
      if (this.data.tabCurrent == 0) {
        this.setData({
          messCount: res.count,
          messTime: res.time,
          messGl: res.gl,
          messageCount: res.count.messageCount
        });
      }
      this.setData({
        goodsList: fresh ? nextList : this.data.goodsList.concat(nextList),
      });
      this.setData({
        goodsListLoadStatus: 0
      });
    } catch (err) {
      if (err && err.code !== undefined && err.code !== 1) {
        // 业务错误（如未登录）
        wx.showModal({
          title: app.globalData.languagePack.reminder,
          content: app.globalData.languagePack.function_registered,
          cancelText: app.globalData.languagePack.cancel,
          confirmText: app.globalData.languagePack.login,
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
        this.setData({ goodsListLoadStatus: 0 });
      } else {
        // 网络错误
        this.setData({ goodsListLoadStatus: 3 });
      }
    }
  },

  onPullDownRefresh() {
    this.init();
    wx.stopPullDownRefresh();
  },

  onShow() {
    this.init(true);
    this.getMessageCount();
  },
  async getMessageCount() {
    try {
      const res = await post('/getMessageCounts', {}, { showError: false });
      this.getTabBar().init(res.result.messageCount);
      this.setData({
        messageCount: res.result.messageCount
      })
    } catch (err) {
      // 静默处理
    }
  },
  onLoad() {

    // let token = wx.getStorageSync('token');
    // if (!token) {
    //   // 用户未登录，跳转到登录页面
    //   wx.navigateTo({
    //     url: '/pages/tabbar/login/login',
    //   });
    // }
  },
  // 切换消息和资讯
  changleTabHandle(e) {
    this.setData({
      tabCurrent: e.currentTarget.dataset.myparam,
      newsTabCurrent: 0
    })
    this.loadGoodsList(true);
  },
  // 资讯切换
  tabChangeHandle(e) {
    this.setData({
      newsTabCurrent: e.detail.value
    })
    this.loadGoodsList(true);
  },
});