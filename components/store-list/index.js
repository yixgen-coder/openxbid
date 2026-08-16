const app = getApp()
Component({
  properties: {
    storesList: {
      type: Array,
      value: [],
    },
  },

  data: {
    globalLangData: app.globalData.languagePack,
  },

  lifetimes: {
    ready() {},
  },

  methods: {
    handleGoStores(e) {
      const {
        id
      } = e.currentTarget.dataset;
      wx.navigateTo({
        url: `/pages/store/pages/list/index?storeId=${id}`,
      });
    },
    handleGoStoresInfo(e) {
      const {
        id
      } = e.currentTarget.dataset;
      wx.navigateTo({
        url: `/pages/store/pages/info/index?storeId=${id}`,
      });
    },
  },
});