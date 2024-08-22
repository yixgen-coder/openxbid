Component({
  properties: {
    storesList: {
      type: Array,
      value: [],
    },
  },

  data: {

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
        url: `/pages/store/pages/info/index?storeId=${id}`,
      });
    },
  },
});