const app = getApp()
Page({
  data: {
    globalLangData: app.globalData.languagePack,
    formats: {},
    content: "",
    statusbar: "",
    jiaonangheight: "",
    itemTitle: app.globalData.languagePack.share_moments,
    dtId: 0,
    imgList: [],
    dtTitle: '',
    disabled: false
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
        itemTitle: app.globalData.languagePack.lang == 1 ? 'Dynamic editing' : '动态编辑'
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
        icon: 'none',
        duration: 500
      });
    } else {
      wx.showModal({
        title: app.globalData.languagePack.reminder,
        content: res.msg,
        showCancel: false,
        confirmText: app.globalData.languagePack.sure,
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
      dtTitle: this.filterEmojis(value)
    });

  },
  filterEmojis(input) {
    // 使用正则表达式匹配表情符号
    return input.replace(/[\uD83C-\uDBFF\uDC00-\uDFFF]+/g, '');
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
            title: app.globalData.languagePack.lang == 1 ? 'Upload successfully' : '上传成功',
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
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    wx.stopPullDownRefresh();
  },
  async handleTJForm() {
    this.setData({
      disabled: true
    });
    const formData = {};
    formData.token = wx.getStorageSync('token');
    formData.dtId = this.data.dtId;
    formData.imgList = this.data.imgList;
    formData.dtTitle = this.data.dtTitle;
    formData.lang = app.globalData.languagePack.lang;
    if (formData.dtTitle == '') {

      wx.showModal({
        title: app.globalData.languagePack.reminder,
        content: app.globalData.languagePack.lang == 1 ? 'Please fill in the dynamic content!' : '请填写动态内容！',
        showCancel: false, // 隐藏取消按钮
        confirmText: app.globalData.languagePack.sure, // 自定义确认按钮文案
        confirmColor: "#007AFF", // 自定义确认按钮颜色
      });
      return false;
    }

    const url = 'https://kpy.phanlink.com/v1/setDtAddDatas';
    const res = await this.fetchDatas(url, formData);
    if (res.code == 1) {
      wx.showModal({
        title: app.globalData.languagePack.reminder,
        content: res.msg,
        showCancel: false,
        confirmText: app.globalData.languagePack.sure,
        success: res => {
          if (res.confirm) {
            wx.navigateBack({
              delta: 1
            });
          }
        }
      });
    } else if (res.code == -2) {
      wx.showModal({
        title: app.globalData.languagePack.reminder,
        content: res.msg,
        confirmText: app.globalData.languagePack.sure, // 默认"确定"
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/my/pages/approve/index',
            });
          }
        }
      })
    } else {
      wx.showModal({
        title: app.globalData.languagePack.reminder,
        content: res.msg,
        showCancel: false, // 隐藏取消按钮
        confirmText: app.globalData.languagePack.sure, // 自定义确认按钮文案
        confirmColor: "#007AFF", // 自定义确认按钮颜色
      });
    }
    this.setData({
      disabled: false
    });
  }
})