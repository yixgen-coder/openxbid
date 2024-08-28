Page({
  data: {
    itemTitle: '商品中心',
    statusbar: '',
    jiaonangheight: '',
    loadStatus: 0,
    pageLoading: false,
    tabList: [{
      text: "商品",
      key: 1
    }, {
      text: "求购",
      key: 2
    }, {
      text: "评价",
      key: 3
    }, {
      text: "动态",
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
      wx.showToast({
        title: res.msg,
        icon: 'success',
        duration: 2000
      });

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

    try {
      const res = await this.fetchDatas(url, formData);
      if (res.code == 1) {
        const nextList = res.result.pros;
        this.setData({
          goodsList: fresh ? nextList : this.data.goodsList.concat(nextList),
          storeInfo: res.result.storeInfo
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