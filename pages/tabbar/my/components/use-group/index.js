const app = getApp()
Component({
  externalClasses: [],
  options: {
    multipleSlots: true,
  },
  properties: {

  },
  data: {
    globalLangData: app.globalData.languagePack,
  },
  methods: {
    userInfo: {
      type: Object,
      value: {},
    },
  },
});