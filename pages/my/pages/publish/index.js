Page({
  data: {
    itemTitle: '我的发布',
    statusbar: '',
    jiaonangheight: '',
    loadStatus: 0,
    pageLoading: false,
    goodsList: [],
    tabIndex: 1,
    num: 0,
    aCount: 0,
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

  handleGoArtAdd(e) {
    const {
      key
    } = e.currentTarget.dataset;
    const tabIndex = this.data.tabIndex;
    if (tabIndex == 1) {
      wx.navigateTo({
        url: '/pages/news/pages/artadd/index?artId=' + key,
      });
    } else {
      wx.navigateTo({
        url: '/pages/news/pages/dtadd/index?dtId=' + key,
      });
    }

  },

  handleGoArtDel: function (e) {
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
    const tabIndex = this.data.tabIndex;
    let url = 'https://kpy.phanlink.com/v1/setArtDelDatas';
    if (tabIndex == 2) {
      url = 'https://kpy.phanlink.com/v1/setDtDelDatas';
    }
    const formData = {};
    formData.token = wx.getStorageSync('token');
    formData.goodsId = id;
    const res = await this.fetchDatas(url, formData);
    if (res.code == 1) {
      this.setData({
        goodsList: this.data.goodsList.filter(item => item.id !== id),
        aCount: this.data.aCount > 0 ? (this.data.aCount - 1) : 0
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
  onLoad() {
    this.init();
  },
  previewImage(e) {
    const current = e.currentTarget.dataset.src;
    const index = e.currentTarget.dataset.index;
    wx.previewImage({
      current: current,
      urls: this.data.goodsList[index].pic.map(row => row.url)
    });
  },
  goback: function () {
    wx.navigateBack({
      delta: 1
    });
  },
  goodListClickHandle(e) {

    wx.navigateTo({
      url: '/pages/news/pages/art/index?artId=' + e.currentTarget.dataset.key,
    });
  },
  dtPLListClickHandle(e) {
    wx.navigateTo({
      url: '/pages/news/pages/dt/index?dtId=' + e.currentTarget.dataset.key,
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
    console.log(111);
    if (fresh) {
      wx.pageScrollTo({
        scrollTop: 0,
      });
    }

    this.setData({
      loadStatus: 1
    });
    const tabIndex = this.data.tabIndex;
    let url = 'https://kpy.phanlink.com/v1/getArtLists';
    if (tabIndex == 2) {
      url = 'https://kpy.phanlink.com/v1/getDtLists';
    }

    const formData = {};
    formData.token = wx.getStorageSync('token');
    formData.limit = this.goodListPagination.num;
    formData.page = fresh ? 1 : this.goodListPagination.index;
    try {
      const res = await this.fetchDatas(url, formData);
      if (res.code == 1) {
        const nextList = res.result.pros;
        this.setData({
          goodsList: fresh ? nextList : this.data.goodsList.concat(nextList),
          aCount: res.result.aCount,
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