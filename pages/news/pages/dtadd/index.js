const app = getApp()
const { post } = require('../../../../utils/request')
const { requireLogin } = require('../../../../services/auth')
// [改动] 硬编码 URL → config 常量
const { API_BASE } = require('../../../../utils/config')
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
    // [改动] wx.getStorageSync('token') → requireLogin()
    if (!requireLogin()) return;
    const dtId = this.data.dtId;
    this.fetchHomeDatas();
  },
  fetchHomeDatas: async function () {
    // [改动] fetchDatas → post()，try/catch 处理 code=-2 等
    try {
      const res = await post('/getDtAddDatas', { dtId: this.data.dtId, lang: app.globalData.languagePack.lang }, { showError: false });
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
    } catch (res) {
      if (res.code == -2) {
        wx.showModal({
          title: app.globalData.languagePack.reminder,
          content: res.msg,
          cancelText: app.globalData.languagePack.cancel,
          confirmText: app.globalData.languagePack.sure,
          success: (res) => {
            if (res.confirm) {
              wx.navigateTo({ url: '/pages/my/pages/approve/index' });
            }
          }
        });
      } else {
        wx.showModal({
          title: app.globalData.languagePack.reminder,
          content: res.msg,
          showCancel: false,
          confirmText: app.globalData.languagePack.sure,
          success: rs => {
            if (rs.confirm) {
              wx.navigateBack({ delta: 1 });
            }
          }
        });
      }
    }
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
    this.setData({ disabled: true });
    const formData = {};
    formData.dtId = this.data.dtId;
    formData.imgList = this.data.imgList;
    formData.dtTitle = this.data.dtTitle;
    formData.lang = app.globalData.languagePack.lang;
    if (formData.dtTitle == '') {
      wx.showModal({
        title: app.globalData.languagePack.reminder,
        content: app.globalData.languagePack.lang == 1 ? 'Please fill in the dynamic content!' : '请填写动态内容！',
        showCancel: false,
        confirmText: app.globalData.languagePack.sure,
        confirmColor: "#007AFF",
      });
      this.setData({ disabled: false });
      return false;
    }
    // [改动] fetchDatas → post()，try/catch 处理 code=-2 等
    try {
      const res = await post('/setDtAddDatas', formData, { showError: false });
      wx.showModal({
        title: app.globalData.languagePack.reminder,
        content: res.msg,
        showCancel: false,
        confirmText: app.globalData.languagePack.sure,
        success: res => {
          if (res.confirm) {
            wx.navigateBack({ delta: 1 });
          }
        }
      });
    } catch (res) {
      if (res.code == -2) {
        wx.showModal({
          title: app.globalData.languagePack.reminder,
          content: res.msg,
          cancelText: app.globalData.languagePack.cancel,
          confirmText: app.globalData.languagePack.sure,
          success: (res) => {
            if (res.confirm) {
              wx.navigateTo({ url: '/pages/my/pages/approve/index' });
            }
          }
        });
      } else {
        wx.showModal({
          title: app.globalData.languagePack.reminder,
          content: res.msg,
          showCancel: false,
          confirmText: app.globalData.languagePack.sure,
          confirmColor: "#007AFF",
        });
      }
    }
    this.setData({ disabled: false });
  }
})