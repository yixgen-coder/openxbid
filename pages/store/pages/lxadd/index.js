// pages/my/approve/auhor/index.js
Page({
  data: {
    storeInfo: {},
    options: [],
    demoCheckboxMax: [],
    name: '',
    post: '',
    tel: '',
    email: '',
    wx: '',
    whatsapp: '',
    typeTitle: '请选择',
    fileList: [],
    imgTmp: '',
    btnText: '保存',
    btnStatus: false,
    visible: false,
    demoCheckboxMax: [],
    telValue: false,
    emailValue: false,
    wxValue: false,
    whatsappValue: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let token = wx.getStorageSync('token');
    if (!token) {
      // 用户未登录，跳转到登录页面
      wx.navigateTo({
        url: '/pages/tabbar/login/login',
      });
    }
  },
  onXZPicker() {
    let demoCheckboxMax = [];
    if (this.data.telValue) {
      demoCheckboxMax.push(1)
    }
    if (this.data.emailValue) {
      demoCheckboxMax.push(2)
    }
    if (this.data.wxValue) {
      demoCheckboxMax.push(3)
    }
    if (this.data.whatsappValue) {
      demoCheckboxMax.push(4)
    }
    this.setData({
      visible: !this.data.visible,
      demoCheckboxMax: demoCheckboxMax,
      telValue: this.data.telValue,
      emailValue: this.data.emailValue,
      wxValue: this.data.wxValue,
      whatsappValue: this.data.whatsappValue,
    });
  },
  onQRPicker() {
    const {
      demoCheckboxMax
    } = this.data;
    this.setData({
      visible: !this.data.visible,
      telValue: demoCheckboxMax.includes(1) ? true : false,
      emailValue: demoCheckboxMax.includes(2) ? true : false,
      wxValue: demoCheckboxMax.includes(3) ? true : false,
      whatsappValue: demoCheckboxMax.includes(4) ? true : false
    });
  },
  onChange(e) {
    const {
      value
    } = e.detail;

    this.setData({
      demoCheckboxMax: value
    });

  },
  fetchData(url) {
    let token = wx.getStorageSync('token');
    return new Promise((resolve, reject) => {
      wx.request({
        url: url,
        method: 'POST',
        data: {
          'token': token
        },
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
  async fetStoreiInfoHandle() {
    try {
      const url = 'https://kpy.phanlink.com/v1/getStoreLx';
      const res = await this.fetchData(url);
      if (res.code == 1) {
        this.setData({
          storeInfo: res.data.info,
          fileList: [{
            'url': res.data.info.shop_logo
          }],

        });
      }
    } catch (error) {
      console.error('请求失败', error);
    }
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
    const {
      storeInfo
    } = this.data;
    storeInfo[key] = value;
    this.setData({
      [key]: value,
      storeInfo: storeInfo
    });

  },
  handleAdd(e) {
    const {
      fileList
    } = this.data;
    const {
      files
    } = e.detail;

    this.setData({
      fileList: [...fileList, ...files],
    });
    this.onUpload(files[0].url);

  },
  onUpload(file) {
    const {
      fileList
    } = this.data;

    this.setData({
      fileList: [...fileList, {
        ...file,
        status: 'loading'
      }],
    });
    let that = this;
    const task = wx.uploadFile({
      url: 'https://kpy.phanlink.com/v1/uploadImgs', // 仅为示例，非真实的接口地址
      filePath: file,
      name: 'file',
      formData: {},
      success: (res) => {
        res = JSON.parse(res.data);
        if (res.code == 1) {
          that.setData({
            fileList: [{
              'url': res.filepath
            }]
          });
        }
      },
    });

  },
  handleRemove(e) {
    const {
      index
    } = e.detail;
    const {
      fileList
    } = this.data;

    fileList.splice(index, 1);
    this.setData({
      fileList,
    });
  },

  onFormSubmit: function (e) {

    const formData = this.data.storeInfo;
    const imgTmp = this.data.imgTmp;
    formData.demoCheckboxMax = this.data.demoCheckboxMax;
    const token = wx.getStorageSync('token');
    formData.token = token;
    formData.avatar = this.data.fileList;
    if (formData.avatar.length == 0) {
      wx.showToast({
        title: '请选择一个头像',
        icon: 'none',
        duration: 2000
      });
      return false;
    }
    if (!formData.name || formData.name == '') {
      wx.showToast({
        title: '请输入姓名',
        icon: 'none',
        duration: 2000
      });
      return false;
    }
    if (!formData.post || formData.post == '') {
      wx.showToast({
        title: '请输入职位',
        icon: 'none',
        duration: 2000
      });
      return false;
    }
    if (formData.demoCheckboxMax.length == 0) {
      wx.showToast({
        title: '请至少选择一个联系方式',
        icon: 'none',
        duration: 2000
      });
      return false;
    }
    if (formData.demoCheckboxMax.includes(1) && (!formData.tel || formData.tel == '')) {
      wx.showToast({
        title: '请输入手机号码',
        icon: 'none',
        duration: 2000
      });
      return false;
    }
    if (formData.demoCheckboxMax.includes(2) && (!formData.email || formData.email == '')) {
      wx.showToast({
        title: '请输入邮箱',
        icon: 'none',
        duration: 2000
      });
      return false;
    }
    if (formData.demoCheckboxMax.includes(3) && (!formData.wx || formData.wx == '')) {
      wx.showToast({
        title: '请输入微信',
        icon: 'none',
        duration: 2000
      });
      return false;
    }
    if (formData.demoCheckboxMax.includes(4) && (!formData.whatsapp || formData.whatsapp == '')) {
      wx.showToast({
        title: '请输入whatsapp',
        icon: 'none',
        duration: 2000
      });
      return false;
    }
    //console.log(formData)
    // 发送数据到服务器
    this.sendFormData(formData);
  },
  sendFormData: function (data) {
    const url = 'https://kpy.phanlink.com/v1/setStoreLx'
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
            complete: () => {
              wx.redirectTo({
                url: '/pages/store/pages/card/index'
              });
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
})