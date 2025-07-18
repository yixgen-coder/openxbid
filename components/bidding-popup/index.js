// pages/home/classify/components/bidding-popup/index.js
// import { getCategoryList } from '../../../../../services/good/fetchCategoryList';
const app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    goodsspec: {
      type: Object,
      value: {},
    },
    total: {
      type: Object,
      value: {},
    },

  },

  /**
   * 组件的初始数据
   */
  data: {
    globalLangData: app.globalData.languagePack,
  },

  /**
   * 组件的方法列表
   */
  attached() {
    console.log('result')
    // this.init(true);
  },
  // async init() {
  //   try {
  //     const result = await getCategoryList();
  //     console.log('result',result)
  //     this.setData({
  //       list: result,
  //     });
  //   } catch (error) {
  //     console.error('err:', error);
  //   }
  // },
  methods: {
    gginput(e) {
      const gg = e.detail[0].gg;

      this.triggerEvent('ggainput', [{
        gg: e.detail[0].gg
      }]);
    },
    cancel(e) {
      this.triggerEvent('cancel', []);
    },
    submitBJ() {
      this.triggerEvent('submitBJ', []);
    }
  }
})