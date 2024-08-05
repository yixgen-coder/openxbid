import { fetchHome } from '../../services/home/home';
import { fetchGoodsList } from '../../services/good/fetchGoods';
// import Toast from 'pages/serve/node_modules/tdesign-miniprogram/toast/index';

Page({
  data: {
    list: [],
    tabList: [{text: "商家社区",key: 0},{text: "行业资讯",key: 1},{text: "价格走势",key: 2},{text: "政府法规",key: 3}],
    pageLoading: false,
    goodsList: [],
    goodsListLoadStatus: 0,
    current: 1,
    statusbar:'',
    jiaonangheight:'',
    num:0,
    tabCurrent:0,
    newsTabCurrent:0,
  },

  goodListPagination: {
    index: 0,
    num: 20,
  },

  privateData: {
    tabIndex: 0,
  },


  async init() {
    const res = wx.getMenuButtonBoundingClientRect()
    this.setData({
        statusbar :res.top, // 胶囊顶部高度
        jiaonangheight: res.height  // 胶囊高度
    })
  
    this.loadHomePage();
  },

  loadHomePage() {
    wx.stopPullDownRefresh();

    this.setData({
      pageLoading: true,
    });
    fetchHome().then(({ swiper }) => {
      this.setData({
        imgSrcs: swiper,
        pageLoading: false,
      });
      this.loadGoodsList(true);
    });
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

    this.setData({ goodsListLoadStatus: 1 });

    const pageSize = this.goodListPagination.num;
    let pageIndex = this.privateData.tabIndex * pageSize + this.goodListPagination.index + 1;
    if (fresh) {
      pageIndex = 0;
    }

    try {
      const nextList = await fetchGoodsList(pageIndex, pageSize);
      this.setData({
        goodsList: fresh ? nextList : this.data.goodsList.concat(nextList),
        goodsListLoadStatus: 0,
      });

      this.goodListPagination.index = pageIndex;
      this.goodListPagination.num = pageSize;
    } catch (err) {
      this.setData({ goodsListLoadStatus: 3 });
    }
  },

  onPullDownRefresh() {
    this.init();
  },

  onShow() {
    let token = wx.getStorageSync('token');
    if (!token) {
      // 用户未登录，跳转到登录页面
      wx.navigateTo({
        url: '/pages/tabbar/login/login',
      });
    }
    this.getTabBar().init();
  },
  onChange() {
    wx.navigateTo({
      url: '/pages/goods/list/index',
    });
  },
  onLoad() {
    this.init(true);
  },
  // 切换消息和资讯
  changleTabHandle(e){
    console.log('e',e)
      this.setData({
        tabCurrent:e.currentTarget.dataset.myparam
      })
  },
// 资讯切换
  tabChangeHandle(e) {
    console.log(e)
    this.setData({
      newsTabCurrent:e.detail.value
    })
    this.privateData.tabIndex = e.detail;
    this.loadGoodsList(true);
  },
});
