// pages/my/approve/auhor/index.js
const app = getApp()
// [改动] 引入统一请求层和认证服务
const { post } = require('../../../../utils/request')
const { requireLogin } = require('../../../../services/auth')
// [改动] 硬编码 URL → config 常量
const { API_BASE } = require('../../../../utils/config')
Page({
  data: {
    globalLangData: app.globalData.languagePack,
    storeInfo: {},
    name: '',
    post: '',
    tel: '',
    email: '',
    wx: '',
    whatsapp: '',
    other: '',
    typeTitle: app.globalData.languagePack.please_select,
    fileList: [],
    imgTmp: '',
    btnText: app.globalData.languagePack.save1,
    btnStatus: false,
    visible: false,
    demoCheckboxMax: [],
    telValue: false,
    emailValue: false,
    wxValue: false,
    whatsappValue: false,
    otherValue: false,
    lxid: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.setNavigationBarTitle({
      title: app.globalData.languagePack.add_contact
    });
    if (options.id > 0) {
      this.setData({
        lxid: options.id
      })
    }
    // [改动] 替换登录检查为 requireLogin()
    if (!requireLogin()) return;
    if (this.data.lxid > 0) {
      this.fetStoreInfo();
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
    if (this.data.otherValue) {
      demoCheckboxMax.push(5)
    }
    this.setData({
      visible: !this.data.visible,
      demoCheckboxMax: demoCheckboxMax,
      telValue: this.data.telValue,
      emailValue: this.data.emailValue,
      wxValue: this.data.wxValue,
      whatsappValue: this.data.whatsappValue,
      otherValue: this.data.otherValue,
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
      whatsappValue: demoCheckboxMax.includes(4) ? true : false,
      otherValue: demoCheckboxMax.includes(5) ? true : false
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
  async fetStoreInfo() {
    // [改动] fetchDatas → post()
    try {
      const res = await post('/getStoreLx', { lxid: this.data.lxid }, { showError: false });
      this.setData({
        storeInfo: res.result,
        fileList: [{
          'url': res.result.avatar
        }],
        name: res.result.name,
        post: res.result.post,
        other: res.result.other,
        tel: res.result.tel,
        whatsapp: res.result.whatsapp,
        wx: res.result.wx,
        telValue: res.result.list.includes(1) ? true : false,
        emailValue: res.result.list.includes(2) ? true : false,
        wxValue: res.result.list.includes(3) ? true : false,
        whatsappValue: res.result.list.includes(4) ? true : false,
        otherValue: res.result.list.includes(5) ? true : false,
        demoCheckboxMax: JSON.parse(res.result.list)
      });
    } catch (error) {
      // console.error('请求失败', error);
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
      url: `${API_BASE}/uploadImgs`, // [改动] 硬编码 URL → config 常量
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
    // [改动] wx.request → post()
    const formData = this.data.storeInfo;
    const imgTmp = this.data.imgTmp;
    const lxid = this.data.lxid;
    formData.demoCheckboxMax = this.data.demoCheckboxMax;
    formData.lxid = lxid;
    formData.avatar = this.data.fileList;
    formData.lang = app.globalData.languagePack.lang;
    if (formData.avatar.length == 0) {
      wx.showToast({
        title: app.globalData.languagePack.lang==1?'Please select an avatar':'请选择一个头像',
        icon: 'none',
        duration: 2000
      });
      return false;
    }
    if (!formData.name || formData.name == '') {
      wx.showToast({
        title: app.globalData.languagePack.lang==1?'Please enter your name.':'请输入姓名',
        icon: 'none',
        duration: 2000
      });
      return false;
    }
    if (!formData.post || formData.post == '') {
      wx.showToast({
        title: app.globalData.languagePack.lang==1?'Please enter the position.':'请输入职位',
        icon: 'none',
        duration: 2000
      });
      return false;
    }
    if (formData.demoCheckboxMax.length == 0) {
      wx.showToast({
        title: app.globalData.languagePack.lang==1?'Please select at least one contact method':'请至少选择一个联系方式',
        icon: 'none',
        duration: 2000
      });
      return false;
    }
    if (formData.demoCheckboxMax.includes(1) && (!formData.tel || formData.tel == '')) {
      wx.showToast({
        title: app.globalData.languagePack.lang==1?'Please enter your mobile phone number':'请输入手机号码',
        icon: 'none',
        duration: 2000
      });
      return false;
    }
    if (formData.demoCheckboxMax.includes(2) && (!formData.email || formData.email == '')) {
      wx.showToast({
        title: app.globalData.languagePack.lang==1?'Please enter your email address.':'请输入邮箱',
        icon: 'none',
        duration: 2000
      });
      return false;
    }
    if (formData.demoCheckboxMax.includes(3) && (!formData.wx || formData.wx == '')) {
      wx.showToast({
        title: app.globalData.languagePack.lang==1?'Please enter wechat':'请输入微信',
        icon: 'none',
        duration: 2000
      });
      return false;
    }
    if (formData.demoCheckboxMax.includes(4) && (!formData.whatsapp || formData.whatsapp == '')) {
      wx.showToast({
        title: app.globalData.languagePack.lang==1?'Please enter whatsapp':'请输入whatsapp',
        icon: 'none',
        duration: 2000
      });
      return false;
    }
    if (formData.demoCheckboxMax.includes(5) && (!formData.other || formData.other == '')) {
      wx.showToast({
        title: app.globalData.languagePack.lang==1?'Please enter other contact information':'请输入其他联系方式',
        icon: 'none',
        duration: 2000
      });
      return false;
    }
    //console.log(formData)
    // 发送数据到服务器
    this.sendFormData(formData);
  },
  sendFormData: async function (data) {
    try {
      const res = await post('/setStoreLx', data, { showError: false });
      wx.showToast({
        title: res.msg,
        icon: 'success',
        duration: 2000,
        mask: true,
        complete: () => {
          wx.redirectTo({
            url: '/pages/store/pages/card/index'
          });
        }
      });
    } catch (res) {
      wx.showToast({
        title: res.msg,
        icon: 'none',
        duration: 2000
      });
    }
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    wx.stopPullDownRefresh();
  },
})