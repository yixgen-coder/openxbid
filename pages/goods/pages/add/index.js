const app = getApp()
// [改动] 引入统一请求层和认证服务
const { post } = require('../../../../utils/request')
const { requireLogin } = require('../../../../services/auth')
// [改动] 硬编码 URL → config 常量
const { API_BASE } = require('../../../../utils/config')
Page({
  data: {
    globalLangData: app.globalData.languagePack,
    itemTitle: app.globalData.languagePack.post_product,
    statusbar: '',
    jiaonangheight: '',
    imgsList: [],
    typeText: [app.globalData.languagePack.please_select, app.globalData.languagePack.please_select, app.globalData.languagePack.please_select, app.globalData.languagePack.please_select, new Date().toISOString().substring(0, 10), new Date().toISOString().substring(0, 10), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10)],
    typeTitle: [app.globalData.languagePack.type, app.globalData.languagePack.classification, app.globalData.languagePack.product_type, app.globalData.languagePack.country_of_origin, app.globalData.languagePack.production_date, app.globalData.languagePack.start_date, app.globalData.languagePack.end_date],
    typeValue: [0, 0, 0, 0, Date.now(), Date.now(), Date.now() + 7 * 24 * 60 * 60 * 1000],
    typeCurrentValue: 0,
    typeCurrentIndex: 0,
    typeCurrentTitle: app.globalData.languagePack.type,
    typesCurrentList: [],
    typeVisible: false,
    dateVisible: false,
    hbType: 1,
    zaMount: 0,
    zTotal: 0,
    zWeight: 0,

    goodsSpec: [{
      a1: '',
      a2: '',
      a3: '',
      a4: '',
      a5: '',
      a8: ''
    }],
    regionList: [],
    btype: 1,
    goodsId: 0,
    goodsInfo: {},
    xzList: [{
      value: 1,
      label: app.globalData.languagePack.live
    }, {
      value: 2,
      label: app.globalData.languagePack.fresh
    }, {
      value: 3,
      label: app.globalData.languagePack.frozen
    }, {
      value: 4,
      label: app.globalData.languagePack.dry_salt
    }],
    regionList: [],
    typeList: [],
    minDate: Date.now() - 7 * 24 * 60 * 60 * 1000,
    maxDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
    dc: 0,
    disabled: false,
    newg: 0,
    orderStatus: 1,
  },
  onLoad(options) {
    let itemTitle = this.data.itemTitle;
    let btype = this.data.btype;
    let newg = this.data.newg;
    let goodsId = this.data.goodsId;
    if (options.lx == 2) {
      itemTitle = app.globalData.languagePack.post_buying_request;
      btype = 2;
    }
    if (options.newg == 1) {
      newg = 1;
    }
    if (options.goodsId) {
      goodsId = options.goodsId;
    } else {
      if (btype == 2) {
        this.setData({
          goodsSpec: [{
            a1: '',
            a2: '',
            a3: '',
            a4: '',
            a5: '',
            a8: 1
          }],
        })
      }
    }
    this.setData({
      itemTitle: itemTitle,
      btype: btype,
      newg: newg,
      goodsId: goodsId,
    })
    this.init();
  },
  goback: function () {
    wx.navigateBack({
      delta: 1
    });
  },
  onTypePicker(e) {
    //console.log(e);
    let {
      typeCurrentIndex,
      typeCurrentTitle,
      typeTitle,
      minDate,
      maxDate,
      typeValue
    } = this.data;
    const {
      index
    } = e.currentTarget.dataset;

    if (index < 4) {
      let typesCurrentList = [];
      if (index == 0) {
        typesCurrentList = this.data.typeList.filter(item => item.pid === 0);
        this.setData({
          [`typeText[1]`]: app.globalData.languagePack.please_select,
          [`typeValue[1]`]: 0,
        });
      }
      if (index == 1) {
        if (this.data.typeValue[0] == 0) {
          wx.showToast({
            title: app.globalData.languagePack.please_select_the_product_type,
            icon: 'none',
            duration: 500
          });
          return false;
        }
        typesCurrentList = this.data.typeList.filter(item => item.pid === this.data.typeValue[0]);
      }
      if (index == 2) {

        typesCurrentList = this.data.xzList;
      }
      if (index == 3) {

        typesCurrentList = this.data.regionList;
      }
      this.setData({
        typeVisible: true,
        typeCurrentIndex: index,
        typeCurrentTitle: typeTitle[index],
        typesCurrentList: typesCurrentList,
        typeCurrentValue: [typeValue[index]]
      })
    } else {
      if (index == 4) {
        minDate = Date.now() - 30 * 24 * 60 * 60 * 1000;
        maxDate = Date.now() + 30 * 24 * 60 * 60 * 1000;
      }
      if (index > 4 && this.data.goodsId > 0 && this.data.newg == 0) {
        return false;
      }
      if (index == 5) {

        minDate = Date.now();
        maxDate = Date.now() + 7 * 24 * 60 * 60 * 1000;
      }
      if (index == 6) {
        minDate = typeValue[5];
        maxDate = typeValue[5] + 7 * 24 * 60 * 60 * 1000;
      }
      this.setData({
        dateVisible: true,
        minDate: minDate,
        maxDate: maxDate,
        typeCurrentIndex: index,
        typeCurrentTitle: typeTitle[index],
        typeCurrentValue: typeValue[index]
      })
    }
  },
  goodsSetDc(e) {
    const {
      checked
    } = e.detail;
    this.setData({
      dc: checked ? 1 : 0
    })
  },
  handleCancel(e) {
    const {
      index
    } = e.currentTarget.dataset;
    if (index < 4) {
      this.setData({
        typeVisible: false,
      })
    } else {
      this.setData({
        dateVisible: false,
      })
    }
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    wx.stopPullDownRefresh();
  },
  handleConfirm(e) {

    const {
      index
    } = e.currentTarget.dataset;
    const {
      value
    } = e.detail;
    if (index < 4) {

      const {
        label
      } = e.detail;
      this.setData({
        [`typeText[${index}]`]: label.join(' '),
        [`typeValue[${index}]`]: value[0],
      });
      if (index == 0) {
        this.setData({
          [`typeText[1]`]: app.globalData.languagePack.please_select,
          [`typeValue[1]`]: 0,
        });
      }
    } else {
      const format = (val) => {
        const date = new Date(val);
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      };
      if (index == 5) {
        let va = value + 7 * 24 * 60 * 60 * 1000;
        this.setData({
          [`typeText[${6}]`]: format(va),
          [`typeValue[${6}]`]: va,
        });
      }
      this.setData({
        [`typeText[${index}]`]: format(value),
        [`typeValue[${index}]`]: value,
      });
    }
  },
  init() {
    // [改动] 登录检查 → requireLogin()
    if (!requireLogin()) return;
    const res = wx.getMenuButtonBoundingClientRect();
    this.setData({
      statusbar: res.top,
      jiaonangheight: res.height
    })
    this.fetchHomeDatas(true);
  },
  fetchHomeDatas: async function (fresh = false) {
    if (fresh) {
      wx.pageScrollTo({ scrollTop: 0 });
    }
    this.setData({ loadStatus: 1 });
    // [改动] fetchDatas → post()
    try {
      const res = await post('/getGoodsAddDatas', {
        goodsId: this.data.goodsId,
        lang: app.globalData.languagePack.lang,
        newg: this.data.newg
      }, { showError: false });
      const nextList = res.result;
      const goodsInfo = nextList.goodsInfo;
      this.setData({
        regionList: nextList.regions,
        typeList: nextList.ftys,
      });
      if (goodsInfo.goodsId > 0) {
        this.setData({
          orderStatus: goodsInfo.order_status,
          dc: goodsInfo.dc,
          btype: goodsInfo.btype,
          goodsId: goodsInfo.goodsId,
          goodsInfo: goodsInfo.goodsInfo,
          goodsSpec: goodsInfo.goodsSpec,
          imgsList: goodsInfo.pics,
          hbType: goodsInfo.hbType,
          typeText: goodsInfo.typeText,
          typeValue: goodsInfo.typeValue,
          itemTitle: goodsInfo.btype == 1 ? app.globalData.languagePack.product_editor : app.globalData.languagePack.buying_editor,
        });
        this.jjZJ();
      }
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
        })
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
  onUpload(file, index) {

    let that = this;
    const task = wx.uploadFile({
      url: `${API_BASE}/uploadImgs`, // [改动] 硬编码 URL → config 常量
      filePath: file,
      name: 'file',
      formData: {},
      success: (res) => {
        res.data = JSON.parse(res.data);
        if (res.data.code == 1) {
          if (index == 1) {
            const {
              imgsList
            } = this.data;

            that.setData({
              imgsList: imgsList.concat([{
                'url': res.data.filepath
              }])
            });
          } else {

          }

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
    const index1 = e.currentTarget.dataset.index;
    const {
      index
    } = e.detail;
    const {
      imgsList
    } = this.data;
    if (index1 == 1) {
      imgsList.splice(index, 1);
      this.setData({
        imgsList
      });
    }
  },
  handleHBType() {
    let hbType = this.data.hbType == 1 ? 2 : 1;
    this.setData({
      hbType: hbType
    });
  },
  handleAddBJ() {
    const goodsSpec = this.data.goodsSpec;
    const addInfo = goodsSpec[goodsSpec.length - 1];
    this.setData({
      goodsSpec: goodsSpec.concat([{
        a1: addInfo.a1,
        a2: addInfo.a2,
        a3: addInfo.a3,
        a4: addInfo.a4,
        a5: addInfo.a5,
        a8: addInfo.a8
      }])
    });
    this.jjZJ();
  },
  handleDelBJ(e) {
    const index = e.currentTarget.dataset.index;

    const {
      goodsSpec
    } = this.data;
    goodsSpec.splice(index, 1);
    this.setData({
      goodsSpec
    });
    this.jjZJ();
  },
  jjZJ() {
    let goodsSpec = this.data.goodsSpec;
    let zaMount = 0,
      zTotal = 0,
      zWeight = 0;
    for (let i = 0; i < goodsSpec.length; i++) {
      zaMount += parseFloat(goodsSpec[i].a3);
      zWeight += parseFloat(goodsSpec[i].a4);
      zTotal += parseFloat(goodsSpec[i].a4) * parseFloat(goodsSpec[i].a5);
    }

    this.setData({
      zaMount: !isNaN(parseFloat(zaMount).toFixed(2)) ? parseFloat(zaMount).toFixed(2) : 0,
      zWeight: !isNaN(parseFloat(zWeight).toFixed(2)) ? parseFloat(zWeight).toFixed(2) : 0,
      zTotal: !isNaN(parseFloat(zTotal).toFixed(2)) ? parseFloat(zTotal).toFixed(2) : 0,
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
  handleBjInfos(e) {
    const {
      index,
      key
    } = e.currentTarget.dataset;
    const {
      value
    } = e.detail;
    const {
      goodsSpec
    } = this.data;

    this.setData({
      [`goodsSpec[${index}].${key}`]: value,
    });
    if (key == 'a3' || key == 'a8') {
      this.setData({
        [`goodsSpec[${index}].a4`]: !isNaN(goodsSpec[index].a3 * goodsSpec[index].a8) ? goodsSpec[index].a3 * goodsSpec[index].a8 : 0,
      });
    }
    this.jjZJ();
  },
  addInfo: function (key, value) {
    let {
      goodsInfo
    } = this.data;
    goodsInfo[key] = value;
    this.setData({
      goodsInfo: goodsInfo,
    });
  },
  handleReset() {
    this.setData({
      typeText: [app.globalData.languagePack.please_select, app.globalData.languagePack.please_select, app.globalData.languagePack.please_select, app.globalData.languagePack.please_select, new Date().toISOString().substring(0, 10), new Date().toISOString().substring(0, 10), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10)],
      typeValue: [0, 0, 0, 0, Date.now(), Date.now(), Date.now() + 7 * 24 * 60 * 60 * 1000],
      goodsSpec: [{
        a1: '',
        a2: '',
        a3: '',
        a4: '',
        a5: '',
        a8: ''
      }],
      imgsList: [],
      goodsInfo: {}
    });

  },
  async handleTJForm() {
    const formData = {};
    formData.typeValue = this.data.typeValue;
    formData.goodsId = this.data.goodsId;
    formData.dc = this.data.dc;
    formData.imgsList = this.data.imgsList;
    formData.goodsSpec = this.data.goodsSpec;
    formData.goodsInfo = this.data.goodsInfo;
    formData.btype = this.data.btype;
    formData.newg = this.data.newg;
    formData.hbType = this.data.hbType;
    formData.lang = app.globalData.languagePack.lang;
    if (formData.goodsId > 0 && this.data.orderStatus == 0) {
      const {
        confirm
      } = await new Promise(resolve =>
        wx.showModal({
          title: app.globalData.languagePack.reminder,
          content: formData.lang == 1 ? 'You have a quotation currently being posted. Do you need to repost it?' : '您有一个报价正在发布，需要重新发布吗？',
          confirmText: app.globalData.languagePack.sure,
          cancelText: app.globalData.languagePack.cancel,
          success: resolve,
          fail: () => resolve({ confirm: false })
        })
      )
      if (!confirm) {
        return false;
      }
    }
    this.setData({ disabled: true });
    // [改动] fetchDatas → post()
    try {
      const res = await post('/setGoodsAddDatas', formData, { showError: false });
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
      if (res.code == -1) {
        wx.showModal({
          title: app.globalData.languagePack.reminder,
          content: res.msg,
          confirmText: app.globalData.languagePack.sure,
          cancelText: app.globalData.languagePack.back,
          success: (res) => {
            if (res.cancel) { wx.navigateBack() }
          }
        })
      } else if (res.code == -2) {
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
        })
      } else {
        wx.showToast({ title: res.msg, icon: 'none', duration: 500 });
      }
    }
    this.setData({ disabled: false });
  },
})