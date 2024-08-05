// pages/home/classify/index.js
const imageCdn = 'https://tdesign.gtimg.com/mobile/demos';
const swiperList = [
  {
    value: `${imageCdn}/swiper1.png`,
    ariaLabel: '图片1',
  },
  {
    value: `${imageCdn}/swiper2.png`,
    ariaLabel: '图片2',
  },
  {
    value: `${imageCdn}/swiper1.png`,
    ariaLabel: '图片1',
  },
  {
    value: `${imageCdn}/swiper2.png`,
    ariaLabel: '图片2',
  },
];
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isShow:false,
    isShareShow:true,
    statusbar:'',
    jiaonangheight:'',
    current: 1,
    autoplay: true,
    duration: 500,
    interval: 5000,
    swiperList,
  },
  
  onVisibleChange(){
    this.setData({
      isShow:false
    })
  },
  handleShow(){
    this.setData({
      isShow:true
    })
  },
  onShareVisibleChange(){
    this.setData({
      isShareShow:false
    })
  },
  handleShareShow(){
    this.setData({
      isShareShow:true
    })
  },

  init() {

    const res = wx.getMenuButtonBoundingClientRect()
    this.setData({
        statusbar :res.top, // 胶囊顶部高度
        jiaonangheight: res.height  // 胶囊高度
    })

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('mmmmmmm')
    this.init();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})