Page({
  data: {
    itemTitle: '商品中心',
    statusbar: '',
    jiaonangheight: '',
    loadStatus: 0,
    pageLoading: false,
    tabList: [{
      text: "综合",
      key: 1
    }, {
      text: "最新",
      key: 2
    }, {
      text: "热度",
      key: 3
    }, {
      text: "价格",
      key: 4
    }],
    goodsList: [],
    tabIndex: 1,
    num: 0,
    searchName: '',
    priceStatu: true,
    isShow: false,
    ftys: [],
    regions: [],
    filterValue: [0, 0, 0, 0, 0],
  },
  goodListPagination: {
    index: 1,
    num: 20,
  },

  handleShowFilter() {
    this.setData({
      isShow: !this.data.isShow,
    })
  },
  submitBJ(e) {

    const index = e.detail[0].index;
    const filterValue = e.detail[0].filterValue;
    this.handleShowFilter();
    if (index == 2) {
      this.setData({
        filterValue: filterValue,
        itemTitle: '商品中心',
      });
      this.fetchHomeDatas(true);
    }

  },
  tabChangeHandle(e) {
    const {
      value
    } = e.detail;
    const {
      priceStatu
    } = this.data;
    let tabIndex;
    if (value == 4) {
      if (priceStatu) {
        tabIndex = 4;
      } else {
        tabIndex = 5;
      }
      this.setData({
        tabIndex: tabIndex,
        priceStatu: !priceStatu
      })
    } else {
      this.setData({
        tabIndex: value,
      })
    }
    this.fetchHomeDatas(true);
  },
  onLoad(options) {
    console.log(options)
    if (options != {}) {
      let filterValue = this.data.filterValue;
      let itemTitle = this.data.itemTitle;
      if (options.fl) {
        const fl = options.fl;
        const flLValue = ['鱼品类', '甲壳类', '软体类', '其他类'];
        filterValue[4] = fl;
        itemTitle = flLValue[fl - 1];
      }
      if (options.lx) {
        const lx = options.lx;
        const lxValue = '求购信息';
        filterValue[0] = lx;
        itemTitle = lxValue;
      }
      if (options.dq) {
        const dq = options.dq;
        const dqValue = '爱尔兰';
        filterValue[3] = dq;
        itemTitle = dqValue;
      }
      this.setData({
        itemTitle: itemTitle,
        filterValue: filterValue
      });
    }
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
    if (searchName == '') {
      wx.showToast({
        title: '请输入关键词',
        icon: 'none',
        duration: 2000
      });
      return;
    }
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
      url: '/pages/goods/pages/index/index?spuId=' + id,
    });
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
    const url = 'https://kpy.phanlink.com/v1/getGoodsListDatas';
    const formData = {};
    formData.token = wx.getStorageSync('token');
    formData.limit = this.goodListPagination.num;
    formData.searchName = this.data.searchName;
    formData.page = fresh ? 1 : this.goodListPagination.index;
    formData.action = this.data.tabIndex;
    formData.lx = this.data.filterValue[0];
    formData.fl = this.data.filterValue[1];
    formData.xz = this.data.filterValue[2];
    formData.dq = this.data.filterValue[3];
    formData.top = this.data.filterValue[4];

    if (formData.action == 4) {
      formData.action = this.data.tabIndex;
    }
    try {
      const res = await this.fetchDatas(url, formData);
      if (res.code == 1) {
        const nextList = res.result.pros;
        this.setData({
          goodsList: fresh ? nextList : this.data.goodsList.concat(nextList),
          regions: res.result.regions,
          ftys: res.result.ftys,
        });
        if (nextList.length > 0) {
          this.goodListPagination.index = formData.page + 1;
          wx.showToast({
            title: res.msg,
            icon: 'loading',
            duration: 500
          });
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
})