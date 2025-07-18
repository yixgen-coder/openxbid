const app = getApp()
Page({
  data: {
    globalLangData: app.globalData.languagePack,
    formats: {},
    content: "",
    statusbar: "",
    jiaonangheight: "",
    itemTitle: app.globalData.languagePack.publish_news,
    typesList: [{
      value: 3,
      label: app.globalData.languagePack.supply_board
    }, {
      value: 5,
      label: app.globalData.languagePack.market_intelligence
    }, {
      value: 6,
      label: app.globalData.languagePack.regulatory_updates
    }],
    typeVisible: false,
    typeText: '',
    typeValue: [0],
    artId: 0,
    imgList: [],
    artTitle: '',
    disabled: false
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
      wx.showModal({
        title: app.globalData.languagePack.reminder, // 标题
        content: app.globalData.languagePack.function_registered, // 内容
        cancelText: app.globalData.languagePack.cancel, // 取消按钮文字（可选，默认为"取消"）
        confirmText: app.globalData.languagePack.login, // 确认按钮文字（可选，默认为"确定"）
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/tabbar/login/login',
            });
          } else if (res.cancel) {
            wx.navigateBack();
          }
        }
      })
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
          itemTitle: app.globalData.languagePack.lang == 1 ? 'News Edit' : '资讯编辑',
        });
        this.readyEditor();
      }
      wx.showToast({
        title: res.msg,
        icon: 'none',
        duration: 500
      });
    } else {
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
      artTitle: this.filterEmojis(value)
    });

  },
  filterEmojis(text) {
    // 匹配常见表情符号（包括Emoji、颜文字等）
    const emojiRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27BF]|[\uD83C][\uDF00-\uDFFF]|[\uD83D][\uDC00-\uDE4F]/g;
    return text.replace(emojiRegex, '');
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
    formData.lang = app.globalData.languagePack.lang;
    if (formData.artTitle == '') {

      wx.showModal({
        title: app.globalData.languagePack.reminder,
        content: app.globalData.languagePack.lang == 1 ? 'Please fill in the title of the information!' : '请填写资讯标题！',
        showCancel: false, // 隐藏取消按钮
        confirmText: app.globalData.languagePack.sure, // 自定义确认按钮文案
        confirmColor: "#007AFF", // 自定义确认按钮颜色
      });
      return false;
    }
    if (formData.typeValue == 0) {
      wx.showModal({
        title: app.globalData.languagePack.reminder,
        content: app.globalData.languagePack.lang == 1 ? 'Please select the information column!' : '请选择资讯栏目！',
        showCancel: false, // 隐藏取消按钮
        confirmText: app.globalData.languagePack.sure, // 自定义确认按钮文案
        confirmColor: "#007AFF", // 自定义确认按钮颜色
      });
      return false;
    }
    if (formData.imgList.length == 0) {
      wx.showModal({
        title: app.globalData.languagePack.reminder,
        content: app.globalData.languagePack.lang == 1 ? 'Please upload a cover image of the news!' : '请上传一张资讯封面图！',
        showCancel: false, // 隐藏取消按钮
        confirmText: app.globalData.languagePack.sure, // 自定义确认按钮文案
        confirmColor: "#007AFF", // 自定义确认按钮颜色
      });
      return false;
    }
    if (formData.content == '') {

      wx.showModal({
        title: app.globalData.languagePack.reminder,
        content: app.globalData.languagePack.lang == 1 ? 'No empty information can be posted!' : '不能发布空资讯！',
        showCancel: false, // 隐藏取消按钮
        confirmText: app.globalData.languagePack.sure, // 自定义确认按钮文案
        confirmColor: "#007AFF", // 自定义确认按钮颜色
      });
      return false;
    }
    this.setData({
      disabled: true
    });
    const url = 'https://kpy.phanlink.com/v1/setArtAddDatas';
    const res = await this.fetchDatas(url, formData);
    if (res.code == 1) {
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
    } else if (res.code == -1) {
      wx.showModal({
        title: app.globalData.languagePack.reminder,
        content: res.msg,
        confirmText: app.globalData.languagePack.sure, // 默认"确定"
        cancelText: app.globalData.languagePack.back, // 默认"取消"
        success: (res) => {
          if (res.confirm) {

          } else if (res.cancel) {
            wx.navigateBack()
          }
        }
      })
    } else if (res.code == -2) {
      wx.showModal({
        title: app.globalData.languagePack.reminder,
        content: res.msg,
        confirmText: app.globalData.languagePack.sure, // 默认"确定"
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/my/pages/approve/index',
            });
          }
        }
      })
    } else {

      wx.showModal({
        title: app.globalData.languagePack.reminder,
        content: res.msg,
        showCancel: false, // 隐藏取消按钮
        confirmText: app.globalData.languagePack.sure, // 自定义确认按钮文案
        confirmColor: "#007AFF", // 自定义确认按钮颜色
      });
    }
    this.setData({
      disabled: false
    });
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
    //console.log(e);
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
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    wx.stopPullDownRefresh();
  },
  // 监听输入内容
  inputEditor(e) {
    this.setData({
      content: this.filterEmojis(e.detail.html)
    })
    //console.log(this.data.content);
  }
})