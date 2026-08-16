const app = getApp()
// [改动] 引入统一请求层 post()
const { post } = require('../../../utils/request')
const { requireLogin } = require('../../../services/auth')
Page({
  data: {
    globalLangData: app.globalData.languagePack,
    itemTitle: app.globalData.languagePack.info_dashboard,
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
      title: app.globalData.languagePack.reminder,
      content: app.globalData.languagePack.sure_delete,
      showCancel: true,
      cancelText: app.globalData.languagePack.cancel,
      confirmText: app.globalData.languagePack.sure,
      success: res => {
        if (res.confirm) {
          this.deleteData(key);
        }
      }
    });
  },
  deleteData: async function (id) {
    const tabIndex = this.data.tabIndex;
    // [改动] 使用 post() 替代 fetchDatas，URL 去掉前缀
    let url = '/setArtDelDatas';
    if (tabIndex == 2) {
      url = '/setDtDelDatas';
    }
    const formData = {};
    // [改动] 删除 formData.token = wx.getStorageSync('token')，post() 自动注入
    formData.goodsId = id;
    try {
      const res = await post(url, formData, { showError: false });
      this.setData({
        goodsList: this.data.goodsList.filter(item => item.id !== id),
        aCount: this.data.aCount > 0 ? (this.data.aCount - 1) : 0
      });
      wx.showToast({
        title: 'Success',
        icon: 'success',
        duration: 2000
      });
    } catch (res) {
      wx.showToast({
        title: 'Failed',
        icon: 'none',
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
    // console.log(111);
    if (fresh) {
      wx.pageScrollTo({
        scrollTop: 0,
      });
    }

    this.setData({
      loadStatus: 1
    });
    const tabIndex = this.data.tabIndex;
    // [改动] 使用 post() 替代 fetchDatas，URL 去掉前缀
    let url = '/getArtLists';
    if (tabIndex == 2) {
      url = '/getDtLists';
    }

    const formData = {};
    // [改动] 删除 formData.token = wx.getStorageSync('token')，post() 自动注入
    formData.limit = this.goodListPagination.num;
    formData.page = fresh ? 1 : this.goodListPagination.index;
    try {
      const res = await post(url, formData, { showError: false });
      const nextList = res.result.pros;
      this.setData({
        goodsList: fresh ? nextList : this.data.goodsList.concat(nextList),
        aCount: res.result.aCount,
      });
      if (nextList.length > 0) {
        this.goodListPagination.index = formData.page + 1;
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
  onPullDownRefresh() {
    this.fetchHomeDatas(true);
    wx.stopPullDownRefresh();
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