Page({
  data: {
    formats: {},
    content: "",
    statusbar: "",
    jiaonangheight: "",
    itemTitle: "代采认证",
    dcId: 0,
    imgList: [],
    dcInfo: {
      name: '',
      name_en: '',
      hgban: ''
    }
  },
  onLoad: function (options) {
    const res = wx.getMenuButtonBoundingClientRect()
    this.setData({
      statusbar: res.top,
      jiaonangheight: res.height
    })
    if (options.dcId > 0) {
      this.setData({
        dcId: options.dcId,
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
    const dcId = this.data.dcId;
    this.fetchHomeDatas();
  },
  fetchHomeDatas: async function () {
    const url = 'https://kpy.phanlink.com/v1/getStoreDcDatas';
    const formData = {};
    formData.token = wx.getStorageSync('token');
    formData.dcId = this.data.dcId;
    const res = await this.fetchDatas(url, formData);
    if (res.code == 1) {
      const nextList = res.result;
      if (nextList.dcId > 0) {
        this.setData({
          dcId: nextList.dcId,
          dcInfo: nextList,
          imgList: nextList.ziliao
        });
      } else {
        this.setData({
          dcInfo: nextList,
        });
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
      imgList: [],
      dtTitle: ''
    });
  },
  async handleTJForm() {
    const formData = {};
    formData.token = wx.getStorageSync('token');
    formData.dcId = this.data.dcId;
    formData.dcInfo = this.data.dcInfo;
    formData.imgList = this.data.imgList;
    console.log(this.data.dcInfo);
    if (formData.dcInfo.name == '') {
      wx.showToast({
        title: '请填写公司名称！',
        icon: 'none',
        duration: 500
      });
      return false;
    }
    if (formData.dcInfo.name_en == '') {
      wx.showToast({
        title: '请填写公司外文名称！',
        icon: 'none',
        duration: 500
      });
      return false;
    }
    if (formData.dcInfo.hgban == '') {
      wx.showToast({
        title: '请填写海关备案号！',
        icon: 'none',
        duration: 500
      });
      return false;
    }
    if (formData.imgList.length == 0) {
      wx.showToast({
        title: '请上传近一年进口该商品的报关单！',
        icon: 'none',
        duration: 500
      });
      return false;
    }
    const url = 'https://kpy.phanlink.com/v1/setStoreDcDatas';
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