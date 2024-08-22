Page({
  data: {
    itemTitle: '我的粉丝',
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
  init() {
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
    this.fetchHomeDatas();
  },
  fetchHomeDatas: async function () {
    const formData = {};
    formData.token = wx.getStorageSync('token');
    const url = 'https://kpy.phanlink.com/v1/getmyFans';

    const res = await this.fetchDatas(url, formData);
    if (res.code == 1) {
      this.setData({
        fansList: res.result,
      });
    }
    wx.showToast({
      title: res.msg,
      icon: 'loading',
      duration: 500
    });
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
})