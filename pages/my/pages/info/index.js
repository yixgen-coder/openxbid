const app = getApp()
const { post } = require('../../../utils/request')
const { requireLogin, getToken } = require('../../../services/auth')
const { API_BASE } = require('../../../utils/config')
Page({
  data: {
    globalLangData: app.globalData.languagePack,
    itemTitle: app.globalData.languagePack.lang == 1 ? 'Personal information' : '个人信息',
    statusbar: '',
    jiaonangheight: '',
    userinfo: {},
    avatarUrl: '',
    mobile: '',
    mail: '',
    password: '',
    nickname: '',
    visible: false,
  },
  onLoad() {
    this.init();
  },
  goback: function () {
    wx.navigateBack({
      delta: 1
    });
  },
  popCancel() {
    this.setData({
      visible: false
    });
  },
  onShow() {
    this.fetchData1();
  },
  checkUserInfo(userInfo) {
    return userInfo.nickname.startsWith('KPY_') || !userInfo.avatar.includes('uploads/');
  },
  init() {
    const res = wx.getMenuButtonBoundingClientRect();
    this.setData({
      statusbar: res.top, // 胶囊顶部高度
      jiaonangheight: res.height // 胶囊高度
    })
    this.fetchData();
  },
  handlenickname: function (e) {
    const newValue = e.detail.value;
    this.setData({
      nickname: newValue
    });
  },
  onFormSubmit: function (e) {
    const formData = e.detail.value;
    formData.lang = app.globalData.languagePack.lang;
    // 发送数据到服务器
    this.sendFormData(formData);
  },
  sendFormData: async function (data) {
    // [改动] wx.request → post()
    try {
      const res = await post('/setmyInfo', data, { showError: false });
      wx.showToast({
        title: res.msg,
        icon: 'success',
        duration: 2000,
        mask: true,
        complete: () => {
          setTimeout(() => {
            wx.navigateBack({
              delta: 1
            });
          }, 2000);
        }
      });
    } catch (res) {
      wx.showToast({
        title: res.msg || '网络错误',
        icon: 'none',
        duration: 2000
      });
    }
  },
  fetchData() {
    // [改动] wx.request → post()
    const that = this;
    post('/getmyInfo', {}, { showError: false }).then(res => {
      that.setData({
        visible: that.checkUserInfo(res.data) ? true : false,
        userinfo: res.data,
        avatarUrl: res.data.avatar,
        mobile: res.data.mobile,
        mail: res.data.mail,
        nickname: res.data.nickname
      })
    });
  },
  fetchData1() {
    // [改动] wx.request → post()
    const that = this;
    post('/getmyInfo', {}, { showError: false }).then(res => {
      that.setData({
        mobile: res.data.mobile,
        mail: res.data.mail,
      })
    });
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    wx.stopPullDownRefresh();
  },
  onChooseAvatar(e) {
    this.setData({
      avatarUrl: e.detail.avatarUrl
    })
    this.uploadAvatar(e.detail.avatarUrl);
  },
  uploadAvatar: function (tempFilePath) {
    const that = this;
    // [改动] wx.getStorageSync('token') → getToken()；硬编码 URL → API_BASE
    const token = getToken();
    // 上传头像
    wx.uploadFile({
      url: `${API_BASE}/uploadFile`,
      filePath: tempFilePath,
      name: 'file',
      formData: {
        'token': token
      },
      header: {
        'content-type': 'multipart/form-data'
      },
      success(res) {
        if (res.data.code == 1) {
          that.setData({
            avatarUrl: res.data.filepath
          })
        }
      },
      fail(error) {
        // console.error('上传失败', error);
      }
    });
  }
});