const app = getApp()
Component({
  externalClasses: ['custom-class'],

  properties: {
    category: {
      type: Array,
    },
    stype: {
      type: Number,
      value: 0
    },
    initActive: {
      type: Array,
      value: [],
      observer(newVal, oldVal) {
        if (newVal[0] !== oldVal[0]) {
          this.setActiveKey(newVal[0], 0);
        }
      },
    },
    isSlotRight: {
      type: Boolean,
      value: false,
    },
    level: {
      type: Number,
      value: 3,
    },
  },
  data: {
    activeKey: 0,
    subActiveKey: 0,
    gg: [],
    globalLangData: app.globalData.languagePack,
  },
  attached() {
    if (this.properties.initActive && this.properties.initActive.length > 0) {
      this.setData({
        activeKey: this.properties.initActive[0],
        subActiveKey: this.properties.initActive[1] || 0,
      });
    }
  },
  methods: {
    handleGrInfos(e) {
      const index = e.currentTarget.dataset.key;
      const value = this.filterEmojis(e.detail.value);
      let category = this.data.category;
      let gg = this.data.gg;

      if (this.data.stype == 1) {
        category[index].a6 = value
      } else {
        category[index].a5 = value
      }
      for (let i = 0; i < category.length; i++) {
        if (i == index) {
          gg[i] = value
        } else {
          gg[i] = this.data.stype == 1 ? category[i].a6 : category[i].a5;
        }


      }
      this.setData({
        //['gg[' + index + ']']: value,
        gg: gg,
        category: category
      });
      this.triggerEvent('gginput', [{
        gg: this.data.gg
      }]);
    },
    filterEmojis(input) {
      // 使用正则表达式匹配表情符号
      return input.replace(/[\uD83C-\uDBFF\uDC00-\uDFFF]+/g, '');
    },
    onParentChange(event) {

      this.setActiveKey(event.detail.index, 0).then(() => {
        this.triggerEvent('change', [
          this.data.activeKey,
          this.data.subActiveKey,
        ]);
      });
    },
    onChildChange(event) {
      this.setActiveKey(this.data.activeKey, event.detail.index).then(() => {
        this.triggerEvent('change', [
          this.data.activeKey,
          this.data.subActiveKey,
        ]);
      });
    },
    changCategory(event) {
      const {
        item
      } = event.currentTarget.dataset;
      this.triggerEvent('changeCategory', {
        item,
      });
    },
    setActiveKey(key, subKey) {
      return new Promise((resolve) => {
        this.setData({
            activeKey: key,
            subActiveKey: subKey,
          },
          () => {
            resolve();
          },
        );
      });
    },
  },

});