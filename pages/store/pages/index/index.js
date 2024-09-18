// pages/my/approve/auhor/index.js
Page({
  data: {
    storeInfo: [],
    options: [],
    demoCheckboxMax: [],
    itemTitle: '商家配置',
    statusbar: '',
    jiaonangheight: '',
    shop_name: '',
    shop_status: '',
    shop_time: '',
    shop_desc: '',
    address: '',
    typeText: '商家性质',
    typeValue: [1],
    typeTitle: '选择主营产品',
    types: [{
        label: '厂家',
        value: 1
      },
      {
        label: '贸易商',
        value: 2,
      },
      {
        label: '服务商',
        value: 3,
      }
    ],
    fileList: [],
    imgTmp: '',
    btnText: '保存',
    btnStatus: false,
    visible: false,
    disselect: false,
    fwtypeVisible: false,
    fwtypeText: '服务分类',
    fwtypeValue: [1],
    fwtypes: [{
        label: '清关服务',
        value: 1
      },
      {
        label: '融资服务',
        value: 2,
      },
      {
        label: '代采服务',
        value: 3,
      },
      {
        label: '冷库及物流',
        value: 4,
      }
    ],
    regionText: '中国',
    regionValue: [96],
    regionTitle: '',
    regions: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */

  onRegionPicker() {
    this.setData({
      regionVisible: true,
      regionTitle: '选择国家'
    });
  },
  onSelectChange(e) {

    const {
      value
    } = e.detail;

    var label = '';
    var selected = [];
    if (value.length > 0) {
      for (let i = 0; i < value.length; i++) {
        label += this.splitStringAtDelimiter(value[i], '-')[0] + ',';
        selected.push(this.splitStringAtDelimiter(value[i], '-')[1]);
      }
    } else {
      label = '选择主营产品'
    }
    this.setData({
      demoCheckboxMax: selected,
      typeTitle: label,
    })
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
    let token = wx.getStorageSync('token');
    if (!token) {
      // 用户未登录，跳转到登录页面
      wx.navigateTo({
        url: '/pages/tabbar/login/login',
      });
    }
    const res = wx.getMenuButtonBoundingClientRect();
    this.setData({
      statusbar: res.top, // 胶囊顶部高度
      jiaonangheight: res.height // 胶囊高度
    })

    this.fetStoreiInfoHandle();
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
      const url = 'https://kpy.phanlink.com/v1/getStore';
      const res = await this.fetchData(url);
      const types = this.data.types;
      const fwtypes = this.data.fwtypes;
      if (res.code == 1) {
        this.setData({
          storeInfo: res.data.info,
          options: res.data.ftys,
          fileList: [{
            'url': res.data.info.shop_logo
          }],
          imgTmp: res.data.info.shop_logo,
          shop_name: res.data.info.shop_name,
          shop_status: res.data.info.status == 1 ? '已开通' : '未开通',
          shop_time: res.data.info.uptime,
          shop_desc: res.data.info.shop_desc,
          address: res.data.info.address,
          typeText: this.findValue(res.data.info.type, types),
          typeValue: [res.data.info.type],
          fwtypeText: this.findValue(res.data.info.fwtype, fwtypes),
          fwtypeValue: [res.data.info.fwtype],
          regionText: this.findValue(res.data.info.region, res.data.region),
          regionValue: [res.data.info.region],
          regions: res.data.region,
        });
      }
    } catch (error) {
      console.error('请求失败', error);
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
      url: 'https://kpy.phanlink.com/v1/uploadImgs', // 仅为示例，非真实的接口地址
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
            title: res.data.msg,
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

    const formData = this.data.storeInfo;
    const imgTmp = this.data.imgTmp;
    const demoCheckboxMax = this.data.demoCheckboxMax;
    const token = wx.getStorageSync('token');
    formData.token = token;
    formData.stype = demoCheckboxMax;
    formData.shop_logo = imgTmp;
    //console.log(formData);
    // 发送数据到服务器
    this.sendFormData(formData);
  },
  sendFormData: function (data) {
    const url = 'https://kpy.phanlink.com/v1/setStore'
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
              wx.navigateBack({
                delta: 1
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