const app = getApp()
Component({
  externalClasses: ['wr-class'],

  properties: {
    goodsList: {
      type: Array,
      value: [],
    },
    visible: {
      type: Boolean,
      value: false,
    },
    thresholds: {
      type: Array,
      value: [],
    },
  },

  data: {
    globalLangData: app.globalData.languagePack,
    independentID: '',
    msg: '',
    dtId: '',
    keyboardheight: 0,
  },

  lifetimes: {
    ready() {
      this.init();
    },
  },

  methods: {
    handlekeyboardheight(e) {
      this.setData({
        keyboardheight: e.detail.height
      })
    },
    hitab(e) {

      const id = e.currentTarget.dataset.id;
      const goodsList = this.data.goodsList;
      const index = this.data.goodsList.findIndex(item => item.id === id);
      goodsList[index].active = goodsList[index].active ? 0 : 1;
      this.setData({
        goodsList: goodsList
      });
    },
    // 隐藏所有弹出框
    hideAllPopups() {
      let goodsList = this.data.goodsList.map(item => ({
        ...item,
        active: 0
      }));
      this.setData({
        goodsList
      });
    },
    noSee(e) {
      // console.log(e);
      const {
        storeid,
      } = e.currentTarget.dataset;
      this.triggerEvent('nosee', {
        storeid,
      });
    },
    HandleZan(e) {
      const {
        id,
        index
      } = e.currentTarget.dataset;
      this.triggerEvent('click', {
        id,
        index
      });
    },
    filterEmojis(input) {
      // 使用正则表达式匹配表情符号
      return input.replace(/[\uD83C-\uDBFF\uDC00-\uDFFF]+/g, '');
    },
    handleMsg(e) {
      this.setData({
        msg: this.filterEmojis(e.detail.value),
      });
    },
    handleShowMsg(e) {
      // console.log(e)
      const {
        id
      } = e.currentTarget.dataset;
      const {
        index
      } = e.currentTarget.dataset;
      this.setData({
        visible: !this.data.visible,
        msg: '',
        dtId: id,
        dtIndex: index
      });
    },
    handleSubmit(e) {
      const {
        dtId,
        dtIndex,
        msg
      } = this.data;
      if (msg == '') {
        wx.showToast({
          title: app.globalData.languagePack.lang == 1 ? 'The comment content cannot be empty!' : '评论内容不能为空！',
          icon: 'none',
          duration: 2000
        });
        return;
      }
      this.triggerEvent('pl', {
        dtId,
        dtIndex,
        msg
      });
    },
    init() {
      this.genIndependentID(this.id || '');
    },
    previewImage(e) {
      const current = e.currentTarget.dataset.src;
      const index = e.currentTarget.dataset.index;
      wx.previewImage({
        current: current,
        urls: this.data.goodsList[index].pic.map(row => row.url)
      });
    },
    genIndependentID(id) {
      if (id) {
        this.setData({
          independentID: id
        });
      } else {
        this.setData({
          independentID: `goods-list-${~~(Math.random() * 10 ** 8)}`,
        });
      }
    },
  },
});