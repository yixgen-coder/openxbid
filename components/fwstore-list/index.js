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
  },

  data: {
    tabCurrent: 0,
    regionVisible: false,
    regionValue: [0],
    regionTitle: '地区筛选'
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
        [`${key}Title`]: value[0] == 0 ? '地区筛选' : label.join(' '),
      });
      this.triggerEvent('region', {
        region: value[0]
      });
    },
  },
});