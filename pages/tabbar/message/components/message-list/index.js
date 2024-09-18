Component({
  externalClasses: ['wr-class'],

  properties: {
    goodsList: {
      type: Array,
      value: [],
    },
    messCount: {
      type: Object,
      value: {},
    },
    id: {
      type: String,
      value: '',
      observer: (id) => {
        this.genIndependentID(id);
      },
    },
    thresholds: {
      type: Array,
      value: [],
    },
  },

  data: {
    independentID: '',
    gdDatas: [{
        title: '平台消息',
        img: 'https://imgs.phanlink.com/program/images/msg1.png',
        desc: '系统消息通知',
        url:'/pages/news/pages/message/info/index',
        note: 0
      },
      {
        title: '商品消息',
        img: 'https://imgs.phanlink.com/program/images/msg2.png',
        desc: '竞价商品消息通知',
        url:'/pages/news/pages/message/goods/index',
        note: 0
      },
      {
        title: '商家咨询',
        img: 'https://imgs.phanlink.com/program/images/msg3.png',
        desc: '客户咨询消息通知',
        url:'/pages/news/pages/message/result/index',
        note: 0
      },
      {
        title: '关注提醒',
        img: 'https://imgs.phanlink.com/program/images/msg1.png',
        desc: '客户关注消息通知',
        url:'/pages/news/pages/message/gz/index',
        note: 0
      },
    ],
  },

  lifetimes: {
    ready() {
      this.init();
    },
  },

  methods: {
    onClickGoods(e) {
      const {
        index
      } = e.currentTarget.dataset;
      this.triggerEvent('click', {
        ...e.detail,
        index
      });
    },

    onAddCart(e) {
      const {
        index
      } = e.currentTarget.dataset;
      this.triggerEvent('addcart', {
        ...e.detail,
        index
      });
    },

    onClickGoodsThumb(e) {
      const {
        index
      } = e.currentTarget.dataset;
      this.triggerEvent('thumb', {
        ...e.detail,
        index
      });
    },

    init() {
      this.genIndependentID(this.id || '');
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