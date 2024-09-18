Page({
  data: {
    itemTitle: '商品发布',
    statusbar: '',
    jiaonangheight: '',
    imgList: [],
    imgsList: [],
    typeText: ['请选择', '请选择', '请选择', '请选择', new Date().toISOString().substring(0, 10), new Date().toISOString().substring(0, 10), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10)],
    typeTitle: ['商品种类', '商品分类', '商品性质', '原产地', '生产时间', '开始时间', '结束时间'],
    typeValue: [0, 0, 0, 0, Date.now(), Date.now(), Date.now() + 7 * 24 * 60 * 60 * 1000],
    typeCurrentValue: 0,
    typeCurrentIndex: 0,
    typeCurrentTitle: '商品种类',
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
      label: "活"
    }, {
      value: 2,
      label: "冰鲜"
    }, {
      value: 3,
      label: "冻品"
    }, {
      value: 4,
      label: "干(盐)品"
    }],
    regionList: [],
    typeList: [],
    minDate: Date.now() - 7 * 24 * 60 * 60 * 1000,
    maxDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
  },


  onLoad(options) {
    let itemTitle = this.data.itemTitle;
    let btype = this.data.btype;
    let goodsId = this.data.goodsId;
    if (options.goodsId) {
      goodsId = options.goodsId;
    }
    if (options.lx == 2) {
      itemTitle = '求购发布';
      btype = 2;
    }
    this.setData({
      itemTitle: itemTitle,
      btype: btype,
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
    console.log(e);
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
          [`typeText[1]`]: '请选择',
          [`typeValue[1]`]: 0,
        });
      }
      if (index == 1) {
        if (this.data.typeValue[0] == 0) {
          wx.showToast({
            title: '请先选择商品种类',
            icon: 'loading',
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
      if (index > 4 && this.data.goodsId > 0) {
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
          [`typeText[1]`]: '请选择',
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
    this.fetchHomeDatas(true);
  },
  fetchHomeDatas: async function (fresh = false) {
    if (fresh) {
      wx.pageScrollTo({
        scrollTop: 0,
      });
    }

    this.setData({
      loadStatus: 1
    });
    const url = 'https://kpy.phanlink.com/v1/getGoodsAddDatas';
    const formData = {};
    formData.token = wx.getStorageSync('token');
    formData.goodsId = this.data.goodsId;
    const res = await this.fetchDatas(url, formData);
    if (res.code == 1) {
      const nextList = res.result;
      const goodsInfo = nextList.goodsInfo;
      this.setData({
        regionList: nextList.regions,
        typeList: nextList.ftys,
      });
      if (goodsInfo.goodsId > 0) {
        this.setData({
          btype: goodsInfo.btype,
          goodsId: goodsInfo.goodsId,
          goodsInfo: goodsInfo.goodsInfo,
          goodsSpec: goodsInfo.goodsSpec,
          imgList: goodsInfo.pic,
          imgsList: goodsInfo.pics,
          hbType: goodsInfo.hbType,
          typeText: goodsInfo.typeText,
          typeValue: goodsInfo.typeValue,
          itemTitle: goodsInfo.btype == 1 ? '商品编辑' : '求购编辑',
        });
        this.jjZJ();
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
      url: 'https://kpy.phanlink.com/v1/uploadImgs', // 仅为示例，非真实的接口地址
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
            that.setData({
              imgList: [{
                'url': res.data.filepath
              }]
            });
          }

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
    const index1 = e.currentTarget.dataset.index;
    const {
      index
    } = e.detail;
    const {
      imgList,
      imgsList
    } = this.data;
    if (index1 == 1) {
      imgsList.splice(index, 1);
      this.setData({
        imgsList
      });
    } else {
      imgList.splice(index, 1);
      this.setData({
        imgList
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
      zaMount: parseFloat(zaMount).toFixed(2),
      zWeight: parseFloat(zWeight).toFixed(2),
      zTotal: parseFloat(zTotal).toFixed(2),
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
      typeText: ['请选择', '请选择', '请选择', '请选择', new Date().toISOString().substring(0, 10), new Date().toISOString().substring(0, 10), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10)],
      typeValue: [0, 0, 0, 0, Date.now(), Date.now(), Date.now() + 7 * 24 * 60 * 60 * 1000],
      goodsSpec: [{
        a1: '',
        a2: '',
        a3: '',
        a4: '',
        a5: '',
        a8: ''
      }],
      imgList: [],
      imgsList: [],
      goodsInfo: {}
    });

  },
  async handleTJForm() {
    const formData = {};
    formData.token = wx.getStorageSync('token');
    formData.typeValue = this.data.typeValue;
    formData.goodsId = this.data.goodsId;
    formData.imgList = this.data.imgList;
    formData.imgsList = this.data.imgsList;
    formData.goodsSpec = this.data.goodsSpec;
    formData.goodsInfo = this.data.goodsInfo;
    formData.btype = this.data.btype;
    formData.hbType = this.data.hbType;
    const url = 'https://kpy.phanlink.com/v1/setGoodsAddDatas';
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

  },
})