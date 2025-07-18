
const app = getApp()
Component({
  externalClasses: ['wr-class'],

  properties: {
    goodsList: {
      type: Array,
      value: [],
    },
    regions: {
      type: Array,
      value: [],
    },
    storenavs: {
      type: Array,
      value: [],
    },
  },

  data: {
    globalLangData: app.globalData.languagePack,
    tabCurrent: 0,
    regionVisible: false,
    regionValue: [0],
    regionTitle: app.globalData.languagePack.region_filter
  },

  lifetimes: {
    ready() {

    },
  },

  methods: {
    handleGoStoreInfo(e) {
      const {
        id
      } = e.currentTarget.dataset;
      wx.navigateTo({
        url: `/pages/store/pages/info/index?storeId=${id}`,
      });
    },
    onTabsClick(e) {
      const {
        value
      } = e.detail;
      this.setData({
        tabCurrent: value,
      });
      this.triggerEvent('click', {
        fwTypeValue: value
      });
    },
    handleShowPicker() {
      this.setData({
        regionVisible: !this.data.regionVisible,
      });
    },
    onPickerChange(e) {
      const {
        key
      } = e.currentTarget.dataset;
      const {
        value,
        label
      } = e.detail;
      this.setData({
        [`${key}Visible`]: false,
        [`${key}Value`]: value,
        [`${key}Title`]: value[0] == 0 ? app.globalData.languagePack.region_filter : label.join(' '),
      });
      this.triggerEvent('region', {
        region: value[0]
      });
    },
  },
});