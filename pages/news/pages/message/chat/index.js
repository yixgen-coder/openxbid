Page({
  data: {
    pageLoading: false,
    goodsList: [],
    goodsListLoadStatus: 0,
    statusbar: '',
    jiaonangheight: '',
    itemTitle: '',
    scrollHeight: 0,
    uId: 0,
    storeId: 0,
    send: 0,
    msg: ''
  },

  goodListPagination: {
    index: 0,
    num: 20,
  },

  privateData: {
    tabIndex: 0,
  },
  handleChatValue(e) {
    let {
      value
    } = e.detail;
    this.setData({
      msg: value
    });
    if (value != '') {
      this.setData({
        send: 1
      });
    } else {
      this.setData({
        send: 0
      });
    }
  },
  handleChatSubmit: async function (e) {
    const formData = {};
    formData.msg = this.data.msg;
    formData.uId = this.data.uId;
    formData.storeId = this.data.storeId;
    formData.token = wx.getStorageSync('token');

    const url = 'https://kpy.phanlink.com/v1/setChatMsg';
    const res = await this.fetchDatas(url, formData);
    if (res.code == 1) {
      const nextList = res.result;
      this.setData({
        goodsList: this.data.goodsList.concat(nextList),
        msg: '',
        send: 0
      });
      this.scrollToBottom();
    } else {
      wx.showToast({
        title: res.msg,
        icon: 'none',
        duration: 2000
      });
    }
  },
  scrollToBottom: function () {
    // 获取滚动区域的高度
    const query = wx.createSelectorQuery().in(this);
    query.select('.chat-scroll').boundingClientRect(rect => {
      if (rect) {
        wx.pageScrollTo({
          scrollTop: rect.height,
          duration: 100,
        });
      }
    }).exec();
  },

  async init() {
    const res = wx.getMenuButtonBoundingClientRect()
    this.setData({
      statusbar: res.top, // 胶囊顶部高度
      jiaonangheight: res.height // 胶囊高度
    })

    this.loadHomePage();
  },
  handleGoGoods(e) {
    wx.navigateTo({
      url: '/pages/goods/pages/index/index?spuId=' + e.currentTarget.dataset.id,
    });
  },
  loadHomePage() {
    //wx.stopPullDownRefresh();
    this.loadGoodsList(true);

  },

  // onReachBottom() {
  //   if (this.data.goodsListLoadStatus === 0) {
  //     this.loadGoodsList();
  //   }
  // },

  async loadGoodsList(fresh = false) {
    if (fresh) {
      wx.pageScrollTo({
        scrollTop: 0,
      });
    }

    this.setData({
      goodsListLoadStatus: 1
    });

    let url = 'https://kpy.phanlink.com/v1/chat';

    const formData = {};
    formData.token = wx.getStorageSync('token');
    formData.action = this.data.newsTabCurrent;
    formData.limit = this.goodListPagination.num;
    formData.uId = this.data.uId;
    formData.storeId = this.data.storeId;
    formData.page = fresh ? 1 : this.goodListPagination.index;

    try {
      const res = await this.fetchDatas(url, formData);
      const nextList = res.result;
      if (res.code == 1) {
        if (nextList.length > 0) {
          this.goodListPagination.index = formData.page + 1;
        }
        this.setData({
          goodsList: fresh ? nextList : nextList.concat(this.data.goodsList),
          itemTitle: res.itemTitle
        });
      }
      this.setData({
        goodsListLoadStatus: 0
      });
      this.scrollToBottom();
    } catch (err) {
      this.setData({
        goodsListLoadStatus: 3
      });
    }
  },
  goback: function () {
    wx.navigateBack({
      delta: 1
    });
  },
  onPullDownRefresh() {
    if (this.data.goodsListLoadStatus === 0) {
      this.loadGoodsList();
    }
  },


  onLoad(options) {
    let token = wx.getStorageSync('token');
    if (!token) {
      // 用户未登录，跳转到登录页面
      wx.navigateTo({
        url: '/pages/tabbar/login/login',
      });
    }
    if (options.uId > 0) {
      this.setData({
        uId: options.uId
      });
    }
    if (options.storeId > 0) {
      this.setData({
        storeId: options.storeId
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
});