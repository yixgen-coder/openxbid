const app = getApp()
// [改动] 引入统一请求层 post()
const { post } = require('../../../../utils/request')
const { requireLogin } = require('../../../../services/auth')
Page({
  data: {
    globalLangData: app.globalData.languagePack,
    itemTitle: app.globalData.languagePack.lang == 1 ? 'Review details' : '审核详情',
    statusbar: '',
    jiaonangheight: '',
    loadStatus: 0,
    pageLoading: false,
    goodsList: [],
    imgsList: [],
    tabIndex: 1,
    reviewId: 0,
    loadStatus: 0,
  },


  onLoad(options) {
    if (options.type) {
      this.setData({
        tabIndex: options.type
      });
    }
    if (options.id) {
      this.setData({
        reviewId: options.id
      });
    }
    this.init();
  },
  goback: function () {
    wx.navigateBack({
      delta: 1
    });
  },
  // 预览图片
  previewImage(e) {
    const index = e.currentTarget.dataset.index;
    const urls = this.data.tabIndex == 2 ? this.data.goodsList.zl.map(img => img.url) : this.data.goodsList.company_type == 2 ? this.data.goodsList.qy_infos.imgsList.map(img => img.url) : this.data.goodsList.gr_infos.imgsList.map(img => img.url);

    wx.previewImage({
      current: urls[index],
      urls: urls
    });
  },
  init() {
    // [改动] wx.getStorageSync('token') + showModal → requireLogin()
    if (!requireLogin()) return;
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

    // [改动] 使用 post() 替代 fetchDatas，URL 去掉前缀
    const formData = {};
    // [改动] 删除 formData.token = wx.getStorageSync('token')，post() 自动注入
    formData.type = this.data.tabIndex;
    formData.id = this.data.reviewId;
    formData.lang = app.globalData.languagePack.lang;
    try {
      const res = await post('/getReviewDetail', formData, { showError: false });
      this.setData({
        goodsList: res.result,
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
  loadHomePage() {
    wx.stopPullDownRefresh();
    this.fetchHomeDatas(true);
  },
})