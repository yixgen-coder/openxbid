// pages/my/approve/auhor/index.js
const app = getApp()
Page({
  data: {
    globalLangData: app.globalData.languagePack,
    itemTitle: app.globalData.languagePack.feedback,
    statusbar: '',
    jiaonangheight: '',
    title: '',
    content: '',
    contact: '',
    type: 1,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if (options.type == 2) {
      this.setData({
        type: 2,
        itemTitle: app.globalData.languagePack.complaint
      });
    }
    let token = wx.getStorageSync('token');
    if (!token) {
      // 用户未登录，跳转到登录页面
      wx.showModal({
        title: app.globalData.languagePack.reminder, // 标题
        content: app.globalData.languagePack.function_registered, // 内容
        cancelText: app.globalData.languagePack.cancel, // 取消按钮文字（可选，默认为"取消"）
        confirmText: app.globalData.languagePack.login, // 确认按钮文字（可选，默认为"确定"）
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/tabbar/login/login',
            });
          } else if (res.cancel) {
            wx.navigateBack();
          }
        }
      })
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
    formData.contact = this.data.contact;
    formData.type = this.data.type;
    formData.lang = app.globalData.languagePack.lang;

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
            success: () => {
              setTimeout(() => {
                wx.navigateBack({
                  delta: 1
                });
              }, 2000);
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
        wx.showToast({
          title: '网络错误',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    wx.stopPullDownRefresh();
  },
})