const app = getApp()
Component({
  externalClasses: ['wr-class'],

  properties: {
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
    onClickDelOrders(e) {
      const {
        key
      } = e.currentTarget.dataset;
      this.triggerEvent('delOrders', {
        key
      });
    },
    handleGoOffer(e) {
      const {
        key
      } = e.currentTarget.dataset;
      wx.navigateTo({
        url: '/pages/goods/pages/offer/index?goodsId=' + key,
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