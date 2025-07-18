const app = getApp()
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
            wx.switchTab({
              url: 'pages/tabbar/home/home' // 替换为你的 tabBar 页面路径
            });
          }
        }
      })
    }
  },
  async artHandleNosee(e) {
    console.log(e);
    const storeid = e.detail.storeid;
    const url = 'https://kpy.phanlink.com/v1/setDtNosee';
    const formData = {};
    formData.token = wx.getStorageSync('token');
    formData.storeid = storeid;
    const res = await this.fetchDatas(url, formData);
    let goodsList = this.data.goodsList;
    if (res.code == 1) {
      const dtList = goodsList.filter(item => item.storeid !== storeid);
      this.setData({
        goodsList: dtList
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
      goodsList[index].zan1 = res.action
      if (res.action == 1) {
        goodsList[index].zan += 1
      } else {
        goodsList[index].zan -= 1
      }
      this.setData({
        goodsList: goodsList
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

    let url = 'https://kpy.phanlink.com/v1/getDtListDatas';
    if (this.data.tabCurrent == 1 && this.data.newsTabCurrent > 0) {
      url = 'https://kpy.phanlink.com/v1/getArtListDatas';
    }
    if (this.data.tabCurrent == 0) {
      url = 'https://kpy.phanlink.com/v1/getMyConsults';
    }
    const formData = {};
    formData.token = wx.getStorageSync('token');
    formData.action = this.data.newsTabCurrent;
    formData.limit = this.goodListPagination.num;
    formData.searchName = this.data.searchName;
    formData.page = fresh ? 1 : this.goodListPagination.index;

    try {
      const res = await this.fetchDatas(url, formData);
      const nextList = res.result;
      if (res.code == 1) {
        if (nextList.length > 0) {
          this.goodListPagination.index = formData.page + 1;
        }
        if (this.data.tabCurrent == 0) {
          this.setData({
            messCount: res.count,
            messTime: res.time,
            messageCount: res.count.messageCount
          });

        }
        this.setData({
          goodsList: fresh ? nextList : this.data.goodsList.concat(nextList),
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
      this.setData({
        goodsListLoadStatus: 0
      });

    } catch (err) {
      this.setData({
        goodsListLoadStatus: 3
      });
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
    const url = 'https://kpy.phanlink.com/v1/getMessageCounts';
    const formData = {};
    formData.token = wx.getStorageSync('token');
    const res = await this.fetchDatas(url, formData);
    if (res.code == 1) {
      this.getTabBar().init(res.result.messageCount);
      this.setData({
        messageCount: res.result.messageCount
      })
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
});