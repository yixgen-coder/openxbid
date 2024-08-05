// pages/home/classify/components/bidding-popup/index.js
// import { getCategoryList } from '../../../../../services/good/fetchCategoryList';
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    list: [{
      name:'AA',
      groupId:'11',
      children:[{
        name:'女装',
        groupId:'11',
      }],
    },{
      name:'BB',
      groupId:'11',
      children:[{
        name:'女装',
        groupId:'11',
      }],
    }],
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

  }
})
