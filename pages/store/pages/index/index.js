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
    storeInfo: [],
    userinfo: [],
    options: [],
    demoCheckboxMax: [],
    itemTitle: app.globalData.languagePack.shop_settings,
    statusbar: '',
    jiaonangheight: '',
    shop_name: '',
    shop_name_en: '',
    shop_status: '',
    shop_time: '',
    shop_desc: '',
    tel: '',
    address: '',
    website: '',
    typeText: app.globalData.languagePack.business_type,
    typeValue: [1],
    typeTitle: app.globalData.languagePack.main_products,
    countryText: app.globalData.languagePack.lang == 1 ? 'China' : '中国',
    countryValue: [96],
    countryVisible: false,
    types: [{
        label: app.globalData.languagePack.factory,
        value: 1
      },
      {
        label: app.globalData.languagePack.trader,
        value: 2,
      },
      {
        label: app.globalData.languagePack.service_provider,
        value: 3,
      }, {
        label: app.globalData.languagePack.others1,
        value: 4,
      }
    ],
    fileList: [],
    imgTmp: '',
    btnText: app.globalData.languagePack.save1,
    btnStatus: false,
    visible: false,
    disselect: false,
    fwtypeVisible: false,
    fwtypeVisible1: false,
    fwtypeText: app.globalData.languagePack.please_select,
    fwtypeValue: [1, 2],
    fwtypes: [{
        label: app.globalData.languagePack.customs_clearance,
        check: false,
        value: 1
      },
      {
        label: app.globalData.languagePack.po_financing,
        check: false,
        value: 2,
      },
      {
        label: app.globalData.languagePack.procurement_agent,
        check: false,
        value: 3,
      },
      {
        label: app.globalData.languagePack.cold_chain_logistics,
        check: false,
        value: 4,
      }
    ],
    regionText: '',
    regionValue: [96],
    regionTitle: '',
    regions: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */

  onRegionPicker() {
    this.setData({
      regionVisible: true,
      regionTitle: app.globalData.languagePack.select_country
    });
  },
  onSelectChange(e) {

    const {
      value
    } = e.detail;
    //console.log(e);
    var label = '';
    var selected = [];
    if (value.length > 0 && value.length <= 10) {
      for (let i = 0; i < value.length; i++) {
        label += this.splitStringAtDelimiter(value[i], '-')[0] + ',';
      }
    } else if (value.length > 10) {
      wx.showToast({
        title: app.globalData.languagePack.lang == 1 ? 'A maximum of 10 main products can be selected' : '主营产品最多选择10个',
        icon: 'none',
        duration: 2000
      });
      return false;
    } else {
      label = app.globalData.languagePack.select_main_products
    }

    this.setData({
      demoCheckboxMax: value,
      typeTitle: label,
    })
  },
  getLeftValuesSafe(array) {
    // 使用 map 提取 '-' 左边的值，考虑异常情况
    const leftValues = array.map(item => {
      const parts = item.split('-', 1); // 只分割第一次出现的 '-'
      return parts[0] || ''; // 如果没有 '-'，则返回空字符串
    });

    // 使用 join 将所有左边的值用逗号连接起来
    return leftValues.join(',');
  },
  getRightValuesSafe(array) {
    // 使用 map 提取第一个 '-' 右边的值
    const rightValues = array.map(item => {
      const parts = item.split('-', 1); // 限制分割次数为1，但我们需要的是右边部分，所以这里直接 split 不限制
      return item.substring(parts[0].length + 1); // 计算并截取右边部分
    });

    // 使用 join 将所有右边的值用逗号连接起来
    return rightValues;
  },
  splitStringAtDelimiter(inputStr, delimiter) {
    const index = inputStr.indexOf(delimiter);

    if (index !== -1) {
      const beforeDelimiter = inputStr.slice(0, index);
      const afterDelimiter = inputStr.slice(index + delimiter.length);
      return [beforeDelimiter, afterDelimiter];
    } else {
      return [inputStr, ''];
    }
  },
  onLoad(options) {
    // [改动] 替换登录检查为 requireLogin()
    if (!requireLogin()) return;
    const res = wx.getMenuButtonBoundingClientRect();
    this.setData({
      statusbar: res.top, // 胶囊顶部高度
      jiaonangheight: res.height // 胶囊高度
    })

    this.fetStoreiInfoHandle();
  },
  async fetStoreiInfoHandle() {
    // [改动] fetchData → post()
    try {
      const res = await post('/getStore', {}, { showError: false });
      const types = this.data.types;
      const fwtypes = this.data.fwtypes;

      const stype = res.data.info.stype;
      let fwtype = res.data.info.fwtype;
      let country = res.data.info.areas;
      fwtype = (fwtype != null) ? fwtype.split(',').map(Number) : [];
      country = (country != null) ? country.split(',').map(Number) : [];
      this.setData({
        userinfo: res.data.userinfo,
        storeInfo: res.data.info,
        options: res.data.ftys,
        fileList: res.data.info.shop_logo ? [{
          'url': res.data.info.shop_logo
        }] : [],
        imgTmp: res.data.info.shop_logo,
        shop_name: res.data.info.shop_name,
        shop_name_en: res.data.info.shop_name_en,
        shop_status: res.data.info.status == 1 ? app.globalData.languagePack.opening : app.globalData.languagePack.not_open,
        shop_time: res.data.info.uptime,
        shop_desc: res.data.info.shop_desc,
        tel: res.data.info.tel,
        address: res.data.info.address,
        website: res.data.info.website,
        typeText: res.data.info.type == 0 ? app.globalData.languagePack.please_select : this.findValue(res.data.info.type, types),
        typeValue: [Number(res.data.info.type)],
        fwtypeText: fwtype.length == 0 ? app.globalData.languagePack.please_select : this.getLabelsByValues(fwtype, fwtypes),
        fwtypeValue: fwtype,
        countryText: country.length == 0 ? app.globalData.languagePack.please_select : this.getLabelsByValues(country, res.data.region),
        countryValue: country,
        regionText: this.findValue(res.data.info.region, res.data.region),
        regionValue: [res.data.info.region],
        regions: res.data.region,
        demoCheckboxMax: stype != null ? stype : [],
        typeTitle: stype != null ? this.getLeftValuesSafe(stype) : app.globalData.languagePack.select_main_products
      });
    } catch (error) {
      // console.error('请求失败', error);
    }
  },
  findValue(value, data) {
    const foundItems = data.filter(item => item.value == value);
    return foundItems[0] ? foundItems[0].label : '';
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
      key: value,
      storeInfo: storeInfo
    });

  },

  onColumnChange(e) {
    //console.log('picker pick:', e);
  },
  onPickerChange1(e) {
    const {
      key
    } = e.currentTarget.dataset;
    const {
      value
    } = e.detail;
    this.setData({
      [`${key}Value`]: value,
    });
    this.addInfo(key, value[0]);
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
      [`${key}Value`]: value,
      [`${key}Text`]: label[0],
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

  onPickerConfirm(e) {
    // console.log(e);

    const {
      key
    } = e.currentTarget.dataset;
    const {
      fwtypeValue,
      fwtypes,
      countryValue,
      regions
    } = this.data;
    // console.log(this.data.regions);
    // if (fwtypeValue.length == 0) {
    //   wx.showToast({
    //     title: '至少选择一项吧',
    //     icon: 'none',
    //     duration: 2000
    //   });
    //   return false;
    // }
    this.setData({
      [`${key}Visible`]: false,
    });
    this.setData({
      [`${key}Visible`]: false,
      [`${key}Text`]: key == 'fwtype' ? (fwtypeValue.length != 0 ? this.getLabelsByValues(fwtypeValue, fwtypes) : app.globalData.languagePack.please_select) : this.getLabelsByValues(countryValue, regions),
    });
    //console.log(this.data.countryText);
    if (key == 'fwtype') {
      this.addInfo(key, fwtypeValue.join(','));
    } else {
      this.addInfo(key, countryValue.join(','));
    }

  },
  getLabelsByValues(oneDArray, twoDArray) {
    return twoDArray
      .filter(item => oneDArray.includes(item.value)) // 筛选出符合条件的对象
      .map(item => item.label).join(','); // 提取 label 属性
  },
  onXZPicker() {
    const visible = this.data.visible
    this.setData({
      visible: !visible,
    });
  },
  onTitlePicker() {
    this.setData({
      typeVisible: true,
    });
  },
  onfwTitlePicker() {
    this.setData({
      fwtypeVisible: true,
    });
  },
  onCountryTitlePicker() {
    this.setData({
      countryVisible: true,
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
      imgTmp: files[0].url
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
        res.data = JSON.parse(res.data);
        if (res.data.code == 1) {
          that.addInfo('imgs', res.data.filepath);
          that.setData({
            fileList: [{
              'url': res.data.filepath
            }],
            imgTmp: res.data.filepath
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
      imgTmp: ''
    });
  },
  goback: function () {
    wx.navigateBack({
      delta: 1
    });
  },
  onFormSubmit: function (e) {
    // [改动] wx.request → post()
    const formData = this.data.storeInfo;
    const imgTmp = this.data.imgTmp;
    let demoCheckboxMax = this.data.demoCheckboxMax;
    formData.stype = demoCheckboxMax.length > 0 ? this.getRightValuesSafe(demoCheckboxMax) : [];
    formData.shop_logo = imgTmp;
    formData.lang = app.globalData.languagePack.lang;
    this.sendFormData(formData);
  },
  sendFormData: async function (data) {
    try {
      const res = await post('/setStore', data, { showError: false });
      wx.showToast({
        title: res.msg,
        icon: 'success',
        duration: 3000,
        mask: true,
        complete: () => {
          setTimeout(() => {
            wx.navigateBack({
              delta: 1
            });
          }, 2000);
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