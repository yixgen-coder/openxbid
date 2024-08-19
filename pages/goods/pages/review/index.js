// pages/goods/pages/review/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    reviewList: [],
    goodsId: '',
    visible: false,
    msg: '',
  },
  handleShowMsg() {
    this.setData({
      visible: !this.data.visible,
    });
  },
  handleMsg(e) {
    this.setData({
      msg: e.detail.value,
    });
  },
  handleSubmit: async function () {
    const formData = {};
    formData.msg = this.data.msg;
    formData.goodsId = this.data.goodsId;
    formData.token = wx.getStorageSync('token');

    if (formData.msg == '') {
      wx.showToast({
        title: '评论内容不能为空！',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    const url = 'https://kpy.phanlink.com/v1/setGoodsReviews';
    const res = await this.fetchSetGoods(url, formData);
    if (res.code == 1) {

      wx.showToast({
        title: '评论成功',
        icon: 'success',
        duration: 2000,
        mask: true,
        complete: () => {
          setTimeout(() => {
            this.init();
            this.setData({
              visible: !this.data.visible,
              msg: '',
            });
          }, 2000);
        }
      });

    } else {
      wx.showToast({
        title: res.msg,
        icon: 'none',
        duration: 2000
      });
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {

    this.setData({
      goodsId: options.goodsId,
    });
    this.init();
  },
  init: async function () {
    const url = 'https://kpy.phanlink.com/v1/getGoodsReviews';
    const formData = {};
    formData.token = wx.getStorageSync('token');
    formData.goodsId = this.data.goodsId;
    const res = await this.fetchSetGoods(url, formData);
    if (res.code == 1) {
      this.setData({
        reviewList: res.result,
      });
    } else {
      wx.showToast({
        title: res.msg,
        icon: 'none',
        duration: 2000
      });
    }
  },
  fetchSetGoods(url, data) {
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