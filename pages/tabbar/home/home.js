Page({
  data: {
    imgSrcs: [
      'https://imgs.phanlink.com/program/images/banner1.png',
      'https://imgs.phanlink.com/program/images/banner1.png',
      'https://imgs.phanlink.com/program/images/banner1.png'
    ],
    tabList: [{
      text: "推荐",
      key: 0
    }, {
      text: "最新",
      key: 1
    }],
    goodsList: [],
    goodsListLoadStatus: 0,
    pageLoading: false,
    current: 1,
    autoplay: true,
    duration: '500',
    interval: 5000,
    navigation: {
      type: 'dots'
    },
    swiperImageProps: {
      mode: 'scaleToFill'
    },
    statusbar: '',
    jiaonangheight: '',
  },

  goodListPagination: {
    index: 1,
    num: 20,
  },

  privateData: {
    tabIndex: 0,
  },

  onShow() {
    this.getTabBar().init();
  },
  onLoad() {
    this.init();
  },
  // checkUserLogin: function () {
  //   let token = wx.getStorageSync('token');
  //   if (!token) {
  //     // 用户未登录，跳转到登录页面
  //     wx.navigateTo({
  //       url: '/pages/tabbar/login/login',
  //     });
  //   }
  // },
  onReachBottom() {
    if (this.data.goodsListLoadStatus === 0) {
      this.loadGoodsList();
    }
  },

  onPullDownRefresh() {
    this.init();
  },

  init() {

    const res = wx.getMenuButtonBoundingClientRect()
    this.setData({
      statusbar: res.top, // 胶囊顶部高度
      jiaonangheight: res.height // 胶囊高度
    })

    this.loadHomePage();

  },



  loadHomePage() {
    wx.stopPullDownRefresh();

    this.setData({
      pageLoading: true,
    });

    this.setData({
      pageLoading: false,
    });
    this.loadGoodsList(true);
  },

  tabChangeHandle(e) {
    console.log(e)
    this.privateData.tabIndex = e.detail.value;
    this.setData({
      goodsList: [],
    });
    this.loadGoodsList(true);
  },

  onReTry() {
    this.loadGoodsList();
  },

  async loadGoodsList(fresh = false) {
    if (fresh) {
      wx.pageScrollTo({
        scrollTop: 500,
      });
    }

    this.setData({
      goodsListLoadStatus: 1
    });

    const pageSize = this.goodListPagination.num;
    var pageIndex = this.goodListPagination.index;
    var action = this.privateData.tabIndex;
    if (fresh) {
      pageIndex = 1;
    }

    try {
      const res = await this.fetchGoodsList(pageIndex, pageSize, action);
      if (res.code == 1) {
        const nextList = res.data.pros;
        this.setData({
          goodsList: fresh ? nextList : this.data.goodsList.concat(nextList),
        });
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
  fetchGoodsList(pageIndex, pageSize, action) {
    let token = wx.getStorageSync('token');
    const url = 'https://kpy.phanlink.com/v1/getHomeDatas';
    return new Promise((resolve, reject) => {
      wx.request({
        url: url,
        method: 'POST',
        data: {
          'token': token,
          'page': pageIndex,
          'limit': pageSize,
          'action': action
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
  goodListClickHandle(e) {
    const {
      id
    } = e.detail.goods;

    wx.navigateTo({
      url: `/pages/goods/pages/index/index?spuId=${id}`,
    });
  },


  navToSearchPage() {
    wx.navigateTo({
      url: '/pages/goods/search/index'
    });
  },

  navToActivityDetail({
    detail
  }) {
    const {
      index: promotionID = 0
    } = detail || {};
    wx.navigateTo({
      url: `/pages/promotion-detail/index?promotion_id=${promotionID}`,
    });
  },
});