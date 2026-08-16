const app = getApp()
const { post } = require('../../../../../utils/request')
const { requireLogin } = require('../../../../../services/auth')
Page({
  data: {
    globalLangData: app.globalData.languagePack,
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
  filterEmojis(input) {
    // 使用正则表达式匹配表情符号
    return input.replace(/[\uD83C-\uDBFF\uDC00-\uDFFF]+/g, '');
  },
  handleChatValue(e) {
    let {
      value
    } = e.detail;
    this.setData({
      msg: this.filterEmojis(value)
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
    // [改动] checkToken() → requireLogin()
    if (!requireLogin()) return;
    // [改动] fetchDatas → post()
    try {
      const res = await post('/setChatMsg', { msg: this.data.msg, uId: this.data.uId, storeId: this.data.storeId }, { showError: false });
      const nextList = res.result;
      this.setData({
        goodsList: this.data.goodsList.concat(nextList),
        msg: '',
        send: 0
      });
      this.scrollToBottom();
    } catch (res) {
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

    const page = fresh ? 1 : this.goodListPagination.index;
    // [改动] fetchDatas → post()
    try {
      const res = await post('/chat', {
        action: this.data.newsTabCurrent,
        limit: this.goodListPagination.num,
        uId: this.data.uId,
        storeId: this.data.storeId,
        page,
        lang: app.globalData.languagePack.lang
      }, { showError: false });
      const nextList = res.result;
      if (nextList.length > 0) {
        this.goodListPagination.index = page + 1;
      }
      this.setData({
        goodsList: fresh ? nextList : nextList.concat(this.data.goodsList),
        itemTitle: res.itemTitle
      });
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
    // [改动] wx.getStorageSync('token') + navigateTo → requireLogin()
    if (!requireLogin()) return;
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
});