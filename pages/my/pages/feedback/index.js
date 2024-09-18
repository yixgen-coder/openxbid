// pages/my/approve/auhor/index.js
Page({
  data: {
    itemTitle: '意见反馈',
    statusbar: '',
    jiaonangheight: '',
    title: '',
    content: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */


  onLoad() {
    let token = wx.getStorageSync('token');
    if (!token) {
      // 用户未登录，跳转到登录页面
      wx.navigateTo({
        url: '/pages/tabbar/login/login',
      });
    }
    const res = wx.getMenuButtonBoundingClientRect();
    this.setData({
      statusbar: res.top, // 胶囊顶部高度
      jiaonangheight: res.height // 胶囊高度
    })
  },


  handleGrInfos(e) {
    const {
      key
    } = e.currentTarget.dataset;
    const {
      value
    } = e.detail;

    this.setData({
      [key]: value,
    });
  },
  goback: function () {
    wx.navigateBack({
      delta: 1
    });
  },

  onFormSubmit: function (e) {

    const formData = {};
    const token = wx.getStorageSync('token');
    formData.token = token;
    formData.title = this.data.title;
    formData.content = this.data.content;

    // 发送数据到服务器
    this.sendFormData(formData);
  },
  sendFormData: function (data) {
    const url = 'https://kpy.phanlink.com/v1/setMyFeedback'
    wx.request({
      url: url, // 服务器地址
      method: 'POST',
      data: data,
      success: function (res) {
        //console.log(res);
        if (res.data.code == 1) {
          wx.showToast({
            title: res.data.msg,
            icon: 'success',
            duration: 2000,
            mask: true,
            complete: () => {
              wx.navigateBack({
                delta: 1
              });
            }
          });
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 2000
          });
        }
      },
      fail: function (error) {
        console.error('提交失败', error);
        wx.showToast({
          title: '网络错误',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },
})