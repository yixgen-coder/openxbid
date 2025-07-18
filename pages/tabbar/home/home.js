const app = getApp()
Page({
  data: {
    globalLangData: app.globalData.languagePack,
    imgSrcs: [],
    nav: [],
    tabList: [{
      text: app.globalData.languagePack.recommended,
      key: 0
    }, {
      text: app.globalData.languagePack.new,
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
    placeholder: app.globalData.languagePack.keywords,
    region: '', //国家
    regionValue: [0],
    regionTitle: app.globalData.languagePack.country,
    regionVisible: false,
    regionTypes: [{
      label: app.globalData.languagePack.all,
      value: 0
    }],
    type: '', //行业分类
    typeTitle: app.globalData.languagePack.main_products, //行业分类
    typeVisible: false,
    typeValue: [0, 0],
    typeList: [],
    topids: [{
      label: app.globalData.languagePack.all,
      value: 0
    }],
    typeids: [{
      label: app.globalData.languagePack.all,
      value: 0
    }],
    artTitle: '',
    artUrl: '',
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
    this.getMessageCount();
    this.init();
  },
  navToActivityDetail(e) {
    const index = e.detail.index;
    const imgSrcs = this.data.imgSrcs;
    if (imgSrcs[index].ariaLabel != null) {
      wx.navigateTo({
        url: imgSrcs[index].ariaLabel,
      });
    }
  },
  async getMessageCount() {
    const url = 'https://kpy.phanlink.com/v1/getMessageCounts';
    const formData = {};
    formData.token = wx.getStorageSync('token');
    const res = await this.fetchDatas(url, formData);
    if (res.code == 1) {
      this.getTabBar().init(res.result.messageCount);
    }
  },
  onLoad() {
    console.log(this.data.globalLangData);
    this.init();
  },
  onReachBottom() {
    if (this.data.goodsListLoadStatus === 0) {
      this.loadGoodsList();
    }
  },

  onPullDownRefresh() {
    this.init();
    wx.stopPullDownRefresh();
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
    this.loadGoodsList(true);
  },
  handleGoArt(e) {
    const artUrl = this.data.artUrl;
    wx.navigateTo({
      url: artUrl,
    });
  },
  handleShowPage(e) {
    const {
      index
    } = e.currentTarget.dataset;
    this.setData({
      currentPage: index,
      searchName: '',
      placeholder: index == 2 ? app.globalData.languagePack.enter_shop_name : app.globalData.languagePack.keywords
    });
    this.loadGoodsList(true);
  },
  tabChangeHandle(e) {
    //console.log(e)
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
      typeTitle: app.globalData.languagePack.main_products,
      regionTitle: app.globalData.languagePack.country,
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
      [`${key}Title`]: value[0] == 0 ? app.globalData.languagePack.country : label.join(' '),
      storeBtn: value[0] == 0 ? 1 : 2,
    });
    this.loadGoodsList(true);
  },
  handleShowType(e) {

    let value = this.data.typeValue[0];

    this.setData({
      typeids: value == 0 ? [{
        label: '全部',
        value: 0
      }] : this.data.typeList.filter(item => item.pid === value),
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
      [`${key}Title`]: value[0] == 0 ? app.globalData.languagePack.main_products : label.join(' '),
      storeBtn: value[0] == 0 ? 1 : 3,
    });
    this.loadGoodsList(true);
  },
  onPickerTypeChange(e) {
    let value = e.detail.value[0];
    if (e.detail.column === 0) {
      this.setData({
        typeids: value == 0 ? [{
          label: app.globalData.languagePack.all,
          value: 0
        }] : this.data.typeList.filter(item => item.pid === value),
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
    var searchname = this.data.searchName;
    var currentPage = this.data.currentPage;
    var region = this.data.region;
    var type = this.data.type;
    var lang = this.data.globalLangData.lang;
    if (fresh) {
      pageIndex = 1;
    }

    try {
      const res = await this.fetchGoodsList(pageIndex, pageSize, action, currentPage, searchname, region, type, lang);
      let nav = res.data.nav;
      let art_title = res.data.program_art_title;
      let art_url = res.data.program_art_url;
      let imgSrcs = res.data.imgs;
      this.setData({
        nav: nav,
        artTitle: art_title,
        artUrl: art_url,
        imgSrcs: imgSrcs,
      });
      if (currentPage == 1) {
        if (res.code == 1) {
          let nextList = [];
          if (res.data.pros && res.data.pros.length > 0) {
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
          //const typeids = ptys.filter(item => item.pid === topids[0].value);
          this.setData({
            goodsList: fresh ? nextList : this.data.goodsList.concat(nextList),
            regionTypes: [{
              label: app.globalData.languagePack.all,
              value: 0
            }].concat(res.data.regions),
            typeList: ptys,
            topids: [{
              label: app.globalData.languagePack.all,
              value: 0
            }].concat(topids),
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
  fetchGoodsList(pageIndex, pageSize, action, currentPage, searchname, region = '', type = '', lang = 2) {
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
          'type': type,
          'lang': lang
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
      title: app.globalData.languagePack.lang==1?'Global Seafood Real-time Quotation System':'全球海鲜实时报价系统',
      imageUrl: 'https://imgs.phanlink.com/program/images/ava/1.jpg',
      path: '/pages/tabbar/home/home',
    }
  },
  onShareTimeline: function (res) {
    return {
      title: app.globalData.languagePack.lang==1?'Global Seafood Real-time Quotation System':'全球海鲜实时报价系统',
      query: '',
      imageUrl: 'https://imgs.phanlink.com/program/images/ava/1.jpg'
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
});