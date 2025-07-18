const app = getApp()
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
    messTime: {
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
    globalLangData: app.globalData.languagePack,
    independentID: '',
    gdDatas: [{
        title: app.globalData.languagePack.system_notification,
        img: 'https://imgs.phanlink.com/program/images/msg1.png',
        desc: app.globalData.languagePack.messages_from_system_notification,
        url: '/pages/news/pages/message/info/index',
        note: 0
      },
      {
        title: app.globalData.languagePack.bid_updates,
        img: 'https://imgs.phanlink.com/program/images/msg2.png',
        desc: app.globalData.languagePack.new_bid_offer_received,
        url: '/pages/news/pages/message/goods/index',
        note: 0
      },
      {
        title: app.globalData.languagePack.merchant_support,
        img: 'https://imgs.phanlink.com/program/images/msg3.png',
        desc: app.globalData.languagePack.new_merchant_inquiry,
        url: '/pages/news/pages/message/result/index',
        note: 0
      },
      {
        title: app.globalData.languagePack.new_follower,
        img: 'https://imgs.phanlink.com/program/images/msg4.png',
        desc: app.globalData.languagePack.new_follower_alert,
        url: '/pages/news/pages/message/gz/index',
        note: 0
      },
      {
        title: app.globalData.languagePack.comment_reply,
        img: 'https://imgs.phanlink.com/program/images/msg5.png',
        desc: app.globalData.languagePack.response_to_customer_review,
        url: '/pages/store/pages/pj/index?jd=1',
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