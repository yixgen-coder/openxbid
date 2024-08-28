Page({
  data: {
    itemTitle: '商品',
    statusbar: '',
    jiaonangheight: '',
    loadStatus: 0,
    pageLoading: false,
    typeText: "出售中",
    goodsList: [],
    tabIndex: 1,
    num: 0,
    btype: 1,
    scount: 0,
    ecount: 0,
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
  handleGoOffer(e) {
    const {
      key
    } = e.currentTarget.dataset;
    wx.navigateTo({
      url: '/pages/goods/pages/offer/index?goodsId=' + key,
    });
  },
  handleGoGoodsAdd(e) {
    const {
      key
    } = e.currentTarget.dataset;
    wx.navigateTo({
      url: '/pages/goods/pages/add/index?goodsId=' + key,
    });
  },

  handleGoGoodsDel: function (e) {
    const {
      key
    } = e.currentTarget.dataset;
    // 显示确认提示框
    wx.showModal({
      title: '提示',
      content: '确定要删除吗？',
      showCancel: true,
      cancelText: '取消',
      confirmText: '确定',
      success: res => {
        if (res.confirm) {
          this.deleteData(key);
        }
      }
    });
  },
  deleteData: async function (id) {
    const url = 'https://kpy.phanlink.com/v1/setGoodsDelDatas';
    const formData = {};
    formData.token = wx.getStorageSync('token');
    formData.goodsId = id;
    const res = await this.fetchDatas(url, formData);
    if (res.code == 1) {
      this.setData({
        goodsList: this.data.goodsList.filter(item => item.id !== id)
      });
      wx.showToast({
        title: '删除成功',
        icon: 'success',
        duration: 2000
      });
    } else {
      wx.showToast({
        title: '删除失败',
        icon: 'loading',
        duration: 2000
      });
    }

  },
  onLoad(options) {
    if (options.btype) {
      const btype = options.btype;
      if (btype == 2) {
        this.setData({
          typeText: "求购中",
          btype: 2,
          itemTitle: '求购'
        })
      }
    }

    this.init();
  },
  goback: function () {
    wx.navigateBack({
      delta: 1
    });
  },
  goodListClickHandle(e) {
    wx.navigateTo({
      url: '/pages/goods/pages/index/index?spuId=' + e.currentTarget.dataset.key,
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
    const url = 'https://kpy.phanlink.com/v1/getGoodsLists';
    const formData = {};
    formData.token = wx.getStorageSync('token');
    formData.limit = this.goodListPagination.num;
    formData.btype = this.data.btype;
    formData.action = this.data.tabIndex;
    formData.page = fresh ? 1 : this.goodListPagination.index;

    formData.action = this.data.tabIndex;
    try {
      const res = await this.fetchDatas(url, formData);
      if (res.code == 1) {
        const nextList = res.result.pros;
        this.setData({
          goodsList: fresh ? nextList : this.data.goodsList.concat(nextList),
          ecount: res.result.ecount,
          scount: res.result.scount,
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