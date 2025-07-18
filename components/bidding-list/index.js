const app = getApp()
Component({
  externalClasses: ['wr-class'],

  properties: {
    tabIndex: {
      type: Number,
      value: 0,
    },
    goodsList: {
      type: Array,
      value: [],
    },
    id: {
      type: String,
      value: '',
      observer: (id) => {
        this.genIndependentID(id);
      },
    },
    thresholds: {
      type: Array,
      value: [],
    },
  },

  data: {
    globalLangData: app.globalData.languagePack,
    independentID: '',
  },

  lifetimes: {
    ready() {
      this.init();
    },
  },

  methods: {
    onClickGoods(e) {
      const {
        key
      } = e.currentTarget.dataset;
      wx.navigateTo({
        url: '/pages/goods/pages/index/index?spuId=' + key,
      });
    },
    onClickStoreInfos(e) {
      const {
        key
      } = e.currentTarget.dataset;
      wx.navigateTo({
        url: '/pages/store/pages/info/index?storeId=' + key,
      });
    },
    onClickDelOrders(e) {
      const {
        key
      } = e.currentTarget.dataset;
      this.triggerEvent('delOrders', {
        key
      });
    },
    onClickOrders(e) {
      const {
        key
      } = e.currentTarget.dataset;
      wx.navigateTo({
        url: '/pages/goods/pages/info/index?ordId=' + key,
      });
    },

    init() {
      this.genIndependentID(this.id || '');
    },

    genIndependentID(id) {
      if (id) {
        this.setData({
          independentID: id
        });
      } else {
        this.setData({
          independentID: `goods-list-${~~(Math.random() * 10 ** 8)}`,
        });
      }
    },
  },
});