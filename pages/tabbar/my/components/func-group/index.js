const app = getApp()
Component({
  externalClasses: [],
  options: {
    multipleSlots: true,
  },
  properties: {
    userInfo: {
      type: Object,
      value: {},
    },
  },
  data: {
    globalLangData: app.globalData.languagePack,
  },
  methods: {

  },
});