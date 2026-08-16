const app = getApp()
// [改动] 引入统一请求层和认证服务
const { post } = require('../../../../../utils/request')
const { requireLogin } = require('../../../../../services/auth')
// [改动] 硬编码 URL → config 常量
const { API_BASE } = require('../../../../../utils/config')
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
    // [改动] 替换登录检查为 requireLogin()
    if (!requireLogin()) return;
    this.fetchHomeDatas();
  },
  onTabsChange(e) {
    this.setData({
      type: e.detail.value
    })
    this.fetchHomeDatas();
  },
  fetchHomeDatas: async function () {
    // [改动] fetchDatas → post()
    try {
      const res = await post('/getStoreDcDatas', {
        type: this.data.type,
        lang: app.globalData.languagePack.lang
      }, { showError: false });
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
    } catch (res) {
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
      url: `${API_BASE}/uploadImgs`, // [改动] 硬编码 URL → config 常量
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
    const dcInfo = this.data.dcInfo;
    const imgList = this.data.imgList;
    const lang = app.globalData.languagePack.lang;
    let type = this.data.type;
    if (dcInfo.name == '') {
      wx.showToast({
        title: app.globalData.languagePack.lang==1?'Please fill in the company name!':'请填写公司名称！',
        icon: 'none',
        duration: 500
      });
      return false;
    }
    if (type == 3 && dcInfo.hgcode == '') {
      wx.showToast({
        title: app.globalData.languagePack.lang==1?'Please fill in the customs filing number!':'请填写海关备案号！',
        icon: 'none',
        duration: 500
      });
      return false;
    }
    if (imgList.length == 0) {
      wx.showToast({
        title: app.globalData.languagePack.lang==1?'Please upload the relevant certification qualifications':'请上传相关认证资质',
        icon: 'none',
        duration: 500
      });
      return false;
    }
    // [改动] fetchDatas → post()
    try {
      const res = await post('/setStoreDcDatas', {
        dcInfo: dcInfo,
        imgList: imgList,
        lang: lang
      }, { showError: false });
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
    } catch (res) {
      wx.showToast({
        title: res.msg,
        icon: 'none',
        duration: 500
      });
    }

  }
})