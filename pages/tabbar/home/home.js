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
    currentPage: 1, //当前页面
    searchName: '', //搜索条件
    region: '', //国家
    regionValue: [96],
    regionTitle: '国家或地区',
    regionVisible: false,
    regionTypes: [],
    type: '', //行业分类
    typeTitle: '商品分类', //行业分类
    typeVisible: false,
    typeValue: [],
    typeList: [],
    topids: [],
    typeids: [],
    storeBtn: 1
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

  handleShowPage(e) {
    const {
      index
    } = e.currentTarget.dataset;
    this.setData({
      currentPage: index,
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
  handleShowTJStore() {
    this.setData({
      type: '',
      typeTitle: '商品分类',
      regionTitle: '国家或地区',
      region: '',
      storeBtn: 1
    });
    this.loadGoodsList(true);
  },
  handleShowRegions() {
    this.setData({
      regionVisible: !this.data.regionVisible,
    });
  },
  onRegionChange(e) {
    const {
      key
    } = e.currentTarget.dataset;
    const {
      value,
      label
    } = e.detail;
    this.setData({
      [`${key}Visible`]: false,
      [`${key}`]: value[0],
      [`${key}Value`]: value,
      [`${key}Title`]: label.join(' '),
      storeBtn: 2
    });
    this.loadGoodsList(true);
  },
  handleShowType() {
    this.setData({
      typeVisible: !this.data.typeVisible,
    });
  },
  onTypeChange(e) {
    const {
      key
    } = e.currentTarget.dataset;
    const {
      value,
      label
    } = e.detail;
    this.setData({
      [`${key}Visible`]: false,
      [`${key}`]: value[1],
      [`${key}Value`]: value,
      [`${key}Title`]: label.join('-'),
      storeBtn: 3
    });
    this.loadGoodsList(true);
  },
  onPickerTypeChange(e) {
    if (e.detail.column === 0) {
      this.setData({
        typeids: this.data.typeList.filter(item => item.pid === e.detail.value[0]),
      });
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
    var action = this.privateData.tabIndex;
    var searchname = this.data.searchname;
    var currentPage = this.data.currentPage;
    var region = this.data.region;
    var type = this.data.type;
    if (fresh) {
      pageIndex = 1;
    }

    try {
      const res = await this.fetchGoodsList(pageIndex, pageSize, action, currentPage, searchname, region, type);
      if (currentPage == 1) {
        if (res.code == 1) {
          let nextList = [];
          if (res.data.pros.length > 0) {
            nextList = res.data.pros;
            this.goodListPagination.index = pageIndex + 1;
          }
          this.setData({
            goodsList: fresh ? nextList : this.data.goodsList.concat(nextList),
          });
        }
      } else {
        if (res.code == 1) {
          let nextList = [];
          if (res.data.stores.length > 0) {
            nextList = res.data.stores;
            this.goodListPagination.index = pageIndex + 1;
          }
          const ptys = res.data.ptys;
          const topids = ptys.filter(item => item.pid === 0);
          const typeids = ptys.filter(item => item.pid === topids[0].value);
          this.setData({
            goodsList: fresh ? nextList : this.data.goodsList.concat(nextList),
            regionTypes: res.data.regions,
            typeList: ptys,
            topids: topids,
            typeids: typeids,
          });
        }
      }
      this.setData({
        goodsListLoadStatus: 0
      });

    } catch (err) {
      this.setData({
        goodsListLoadStatus: 0
      });
    }
  },
  fetchGoodsList(pageIndex, pageSize, action, currentPage, searchname, region = '', type = '') {
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
          'action': action,
          'currentPage': currentPage,
          'searchname': searchname,
          'region': region,
          'type': type
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
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res);
    }
    return {
      title: '开拍鱼',
      imageUrl: 'https://imgs.phanlink.com/program/images/banner1.png',
      path: '/pages/tabbar/home/home',
    }
  },
  onShareTimeline: function (res) {
    return {
      title: '开拍鱼',
      query: '/pages/tabbar/home/home',
      imageUrl: 'https://imgs.phanlink.com/program/images/banner1.png'
    }
  },
});