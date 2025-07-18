const app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    ftys: {
      type: Array,
    },
    regions: {
      type: Array,
    },
    filterValue: {
      type: Array,
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    sideBarIndex: 0,
    globalLangData: app.globalData.languagePack,
    categories: [{
        label: app.globalData.languagePack.commodity_type
      }, {
        label: app.globalData.languagePack.type
      },
      {
        label: app.globalData.languagePack.product_type
      },
      {
        label: app.globalData.languagePack.region
      },
    ],
  },

  /**
   * 组件的方法列表
   */
  attached() {

  },

  methods: {
    onSideBarChange(e) {
      this.setData({
        sideBarIndex: e.detail.value
      });
    },
    handleFilterValue(e) {
      const {
        index,
        value
      } = e.currentTarget.dataset;
      let filterValue = this.data.filterValue;
      filterValue[index] = value;
      this.setData({
        filterValue: filterValue
      });
    },
    cancel() {
      this.setData({
        filterValue: [0, 0, 0, 0]
      });
    },
    submitBJ(e) {
      const {
        index
      } = e.currentTarget.dataset;
      this.triggerEvent('submitBJ', [{
        index: index,
        filterValue: this.data.filterValue
      }]);
    }
  }
})