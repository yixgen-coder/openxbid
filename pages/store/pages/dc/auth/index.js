const app = getApp()
Page({
  data: {
    globalLangData: app.globalData.languagePack,
    formats: {},
    content: "",
    statusbar: "",
    jiaonangheight: "",
    itemTitle: app.globalData.languagePack.service_certif,
    type: 0,
    fwtypes: [],
    imgList: [],
    dcInfo: {
      name: '',
    }
  },
  onLoad: function (options) {
    const res = wx.getMenuButtonBoundingClientRect()
    this.setData({
      statusbar: res.top,
      jiaonangheight: res.height
    })
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
    this.fetchHomeDatas();
  },
  onTabsChange(e) {
    this.setData({
      type: e.detail.value
    })
    this.fetchHomeDatas();
  },
  fetchHomeDatas: async function () {
    const url = 'https://kpy.phanlink.com/v1/getStoreDcDatas';
    const formData = {};
    formData.token = wx.getStorageSync('token');
    formData.type = this.data.type;
    formData.lang = app.globalData.languagePack.lang;
    const res = await this.fetchDatas(url, formData);
    if (res.code == 1) {
      const nextList = res.result;
      if (nextList.id > 0) {
        this.setData({
          type: nextList.type,
          fwtypes: nextList.fwtype,
          dcInfo: nextList,
          imgList: nextList.zl
        });
      } else {
        this.setData({
          dcInfo: nextList,
        });
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
      key
    } = e.currentTarget.dataset;
    const {
      value
    } = e.detail;

    this.addInfo(key, value);

  },

  addInfo: function (key, value) {
    let {
      dcInfo
    } = this.data;
    dcInfo[key] = value;
    this.setData({
      dcInfo: dcInfo,
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
      imgList: []
    });
  },
  async handleTJForm() {
    const formData = {};
    formData.token = wx.getStorageSync('token');
    formData.dcInfo = this.data.dcInfo;
    formData.imgList = this.data.imgList;
    formData.lang = app.globalData.languagePack.lang;
    let type = this.data.type;
    if (formData.dcInfo.name == '') {
      wx.showToast({
        title: app.globalData.languagePack.lang==1?'Please fill in the company name!':'请填写公司名称！',
        icon: 'none',
        duration: 500
      });
      return false;
    }
    if (type == 3 && formData.dcInfo.hgcode == '') {
      wx.showToast({
        title: app.globalData.languagePack.lang==1?'Please fill in the customs filing number!':'请填写海关备案号！',
        icon: 'none',
        duration: 500
      });
      return false;
    }
    if (formData.imgList.length == 0) {
      wx.showToast({
        title: app.globalData.languagePack.lang==1?'Please upload the relevant certification qualifications':'请上传相关认证资质',
        icon: 'none',
        duration: 500
      });
      return false;
    }
    const url = 'https://kpy.phanlink.com/v1/setStoreDcDatas';
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
    } else {
      wx.showToast({
        title: res.msg,
        icon: 'none',
        duration: 500
      });
    }

  }
})