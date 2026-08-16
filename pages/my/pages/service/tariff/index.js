const app = getApp()
// [改动] 引入统一请求层 post()
const { post } = require('../../../../utils/request')
Page({
  data: {
    globalLangData: app.globalData.languagePack,
    itemTitle: app.globalData.languagePack.lang == 1 ? 'Duty' : '关税计算',
    statusbar: '',
    jiaonangheight: '',
    columns: [{
        title: app.globalData.languagePack.lang == 1 ? 'PCT' : 'HS码'
      },
      {
        title: app.globalData.languagePack.lang == 1 ? 'Latin name ' : '商品拉丁名'
      },
      {
        title: app.globalData.languagePack.lang == 1 ? 'Tariff' : '关税'
      },
      {
        title: app.globalData.languagePack.lang == 1 ? 'Name' : '商品名称'
      },
      // {
      //   title: app.globalData.languagePack.lang == 1 ? 'Nature' : '商品性质'
      // },
      {
        title: app.globalData.languagePack.lang == 1 ? 'Origin' : '原产地'
      }

    ],
    tableData: [],
    page: 0,
    totalPages: 0,
    hasMore: true,
    limit: 15,
    searchName: '',
    isExpanded: false, // 当前是否处于展开状态
    showButton: true // 是否显示展开/收起按钮
  },
  // 展开文本
  _expandText() {
    this.setData({
      isExpanded: true
    });
  },
  // 折叠文本（只显示前maxLines行）
  _collapseText() {
    this.setData({
      isExpanded: false
    });
  },
  // 切换展开/折叠状态
  toggleExpand() {
    if (this.data.isExpanded) {
      this._collapseText();
    } else {
      this._expandText();
    }
  },
  lookMore(e) {
    wx.showToast({
      title: e.currentTarget.dataset.title,
      icon: 'none',
      duration: 1500
    })
  },
  // 搜索输入
  onSearchInput: function (e) {
    this.setData({
      searchName: e.detail.value
    });
  },
  // 执行搜索
  onSearch: function () {
    this.loadData(1, true);
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    const res = wx.getMenuButtonBoundingClientRect();
    this.setData({
      statusbar: res.top, // 胶囊顶部高度
      jiaonangheight: res.height // 胶囊高度
    })
    this.loadData(1, true);
  },
  onShow() {

  },
  canGoBack: function () {
    const pages = getCurrentPages();
    const currentPageIndex = pages.length - 1;

    if (currentPageIndex > 0) {
      return true;
    } else {
      return false;
    }
  },
  goback: function () {
    if (this.canGoBack()) {
      wx.navigateBack({
        delta: 1
      });
    } else {
      wx.switchTab({
        url: '/pages/tabbar/home/home',
      });
    }
  },
  // [改动] 使用 post() 替代 fetchDatas，URL 去掉前缀
  loadData: async function (page, fresh = false) {
    const formData = {};
    formData.page = page ? page : this.data.page;
    formData.limit = this.data.limit;
    formData.searchName = this.data.searchName;
    try {
      const res = await post('/getSeviceT3Datas', formData, { showError: false });
      const newData = res.result;
      this.setData({
        tableData: fresh ? newData : this.data.tableData.concat(newData),
        page: this.data.page + 1,
      });
    } catch (res) {
      this.setData({
        hasMore: false
      });
    }


  },

  // 加载更多数据
  loadMoreData: function () {
    if (this.data.hasMore) {
      const nextPage = this.data.page + 1;
      this.loadData(nextPage);
    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    if (res.from === 'button') {

    }
    return {
      title: app.globalData.languagePack.lang == 1 ? 'Duty' : '关税计算',
      imageUrl: 'https://imgs.phanlink.com/uploads/20250531/275c65f988c3439fea60c86ba4df5c51.png',
      path: '/pages/my/pages/service/tariff/index',
    }
  },
  onShareTimeline: function (res) {

    return {
      title: app.globalData.languagePack.lang == 1 ? 'Duty' : '关税计算',
      imageUrl: 'https://imgs.phanlink.com/uploads/20250531/275c65f988c3439fea60c86ba4df5c51.png',
      path: '/pages/my/pages/service/tariff/index',
    }
  }
})