Page({
  data: {
    formats: {},
    content: "",
    statusbar: "",
    jiaonangheight: "",
    itemTitle: "资讯发布",
    typesList: [{
      value: 3,
      label: '行业资讯'
    }, {
      value: 5,
      label: '价格走势'
    }, {
      value: 6,
      label: '政策法规'
    }],
    typeVisible: false,
    typeText: '',
    typeValue: [0],
    artId: 0,
    imgList: [],
    artTitle: ''
  },
  onLoad: function (options) {
    const res = wx.getMenuButtonBoundingClientRect()
    this.setData({
      statusbar: res.top,
      jiaonangheight: res.height
    })
    if (options.artId > 0) {
      this.setData({
        artId: options.artId
      })
    }
    this.init();
  },
  goback: function () {
    wx.navigateBack({
      delta: 1
    });
  },
  onTypePicker(e) {
    this.setData({
      typeVisible: true,
    })
  },
  handleCancel(e) {
    this.setData({
      typeVisible: false,
    })
  },
  handleConfirm(e) {
    const {
      value,
      label
    } = e.detail;
    this.setData({
      typeText: label.join(' '),
      typeValue: value,
    });

  },
  init() {
    let token = wx.getStorageSync('token');
    if (!token) {
      // 用户未登录，跳转到登录页面
      wx.navigateTo({
        url: '/pages/tabbar/login/login',
      });
    }
    const artId = this.data.artId;
    if (artId > 0) {
      this.fetchHomeDatas();
    }

  },
  fetchHomeDatas: async function () {
    const url = 'https://kpy.phanlink.com/v1/getArtAddDatas';
    const formData = {};
    formData.token = wx.getStorageSync('token');
    formData.artId = this.data.artId;
    const res = await this.fetchDatas(url, formData);
    if (res.code == 1) {
      const nextList = res.result;
      if (nextList.artId > 0) {
        this.setData({
          artId: nextList.artId,
          artTitle: nextList.artTitle,
          imgList: nextList.pic,
          typeValue: nextList.typeValue,
          content: nextList.content,
          typeText: nextList.typeText,
          itemTitle: '资讯编辑',
        });
        this.readyEditor();
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
  handleGrInfos(e) {
    const {
      value
    } = e.detail;

    this.setData({
      artTitle: value
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
      url: 'https://kpy.phanlink.com/v1/uploadImgs',
      filePath: file,
      name: 'file',
      formData: {},
      success: (res) => {
        res.data = JSON.parse(res.data);
        if (res.data.code == 1) {

          that.setData({
            imgList: [{
              'url': res.data.filepath
            }]
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
      imgList: [],
      artTitle: '',
      typeValue: [0],
      content: '',
    });
    this.readyEditor();
  },
  async handleTJForm() {
    const formData = {};
    formData.token = wx.getStorageSync('token');
    formData.artId = this.data.artId;
    formData.artTitle = this.data.artTitle;
    formData.imgList = this.data.imgList;
    formData.typeValue = this.data.typeValue[0];
    formData.content = this.data.content;
    if (formData.artTitle == '') {
      wx.showToast({
        title: '请填写资讯标题！',
        icon: 'loading',
        duration: 500
      });
      return false;
    }
    if (formData.typeValue == 0) {
      wx.showToast({
        title: '请选择资讯栏目！',
        icon: 'loading',
        duration: 500
      });
      return false;
    }
    if (formData.imgList.length == 0) {
      wx.showToast({
        title: '请上传一张资讯封面图！',
        icon: 'loading',
        duration: 500
      });
      return false;
    }
    if (formData.content == '') {
      wx.showToast({
        title: '不能发布空资讯！',
        icon: 'loading',
        duration: 500
      });
      return false;
    }
    const url = 'https://kpy.phanlink.com/v1/setArtAddDatas';
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
  // editor初始化
  readyEditor() {
    wx.createSelectorQuery().select('#editor').context((res) => {
      this.editorCtx = res.context
      this.editorCtx.setContents({
        html: this.data.content
      });
    }).exec()
  },

  //配置选项 
  formatOpt(e) {
    let {
      name,
      value
    } = e.target.dataset
    this.editorCtx.format(name, value)
  },

  // 上传图片
  insertImage(e) {
    console.log(e);
    wx.chooseImage({
      count: 1,
      success: (re) => {
        const task = wx.uploadFile({
          url: 'https://kpy.phanlink.com/v1/uploadImgs',
          filePath: re.tempFilePaths[0],
          name: 'file',
          formData: {},
          success: (res) => {
            res.data = JSON.parse(res.data);
            if (res.data.code == 1) {
              this.editorCtx.insertImage({
                src: res.data.filepath,
                width: '100%'
              })
              wx.showToast({
                title: res.data.msg,
                icon: 'success',
                duration: 2000
              });
            }
          },
        });
      }
    })
  },

  // 内容格式
  changeEditor(e) {
    this.setData({
      formats: e.detail
    })
    //console.log(this.data.formats)
  },

  // 监听输入内容
  inputEditor(e) {
    this.setData({
      content: e.detail.html
    })
    //console.log(e.detail.html)
  }
})