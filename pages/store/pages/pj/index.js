const app = getApp()
// [改动] 引入统一请求层和认证服务
const { post } = require('../../../../utils/request')
const { requireLogin } = require('../../../../services/auth')
Page({
  data: {
    globalLangData: app.globalData.languagePack,
    itemTitle: app.globalData.languagePack.comment_dashboard,
    statusbar: '',
    jiaonangheight: '',
    loadStatus: 0,
    pageLoading: false,
    tabList: [{
      text: app.globalData.languagePack.not_reply,
      key: 1
    }, {
      text: app.globalData.languagePack.all_comment,
      key: 2
    }],
    goodsList: [],
    scount: 0,
    tabIndex: 1,
    num: 0,
    pjvisible: false,
    pjReply: '',
    pjId: 0,
    jd: 0,
    keyboardheight: 0
  },
  goodListPagination: {
    index: 1,
    num: 20,
  },
  handlekeyboardheight(e) {
    this.setData({
      keyboardheight: e.detail.height
    })
  },
  tabChangeHandle(e) {
    this.setData({
      tabIndex: e.detail.value
    })
    this.fetchHomeDatas(true);
  },
  handleShowPj(e) {
    const {
      index,
      id
    } = e.currentTarget.dataset;
    this.setData({
      pjvisible: !this.data.pjvisible,
      pjId: id ? id : 0,
      pjReply: index || index >= 0 ? this.data.goodsList[index].reply : ''
    })
  },
  handleReply(e) {
    this.setData({
      pjReply: this.filterEmojis(e.detail.value),
    })
  },
  filterEmojis(input) {
    // 使用正则表达式匹配表情符号
    return input.replace(/[\uD83C-\uDBFF\uDC00-\uDFFF]+/g, '');
  },
  handleSubmit: async function (e) {
    // console.log(e);
    // [改动] fetchDatas → post()
    if (this.data.pjReply == '') {
      wx.showToast({
        title: app.globalData.languagePack.lang == 1 ? 'Please enter the reply content!' : '请输入回复内容！',
        icon: 'none',
        duration: 2000
      });
      return false;
    }
    try {
      const res = await post('/setOrderPJReply', {
        pjId: this.data.pjId,
        pjReply: this.data.pjReply
      }, { showError: false });
      wx.showToast({
        title: app.globalData.languagePack.lang == 1 ? 'Reply successful' : '回复成功',
        icon: 'success',
        duration: 2000,
        mask: true,
        complete: () => {
          setTimeout(() => {
            this.setData({
              pjvisible: !this.data.pjvisible,
              pjId: 0,
              pjReply: ''
            })
            this.init();
          }, 2000);
        }
      });
    } catch (res) {
      wx.showToast({
        title: res.msg,
        icon: 'none',
        duration: 2000
      });
    }
  },
  onLoad(options) {
    if (options.jd == 1) {
      this.setData({
        jd: 1,
        itemTitle: app.globalData.languagePack.comment_reply,
      });
    }
    this.init();
  },
  goback: function () {
    wx.navigateBack({
      delta: 1
    });
  },
  pjClickHandle(e) {
    const {
      id
    } = e.currentTarget.dataset;
    // 显示确认提示框
    wx.showModal({
      title: app.globalData.languagePack.reminder,
      content: app.globalData.languagePack.sure_delete,
      showCancel: true,
      cancelText: app.globalData.languagePack.cancel,
      confirmText: app.globalData.languagePack.sure,
      success: res => {
        if (res.confirm) {
          this.deleteData(id);
        }
      }
    });
  },
  deleteData: async function (id) {
    // [改动] fetchDatas → post()
    try {
      const res = await post('/setOrderPJDel', { pjId: id }, { showError: false });
      let scount = this.data.scount;
      if (scount > 0) {
        scount--;
      }
      this.setData({
        goodsList: this.data.goodsList.filter(item => item.id !== id),
        scount: scount,
      });
      wx.showToast({
        title: app.globalData.languagePack.lang == 1 ? 'Deleted successfully' : '删除成功',
        icon: 'success',
        duration: 2000
      });
    } catch (res) {
      wx.showToast({
        title: app.globalData.languagePack.lang == 1 ? 'Deletion failed' : '删除失败',
        icon: 'loading',
        duration: 2000
      });
    }
  },

  init() {
    // [改动] 替换登录检查为 requireLogin()
    if (!requireLogin()) return;
    const res = wx.getMenuButtonBoundingClientRect();
    this.setData({
      statusbar: res.top, // 胶囊顶部高度
      jiaonangheight: res.height // 胶囊高度
    })
    this.loadHomePage();
  },
  fetchHomeDatas: async function (fresh = false) {
    if (fresh) {
      wx.pageScrollTo({
        scrollTop: 0,
      });
    }

    this.setData({
      loadStatus: 1
    });
    // [改动] fetchDatas → post()
    try {
      const res = await post('/getOrderPJDatas', {
        limit: this.goodListPagination.num,
        page: fresh ? 1 : this.goodListPagination.index,
        action: this.data.tabIndex,
        lang: app.globalData.languagePack.lang
      }, { showError: false });
      const nextList = res.result.data;
      this.setData({
        goodsList: fresh ? nextList : this.data.goodsList.concat(nextList),
        scount: res.result.count
      });
      if (nextList.length > 0) {
        this.goodListPagination.index = (fresh ? 1 : this.goodListPagination.index) + 1;
      }
      this.setData({
        loadStatus: 0
      });
      wx.showToast({
        title: res.msg,
        icon: 'loading',
        duration: 500
      });
    } catch (res) {
      this.setData({
        loadStatus: 3
      });
    }
  },
  onPullDownRefresh() {
    this.fetchHomeDatas(true);
    wx.stopPullDownRefresh();
  },
  onReTry() {
    this.fetchHomeDatas();
  },
  loadHomePage() {
    wx.stopPullDownRefresh();
    this.fetchHomeDatas(true);
  },
  onReachBottom() {
    if (this.data.loadStatus === 0) {
      this.fetchHomeDatas();
    }
  },
})