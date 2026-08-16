// pages/my/approve/auhor/index.js
const app = getApp()
const { post } = require('../../../../utils/request')
const { requireLogin } = require('../../../../services/auth')
// [改动] 硬编码 URL → config 常量
const { API_BASE } = require('../../../../utils/config')
Page({
  data: {
    globalLangData: app.globalData.languagePack,
    items: 1,
    itemTitle: app.globalData.languagePack.personal,
    statusbar: '',
    jiaonangheight: '',
    grInfos: {},
    qyInfos: {},
    regionText: '',
    regionValue: [],
    regionTitle: '',
    regions: {},

    typeText: app.globalData.languagePack.id_card,
    typeValue: [1, 2],
    typeTitle: '',
    types: [{
        label: app.globalData.languagePack.id_card,
        value: 1
      },
      {
        label: app.globalData.languagePack.individual_business,
        value: 2,
      },
      {
        label: app.globalData.languagePack.passport,
        value: 3,
      }
    ],
    imgsList: [],
    btnText: app.globalData.languagePack.immediate_certification,
    btnStatus: false,
    companyStatus: 0,
    companyMsg: '',
    companyTime: '',
    companyType: 0,
    userinfo: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // [改动] wx.getStorageSync('token') + showModal → requireLogin()
    if (!requireLogin()) return;
    const lang = app.globalData.languagePack.lang;
    const res = wx.getMenuButtonBoundingClientRect();
    this.setData({
      statusbar: res.top, // 胶囊顶部高度
      jiaonangheight: res.height // 胶囊高度
    })

    if (options.items) {
      this.setData({
        items: options.items,
        itemTitle: options.items == 2 ? app.globalData.languagePack.company : app.globalData.languagePack.personal
      });
    }
    this.addInfo('region', 96);
    let that = this;
    const types = this.data.types;
    // [改动] wx.request → post()
    post('/getRegion', { lang }, { showError: false }).then(res => {
      let gr_infos = JSON.parse(res.data.info.gr_infos)
      gr_infos.mobile = gr_infos.mobile ? gr_infos.mobile : res.data.info.mobile;
      gr_infos.mail = gr_infos.mail ? gr_infos.mail : res.data.info.mail;
      let qy_infos = JSON.parse(res.data.info.qy_infos)
      qy_infos.mobile = qy_infos.mobile ? qy_infos.mobile : res.data.info.mobile;
      qy_infos.mail = qy_infos.mail ? qy_infos.mail : res.data.info.mail;
      let _fileList = options.items == 1 ? gr_infos : qy_infos
      that.setData({
        userinfo: res.data.info,
        regions: res.data.region,
        grInfos: gr_infos,
        qyInfos: qy_infos,
        companyStatus: res.data.info.company_status,
        companyMsg: res.data.info.company_msg,
        companyTime: res.data.info.company_time,
        companyType: res.data.info.company_type,
        imgsList: _fileList.imgsList,
        regionText: that.findValue(options.items == 1 ? parseInt(gr_infos.region) : parseInt(qy_infos.region), res.data.region),
        regionValue: [options.items == 1 ? parseInt(gr_infos.region) : parseInt(qy_infos.region)],
        typeText: that.findValue(gr_infos.type, types),
        typeValue: [gr_infos.type],
      });
    });

  },
  findValue(value, data) {
    const foundItems = data.filter(item => item.value === value);
    return foundItems[0] ? foundItems[0].label : '';
  },
  handleGrInfos(e) {
    const {
      key
    } = e.currentTarget.dataset;
    let {
      value
    } = e.detail;
    value = this.filterEmojis(value);
    this.addInfo(key, value);
  },
  filterEmojis(input) {
    // 使用正则表达式匹配表情符号
    return input.replace(/[\uD83C-\uDBFF\uDC00-\uDFFF]+/g, '');
  },
  addInfo: function (key, value) {
    const items = this.data.items;
    const {
      grInfos,
      qyInfos
    } = this.data;
    if (items == 1) {
      grInfos[key] = value;
      this.setData({
        grInfos: grInfos
      });
    } else {
      qyInfos[key] = value;
      this.setData({
        qyInfos: qyInfos
      });
    }
  },

  onColumnChange(e) {
    // console.log('picker pick:', e);
  },
  onPickerChange(e) {
    const {
      key
    } = e.currentTarget.dataset;
    const {
      value,
      label
    } = e.detail;
    this.setData({
      [`${key}Visible`]: false,
      [`${key}Value`]: value,
      [`${key}Text`]: label.join(' '),
    });
    this.addInfo(key, value[0]);
  },

  onPickerCancel(e) {
    const {
      key
    } = e.currentTarget.dataset;
    this.setData({
      [`${key}Visible`]: false,
    });
  },
  onRegionPicker() {
    this.setData({
      regionVisible: true,
      regionTitle: app.globalData.languagePack.select_country
    });
  },
  onTitlePicker() {
    this.setData({
      typeVisible: true,
      typeTitle: app.globalData.languagePack.select_id_type
    });
  },
  handleFmAdd(e) {
    const {
      files
    } = e.detail;
    for (let i = 0; i < files.length; i++) {
      this.onUpload(files[i].url);
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
            imgsList
          } = this.data;
          that.setData({
            imgsList: imgsList.concat([{
              'url': res.data.filepath
            }])
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
      imgsList
    } = this.data;
    imgsList.splice(index, 1);
    this.setData({
      imgsList
    });
  },
  goback: function () {
    wx.navigateBack({
      delta: 1
    });
  },
  onFormSubmit: function (e) {
    const items = this.data.items;
    const formData = items == 1 ? this.data.grInfos : this.data.qyInfos;
    formData.items = items;
    formData.lang = app.globalData.languagePack.lang;
    formData.imgsList = this.data.imgsList;
    formData.mobile = formData.mobile ? formData.mobile : this.data.userinfo.mobile;
    formData.mail = formData.mail ? formData.mail : this.data.userinfo.mail;
    // 发送数据到服务器
    this.sendFormData(formData);
  },
  sendFormData: async function (data) {
    // [改动] wx.request → post()
    const url = data.items == 1 ? '/setGrApprove' : '/setQyApprove'
    const payload = { ...data };
    try {
      const res = await post(url, payload, { showError: false });
      wx.showToast({
        title: res.msg,
        icon: 'success',
        duration: 2000,
        mask: true,
        complete: () => {
          setTimeout(() => {
            wx.navigateBack({
              delta: 2
            });
          }, 2000);
        }
      });
    } catch (res) {
      wx.showToast({
        title: res.msg || 'Network error',
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