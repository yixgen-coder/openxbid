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
    keyboardheight: 0
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
    handleMsg(e) {
      this.setData({
        msg: e.detail.value,
      });
    },
    handleShowMsg(e) {
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
          title: '评论内容不能为空！',
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