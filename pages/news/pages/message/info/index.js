Page({
  data: {
    statusbar: "",
    jiaonangheight: "",
    pageLoading: false,
    goodsList: [],
    goodsListLoadStatus: 0,
  },
  goodListPagination: {
    index: 0,
    num: 20,
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

    let url = 'https://kpy.phanlink.com/v1/getMySysInfos';

    const formData = {};
    formData.token = wx.getStorageSync('token');
    formData.action = this.data.newsTabCurrent;
    formData.limit = this.goodListPagination.num;
    formData.page = fresh ? 1 : this.goodListPagination.index;

    try {
      const res = await this.fetchDatas(url, formData);
      const nextList = res.result;
      if (res.code == 1) {
        if (nextList.length > 0) {
          this.goodListPagination.index = formData.page + 1;
        }
        this.setData({
          goodsList: fresh ? nextList : this.data.goodsList.concat(nextList),
        });
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
  },

 

  onLoad() {
    let token = wx.getStorageSync('token');
    if (!token) {
      // 用户未登录，跳转到登录页面
      wx.navigateTo({
        url: '/pages/tabbar/login/login',
      });
    }
    this.init(true);
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
})