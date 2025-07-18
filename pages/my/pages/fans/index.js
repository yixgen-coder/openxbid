const app = getApp()
Page({
  data: {
    globalLangData: app.globalData.languagePack,
    itemTitle: app.globalData.languagePack.followers,
    statusbar: '',
    jiaonangheight: '',
    fansList: [],
  },
  onLoad(options) {
    this.init();
  },
  goback: function () {
    wx.navigateBack({
      delta: 1
    });
  },
  async handleDel(e) {
    const {
      uid
    } = e.currentTarget.dataset;
    const formData = {};
    formData.token = wx.getStorageSync('token');
    formData.uid = uid;
    const url = 'https://kpy.phanlink.com/v1/delmyFans';

    const res = await this.fetchDatas(url, formData);
    if (res.code == 1) {
      this.setData({
        fansList: this.data.fansList.filter(fans => fans.uid !== uid)
      });
    }
    wx.showToast({
      title: res.msg,
      icon: 'success',
      duration: 2000
    });
  },
  handleJl(e) {
    const {
      uid
    } = e.currentTarget.dataset;
    wx.navigateTo({
      url: '/pages/news/pages/message/chat/index?uId=' + uid,
    });
  },
  init() {
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
    this.fetchHomeDatas();
  },
  fetchHomeDatas: async function () {
    const formData = {};
    formData.token = wx.getStorageSync('token');
    formData.lang = app.globalData.languagePack.lang;
    const url = 'https://kpy.phanlink.com/v1/getmyFans';

    const res = await this.fetchDatas(url, formData);
    if (res.code == 1) {
      this.setData({
        fansList: res.result,
      });
    }
  },
  fetchDatas(url, data) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: url,
        method: 'POST',
        data: data,
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          resolve(res.data);
        },
        fail: function (err) {
          reject(err);
        }
      });
    });
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    wx.stopPullDownRefresh();
  },
})