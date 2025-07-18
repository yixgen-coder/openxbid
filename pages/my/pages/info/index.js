const app = getApp()
Page({
  data: {
    globalLangData: app.globalData.languagePack,
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
    const token = wx.getStorageSync('token');
    formData.token = token;
    formData.lang = app.globalData.languagePack.lang;
    // 发送数据到服务器
    this.sendFormData(formData);
  },
  sendFormData: function (data) {
    wx.request({
      url: 'https://kpy.phanlink.com/v1/setmyInfo', // 服务器地址
      method: 'POST',
      data: data,
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        //console.log('提交成功', res);
        if (res.data.code === 1) {
          wx.showToast({
            title: res.data.msg,
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
  fetchData() {
    const token = wx.getStorageSync('token');
    const that = this;
    wx.request({
      url: 'https://kpy.phanlink.com/v1/getmyInfo',
      method: 'POST',
      data: {
        token: token
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.data.code == 1) {
          that.setData({
            visible: that.checkUserInfo(res.data.data) ? true : false,
            userinfo: res.data.data,
            avatarUrl: res.data.data.avatar,
            mobile: res.data.data.mobile,
            mail: res.data.data.mail,
            nickname: res.data.data.nickname
          })
        }
      }
    });
  },
  fetchData1() {
    const token = wx.getStorageSync('token');
    const that = this;
    wx.request({
      url: 'https://kpy.phanlink.com/v1/getmyInfo',
      method: 'POST',
      data: {
        token: token
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.data.code == 1) {
          that.setData({
            mobile: res.data.data.mobile,
            mail: res.data.data.mail,
          })
        }
      }
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
    const token = wx.getStorageSync('token');
    // 上传头像
    wx.uploadFile({
      url: 'https://kpy.phanlink.com/v1/uploadFile',
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
        console.error('上传失败', error);
      }
    });
  }
});