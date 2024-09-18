// pages/my/approve/auhor/index.js
Page({

  /**
   * 页面的初始数据
   */

  data: {
    items: 1,
    itemTitle: '个人认证',
    statusbar: '',
    jiaonangheight: '',
    grInfos: {},
    qyInfos: {},
    regionText: '中国',
    regionValue: [96],
    regionTitle: '',
    regions: {},

    typeText: '身份证',
    typeValue: [1, 2],
    typeTitle: '',
    types: [{
        label: '身份证',
        value: 1
      },
      {
        label: '个体工商户',
        value: 2,
      },
      {
        label: '护照',
        value: 3,
      }
    ],
    fileList: [],
    imgTmp: '',
    btnText: '立即认证',
    btnStatus: false,
    companyStatus: 0,
    companyMsg: '',
    companyTime: '',
    companyType: 0,
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
    const res = wx.getMenuButtonBoundingClientRect();
    this.setData({
      statusbar: res.top, // 胶囊顶部高度
      jiaonangheight: res.height // 胶囊高度
    })

    if (options.items) {
      this.setData({
        items: options.items,
        itemTitle: options.items == 2 ? '企业认证' : '个人认证'
      });
    }
    this.addInfo('region', 96);
    let that = this;
    const types = this.data.types;
    wx.request({
      url: 'https://kpy.phanlink.com/v1/getRegion', // 服务器地址
      method: 'POST',
      data: {
        'token': token
      },

      success: function (res) {
        //console.log(res);
        if (res.data.code === 1) {
          let gr_infos = JSON.parse(res.data.data.info.gr_infos)
          let qy_infos = JSON.parse(res.data.data.info.qy_infos)
          that.setData({
            //items: res.data.data.info.company_type,
            //itemTitle: res.data.data.info.company_type == 2 ? '企业认证' : '个人认证',
            regions: res.data.data.region,
            grInfos: gr_infos,
            qyInfos: qy_infos,
            companyStatus: res.data.data.info.company_status,
            companyMsg: res.data.data.info.company_msg,
            companyTime: res.data.data.info.company_time,
            companyType: res.data.data.info.company_type,
            fileList: [{
              'url': options.items == 1 ? gr_infos.imgs : qy_infos.imgs
            }],
            imgTmp: options.items == 1 ? gr_infos.imgs : qy_infos.imgs,
            regionText: that.findValue(options.items == 1 ? parseInt(gr_infos.region) : parseInt(qy_infos.region), res.data.data.region),
            regionValue: [options.items == 1 ? parseInt(gr_infos.region) : parseInt(qy_infos.region)],
            typeText: that.findValue(gr_infos.type, types),
            typeValue: [gr_infos.type],
          });
        }
        console.log(that.data)
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
  findValue(value, data) {
    const foundItems = data.filter(item => item.value === value);
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
    console.log('picker pick:', e);
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
      regionTitle: '选择国家'
    });
  },
  onTitlePicker() {
    this.setData({
      typeVisible: true,
      typeTitle: '选择证件类型'
    });
  },
  handleAdd(e) {
    const {
      fileList
    } = this.data;
    const {
      files
    } = e.detail;

    // 方法1：选择完所有图片之后，统一上传，因此选择完就直接展示
    this.setData({
      fileList: [...fileList, ...files], // 此时设置了 fileList 之后才会展示选择的图片
      imgTmp: files[0].url
    });
    this.onUpload(files[0].url);
    //console.log(files[0].url);

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
    const items = this.data.items;
    const formData = items == 1 ? this.data.grInfos : this.data.qyInfos;

    const imgTmp = this.data.imgTmp;
    const token = wx.getStorageSync('token');
    formData.token = token;
    formData.items = items;
    formData.imgs = imgTmp;
    //console.log(formData);
    // 发送数据到服务器
    this.sendFormData(formData);
  },
  sendFormData: function (data) {
    const url = 'https://kpy.phanlink.com/v1/setGrApprove'
    const url1 = 'https://kpy.phanlink.com/v1/setQyApprove'
    wx.request({
      url: data.items == 1 ? url : url1, // 服务器地址
      method: 'POST',
      data: data,
      success: function (res) {
        console.log(res);
        if (res.data.code == 1) {
          wx.showToast({
            title: res.data.msg,
            icon: 'success',
            duration: 2000,
            mask: true,
            complete: () => {
              wx.navigateBack({
                delta: 2
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