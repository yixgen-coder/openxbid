Page({
  data: {
    itemTitle: '评价管理',
    statusbar: '',
    jiaonangheight: '',
    loadStatus: 0,
    pageLoading: false,
    tabList: [{
      text: "待回复",
      key: 1
    }, {
      text: "全部评价",
      key: 2
    }],
    goodsList: [],
    scount: 0,
    tabIndex: 1,
    num: 0,
    pjvisible: false,
    pjReply: '',
    pjId: 0,
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
      pjReply: e.detail.value,
    })
  },
  handleSubmit: async function (e) {
    console.log(e);
    const formData = {};
    formData.pjId = this.data.pjId;
    formData.pjReply = this.data.pjReply;
    formData.token = wx.getStorageSync('token');
    if (formData.pjReply == '') {
      wx.showToast({
        title: '请输入回复内容！',
        icon: 'none',
        duration: 2000
      });
      return false;
    }
    const url = 'https://kpy.phanlink.com/v1/setOrderPJReply';
    const res = await this.fetchDatas(url, formData);
    if (res.code == 1) {
      wx.showToast({
        title: '回复成功',
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

    } else {
      wx.showToast({
        title: res.msg,
        icon: 'none',
        duration: 2000
      });
    }
  },
  onLoad(options) {
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
      title: '提示',
      content: '确定要删除吗？',
      showCancel: true,
      cancelText: '取消',
      confirmText: '确定',
      success: res => {
        if (res.confirm) {
          this.deleteData(id);
        }
      }
    });
  },
  deleteData: async function (id) {
    const url = 'https://kpy.phanlink.com/v1/setOrderPJDel';
    const formData = {};
    formData.token = wx.getStorageSync('token');
    formData.pjId = id;

    const res = await this.fetchDatas(url, formData);
    if (res.code == 1) {
      let scount = this.data.scount;
      if (scount > 0) {
        scount--;
      }
      this.setData({
        goodsList: this.data.goodsList.filter(item => item.id !== id),
        scount: scount,
      });
      wx.showToast({
        title: '删除成功',
        icon: 'success',
        duration: 2000
      });
    } else {
      wx.showToast({
        title: '删除失败',
        icon: 'loading',
        duration: 2000
      });
    }
  },

  init() {
    let token = wx.getStorageSync('token');
    if (!token) {
      // 用户未登录，跳转到登录页面
      wx.navigateTo({
        url: '/pages/tabbar/login/login',
      });
    }
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
    const url = 'https://kpy.phanlink.com/v1/getOrderPJDatas';
    const formData = {};
    formData.token = wx.getStorageSync('token');
    formData.limit = this.goodListPagination.num;
    formData.page = fresh ? 1 : this.goodListPagination.index;

    formData.action = this.data.tabIndex;
    try {
      const res = await this.fetchDatas(url, formData);
      if (res.code == 1) {
        const nextList = res.result.data;
        this.setData({
          goodsList: fresh ? nextList : this.data.goodsList.concat(nextList),
          scount: res.result.count
        });
        if (nextList.length > 0) {
          this.goodListPagination.index = formData.page + 1;
        }
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
  fetchDatas(url, data) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: url,
        method: 'POST',
        data: data,
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          resolve(res.data);
        },
        fail: function (err) {
          reject(err);
        }
      });
    });
  },
  onPullDownRefresh() {
    this.fetchHomeDatas(true);
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