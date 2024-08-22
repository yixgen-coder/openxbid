Page({
  data: {
    itemTitle: '我的收藏',
    statusbar: '',
    jiaonangheight: '',
    loadStatus: 0,
    pageLoading: false,
    tabList: [{
      text: "收藏的商品",
      key: 3
    }, {
      text: "收藏的文章",
      key: 6
    }],
    goodsList: [],
    tabIndex: 3,
    num: 0,
  },
  goodListPagination: {
    index: 1,
    num: 20,
  },
  tabChangeHandle(e) {
    this.setData({
      tabIndex: e.detail.value
    })
    this.fetchHomeDatas(true);
  },
  onLoad(options) {
    this.init();
  },
  goback: function () {
    wx.navigateBack({
      delta: 1
    });
  },
  goodListClickHandle(e) {
    wx.navigateTo({
      url: '/pages/goods/pages/index/index?spuId=' + e.detail.key,
    });
  },

  init() {
    let token = wx.getStorageSync('token');
    if (!token) {
      // 用户未登录，跳转到登录页面
      wx.navigateTo({
        url: '/pages/tabbar/login/login',
      });
    }
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
    const url = 'https://kpy.phanlink.com/v1/getOrderDatas';
    const formData = {};
    formData.token = wx.getStorageSync('token');
    formData.limit = this.goodListPagination.num;
    formData.page = fresh ? 1 : this.goodListPagination.index;

    formData.action = this.data.tabIndex;
    try {
      const res = await this.fetchDatas(url, formData);
      if (res.code == 1) {
        const nextList = res.result;
        this.setData({
          goodsList: fresh ? nextList : this.data.goodsList.concat(nextList),
        });
        this.goodListPagination.index = formData.page + 1;
      }
      this.setData({
        loadStatus: 0
      });
      wx.showToast({
        title: res.msg,
        icon: 'loading',
        duration: 500
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