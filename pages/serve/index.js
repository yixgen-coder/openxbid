import { fetchHome } from '../../services/home/home';
import { fetchGoodsList } from '../../services/good/fetchGoods';
import Toast from 'tdesign-miniprogram/toast';

Page({
  data: {
    list: [],
    tabList: [{text: "参与竞价",key: 0},{text: "竞价成功",key: 1},{text: "关注商家",key: 2},{text: "收藏商品",key: 3}],
    pageLoading: false,
    goodsList: [],
    goodsListLoadStatus: 0,
    current: 1,
    statusbar:'',
    jiaonangheight:'',
    num:0,
    tabIndex:0,
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
  tabChangeHandle(e) {
    this.setData({
      tabIndex:e.detail.value
    })
    this.privateData.tabIndex = e.detail;
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
});
