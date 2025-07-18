const app = getApp()
Component({
  properties: {
    goodsList: {
      type: Array,
      value: [],
    },
  },

  data: {
    globalLangData: app.globalData.languagePack,
  },

  lifetimes: {
    ready() {},
  },

  methods: {

  },
});