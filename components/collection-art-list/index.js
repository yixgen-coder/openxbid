Component({
  externalClasses: ['wr-class'],

  properties: {
    goodsList: {
      type: Array,
      value: [],
    },
  },

  data: {

  },

  lifetimes: {
    ready() {},
  },

  methods: {
    handleGoGoods(e) {
      const {
        id
      } = e.currentTarget.dataset;
      wx.navigateTo({
        url: `/pages/news/pages/art/index?artId=${id}`,
      });
    },
    onIconTap(e) {
      const {
        id
      } = e.currentTarget.dataset;
      this.triggerEvent('click', {
        id
      });
    },
  },
});