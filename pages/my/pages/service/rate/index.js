const app = getApp()
// [改动] 引入统一请求层 post()
const { post } = require('../../../../utils/request')
Page({
  data: {
    globalLangData: app.globalData.languagePack,
    itemTitle: app.globalData.languagePack.lang == 1 ? 'Exchange' : '汇率查询',
    statusbar: '',
    jiaonangheight: '',
    columns: [{
        key: 'id',
        title: '货币名称'
      },
      {
        key: 'name',
        title: '银行卖出价'
      },
      {
        key: 'age',
        title: '银行买入价'
      },
      // {
      //   key: 'department',
      //   title: '参考价'
      // },
      {
        key: 'position',
        title: '更新时间'
      }
    ],
    tableData: {},
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
    this.loadData();
  },
  onShow() {},

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
  loadData: async function () {
    try {
      const res = await post('/getSeviceT1Datas', {}, { showError: false });
      this.setData({
        tableData: res.result
      });
    } catch (res) {
      wx.showModal({
        title: app.globalData.languagePack.reminder,
        content: res.msg,
        showCancel: false,
        confirmText: app.globalData.languagePack.sure,
        success: rs => {
          if (rs.confirm) {
            wx.navigateBack({
              delta: 1
            });
          }
        }
      });
    }


  },

  // 加载更多数据
  loadMoreData: function () {
    if (this.data.hasMore) {
      const nextPage = this.data.currentPage + 1;
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
      title: app.globalData.languagePack.lang == 1 ? 'Exchange' : '汇率查询',
      imageUrl: 'https://imgs.phanlink.com/uploads/20250531/51495ebf14934b171846abc1398552e8.png',
      path: '/pages/my/pages/service/rate/index',
    }
  },
  onShareTimeline: function (res) {

    return {
      title: app.globalData.languagePack.lang == 1 ? 'Exchange' : '汇率查询',
      imageUrl: 'https://imgs.phanlink.com/uploads/20250531/51495ebf14934b171846abc1398552e8.png',
      path: '/pages/my/pages/service/rate/index',
    }
  }
})