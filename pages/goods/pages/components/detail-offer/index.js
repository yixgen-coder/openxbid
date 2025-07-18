// pages/home/classify/components/detail-image/index.js
const app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    goodsOffer: {
      type: Object,
      value: {},
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    visible: false,
    orderSpec: [],
    orderQuantity: '',
    orderWeight: '',
    orderTotal: '',
    globalLangData: app.globalData.languagePack,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    cancel() {
      this.setData({
        visible: !this.data.visible,
        orderSpec: [],
        orderQuantity: '',
        orderWeight: '',
        orderTotal: '',
      });
    },
    handleShowOfferInfo(e) {
      const index = e.currentTarget.dataset.key;
      const orderSpec = JSON.parse(this.data.goodsOffer[index].orderSpec);
      const orderQuantity = this.data.goodsOffer[index].orderQuantity;
      const orderWeight = this.data.goodsOffer[index].orderWeight;
      const orderTotal = this.data.goodsOffer[index].orderTotal;

      this.setData({
        visible: !this.data.visible,
        orderSpec: orderSpec,
        orderQuantity: orderQuantity,
        orderWeight: orderWeight,
        orderTotal: orderTotal,
      });
    }
  }
})