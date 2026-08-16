const app = getApp()
// [改动] 引入统一请求层 post()
const { post } = require('../../../utils/request')
const { requireLogin } = require('../../../services/auth')
Page({
  data: {
    globalLangData: app.globalData.languagePack,
    itemTitle: app.globalData.languagePack.lang == 1 ? 'Certification audit' : '认证审核',
    statusbar: '',
    jiaonangheight: '',
    loadStatus: 0,
    pageLoading: false,
    tabList: [{
      text: app.globalData.languagePack.lang == 1 ? 'Membership application' : '会员申请',
      key: 1,
      count: 0
    }, {
      text: app.globalData.languagePack.lang == 1 ? 'Qualification application' : '资质申请',
      key: 2,
      count: 0
    }],
    goodsList: [],
    scount: 0,
    tabIndex: 1,
    num: 0,
    keyboardheight: 0,
    showRejectModal: false,
    rejectReason: '',
    currentItemId: null,
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

  onLoad(options) {
    this.init();
  },
  goback: function () {
    wx.navigateBack({
      delta: 1
    });
  },

  init() {
    // [改动] wx.getStorageSync('token') + showModal → requireLogin()
    if (!requireLogin()) return;
    const res = wx.getMenuButtonBoundingClientRect();
    this.setData({
      statusbar: res.top, // 胶囊顶部高度
      jiaonangheight: res.height // 胶囊高度
    })
    this.loadHomePage();
  },
  // 查看详情
  handleDetail(e) {

    const id = e.currentTarget.dataset.id;
    const type = this.data.tabIndex;
    wx.navigateTo({
      url: `/pages/my/pages/review/info/index?id=${id}&type=${type}`
    });
  },

  // 拒绝审核
  handleReject(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({
      showRejectModal: true,
      currentItemId: id,
      rejectReason: ''
    });
  },

  // 通过审核
  async handlePass(e) {
    const id = e.currentTarget.dataset.id;

    wx.showModal({
      title: '确认通过',
      content: '确认要通过该申请吗？',
      success: async (res) => {
        if (res.confirm) {
          this.submitAudit(id, 1); // 1表示通过
        }
      }
    });
  },

  // 输入拒绝原因
  onReasonInput(e) {
    this.setData({
      rejectReason: e.detail.value
    });
  },

  // 取消拒绝
  cancelReject() {
    this.setData({
      showRejectModal: false,
      currentItemId: null,
      rejectReason: ''
    });
  },

  // 确认拒绝
  async confirmReject() {
    if (!this.data.rejectReason.trim()) {
      wx.showToast({
        title: '请填写拒绝原因',
        icon: 'none'
      });
      return;
    }

    if (this.data.rejectReason.trim().length < 5) {
      wx.showToast({
        title: '原因至少5个字',
        icon: 'none'
      });
      return;
    }

    this.submitAudit(this.data.currentItemId, 2, this.data.rejectReason); // 2表示拒绝
  },

  // 提交审核结果
  async submitAudit(id, status, reason = '') {
    wx.showLoading({
      title: '提交中...',
      mask: true
    });

    // [改动] 使用 post() 替代 fetchDatas，删除 token 字段，URL 去掉前缀
    const params = {
      id,
      status,
      reason,
      type: this.data.tabIndex,
      lang: app.globalData.languagePack.lang,
    };

    try {
      const res = await post('/setReviewOperat', params, { showError: false });
      wx.showToast({
        title: '操作成功',
        icon: 'success'
      });
      // 关闭弹窗
      this.setData({
        showRejectModal: false,
        currentItemId: null,
        rejectReason: ''
      });
      // 刷新列表
      setTimeout(() => {
        this.fetchHomeDatas(true);
      }, 500);
    } catch (error) {
      wx.hideLoading();
      wx.showToast({
        title: '网络错误',
        icon: 'error'
      });
    }
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
    // [改动] 使用 post() 替代 fetchDatas，URL 去掉前缀
    const formData = {};
    // [改动] 删除 formData.token = wx.getStorageSync('token')，post() 自动注入
    formData.limit = this.goodListPagination.num;
    formData.page = fresh ? 1 : this.goodListPagination.index;
    formData.action = this.data.tabIndex;
    formData.lang = app.globalData.languagePack.lang;
    try {
      const res = await post('/getReviewInfo', formData, { showError: false });
      const nextList = res.result;
      const scount = res.scount;
      let newArr = this.data.tabList.map((item, idx) => {

        if (idx === 0) {
          return {
            ...item,
            count: scount.c1
          };
        }
        if (idx === 1) {
          return {
            ...item,
            count: scount.c2
          };
        }
        return item;
      });
      this.setData({
        goodsList: fresh ? nextList : this.data.goodsList.concat(nextList),
        tabList: newArr
      });
      if (nextList.length > 0) {
        this.goodListPagination.index = formData.page + 1;
      }
      this.setData({
        loadStatus: 0
      });
      wx.showToast({
        title: res.msg,
        icon: 'loading',
        duration: 500
      });
    } catch (error) {
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