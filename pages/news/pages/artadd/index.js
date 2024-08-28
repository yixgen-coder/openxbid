Page({
  data: {
    formats: {},
    content: "<p>公众号关注：wePanda</p>"
  },
  onLoad: function () {},

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
  insertImage() {
    wx.chooseImage({
      count: 1,
      success: (res) => {
        this.editorCtx.insertImage({
          src: res.tempFilePaths[0],
          width: '80%'
        })
      }
    })
  },

  // 内容格式
  changeEditor(e) {
    this.setData({
      formats: e.detail
    })
    console.log(this.data.formats)
  },

  // 监听输入内容
  inputEditor(e) {
    this.setData({
      content: e.detail.html
    })
    console.log(e.detail.html)
  }
})