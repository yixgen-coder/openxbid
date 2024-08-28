Page({
  data: {
    formats: {},
    content: "",
    statusbar: "",
    jiaonangheight: "",
    itemTitle: "动态发布",
    dtId: 0,
    imgList: [],
    dtTitle: ''
  },
  onLoad: function (options) {
    const res = wx.getMenuButtonBoundingClientRect()
    this.setData({
      statusbar: res.top,
      jiaonangheight: res.height
    })
    if (options.dtId > 0) {
      this.setData({
        dtId: options.dtId,
        itemTitle: '动态编辑'
      })
    }
    this.init();
  },
  goback: function () {
    wx.navigateBack({
      delta: 1
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
    const dtId = this.data.dtId;
    if (dtId > 0) {
      this.fetchHomeDatas();
    }

  },
  fetchHomeDatas: async function () {
    const url = 'https://kpy.phanlink.com/v1/getDtAddDatas';
    const formData = {};
    formData.token = wx.getStorageSync('token');
    formData.dtId = this.data.dtId;
    const res = await this.fetchDatas(url, formData);
    if (res.code == 1) {
      const nextList = res.result;
      if (nextList.dtId > 0) {
        this.setData({
          dtId: nextList.dtId,
          dtTitle: nextList.dtTitle,
          imgList: nextList.pic
        });
        this.readyEditor();
      }
      wx.showToast({
        title: res.msg,
        icon: 'loading',
        duration: 500
      });
    } else {
      wx.showModal({
        title: '提示',
        content: res.msg,
        showCancel: false,
        confirmText: '知道了',
        success: rs => {
          if (rs.confirm) {
            wx.navigateBack({
              delta: 1
            });
          }
        }
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
  handleGrInfos(e) {
    const {
      value
    } = e.detail;

    this.setData({
      dtTitle: value
    });

  },
  handleFmAdd(e) {
    const {
      files
    } = e.detail;
    const {
      index
    } = e.currentTarget.dataset;
    for (let i = 0; i < files.length; i++) {
      this.onUpload(files[i].url, index);
    }

  },
  onUpload(file) {
    let that = this;
    const task = wx.uploadFile({
      url: 'https://kpy.phanlink.com/v1/uploadImgs',
      filePath: file,
      name: 'file',
      formData: {},
      success: (res) => {
        res.data = JSON.parse(res.data);
        if (res.data.code == 1) {
          const {
            imgList
          } = this.data;

          that.setData({
            imgList: imgList.concat([{
              'url': res.data.filepath
            }])
          });
          wx.showToast({
            title: res.data.msg,
            icon: 'success',
            duration: 2000
          });
        }
      },
    });

  },
  handleFmRemove(e) {
    const {
      index
    } = e.detail;
    const {
      imgList,
    } = this.data;
    imgList.splice(index, 1);
    this.setData({
      imgList
    });
  },
  handleReset(e) {
    this.setData({
      imgList: [],
      dtTitle: ''
    });
  },
  async handleTJForm() {
    const formData = {};
    formData.token = wx.getStorageSync('token');
    formData.dtId = this.data.dtId;
    formData.imgList = this.data.imgList;
    formData.dtTitle = this.data.dtTitle;
    if (formData.dtTitle == '') {
      wx.showToast({
        title: '请填写动态内容！',
        icon: 'loading',
        duration: 500
      });
      return false;
    }

    const url = 'https://kpy.phanlink.com/v1/setDtAddDatas';
    const res = await this.fetchDatas(url, formData);
    if (res.code == 1) {
      wx.showModal({
        title: '提示',
        content: res.msg,
        showCancel: false,
        confirmText: '知道了',
        success: res => {
          if (res.confirm) {
            wx.navigateBack({
              delta: 1
            });
          }
        }
      });
    } else {
      wx.showToast({
        title: res.msg,
        icon: 'loading',
        duration: 500
      });
    }

  }
})