const app = getApp()
const { post } = require('../../../../utils/request')
const auth = require('../../../../services/auth')
// [改动] 硬编码 URL → config 常量
const { API_HOST } = require('../../../../utils/config')
Page({
  /**
   * 页面的初始数据
   */
  data: {
    globalLangData: app.globalData.languagePack,
    isShow: false,
    isShareShow: false,
    statusbar: '',
    jiaonangheight: '',
    current: 1,
    autoplay: true,
    duration: 500,
    interval: 5000,
    paginationPosition: 'bottom-right',
    goodsInfo: [],
    orderInfos: [],
    goodsId: '',
    storeId: '',
    sc: 0,
    goodslabs: 0,
    hideMydata: false,
    gg: [],
    total: {
      stock: 0,
      weight: 0,
      price: 0
    },
    currentPage: 0,
    fxId: 0,
    fxuId: 0,
    qrCodeUrl: '',
    posterUrl: '', // 生成的海报图片URL
    showModal: false, // 是否显示模态层
  },
  // 生成海报
  generatePoster: function () {
    const that = this;
    const goodsInfo = this.data.goodsInfo;
    // 显示加载提示
    wx.showLoading({
      title: '生成海报中...',
    });

    // 创建canvas上下文
    const ctx = wx.createCanvasContext('posterCanvas');

    // 设置海报尺寸
    const width = 300;
    const height = 500;

    // 先绘制商品图片
    wx.getImageInfo({
      src: API_HOST + '/' + goodsInfo.pic, // [改动] 硬编码 URL → config 常量
      success: (productRes) => {
        // 绘制商品图片（铺满顶部）
        ctx.drawImage(productRes.path, 0, 0, width, 200);

        // 在图片上添加半透明覆盖层
        ctx.setFillStyle('rgba(76, 175, 80, 0.3)');
        ctx.fillRect(0, 0, width, 200);

        // 在图片上添加商品名称
        ctx.setFillStyle('white');
        ctx.setFontSize(18);
        ctx.setTextAlign('center');
        const sstit = goodsInfo.title + '/' + goodsInfo.nature + '/' + goodsInfo.place + '/' + (goodsInfo.btype == 1 ? '出售' : '求购');
        ctx.fillText(sstit, width / 2, 80);

        // 加载小程序码图片
        wx.getImageInfo({
          src: that.data.qrCodeUrl,
          success: (qrRes) => {

            let tableY = 220;


            // 绘制价格区域
            ctx.setFillStyle('#f5f5f5');
            ctx.fillRect(20, tableY + 10, width - 40, 60);

            ctx.setFillStyle('#e53935');
            ctx.setFontSize(24);
            ctx.setTextAlign('center');
            ctx.fillText('$' + goodsInfo.current_price, width / 2, tableY + 40);

            ctx.setFillStyle('#757575');
            ctx.setFontSize(14);
            ctx.fillText('当前价格', width / 2, tableY + 60);

            // 绘制统计数据
            const stats = [{
                value: goodsInfo.hits + ' 人',
                label: '围观'
              },
              {
                value: goodsInfo.apply + ' 次',
                label: '参与'
              }
            ];

            let statsX = width / 3;
            stats.forEach(stat => {
              ctx.setFillStyle('#333');
              ctx.setFontSize(14);
              ctx.setTextAlign('center');
              ctx.fillText(stat.value, statsX, tableY + 120);

              ctx.setFillStyle('#757575');
              ctx.setFontSize(14);
              ctx.fillText(stat.label, statsX, tableY + 140);

              statsX += width / 3;
            });

            // 绘制底部区域
            ctx.setStrokeStyle('#e0e0e0');
            ctx.setLineDash([5, 3]);
            ctx.beginPath();
            ctx.moveTo(20, tableY + 160);
            ctx.lineTo(width - 20, tableY + 160);
            ctx.stroke();
            ctx.setLineDash([]);

            // 绘制小程序码图片
            ctx.drawImage(qrRes.path, 20, tableY + 170, 70, 70);

            // 绘制小程序信息
            ctx.setFillStyle('#333');
            ctx.setFontSize(14);
            ctx.setTextAlign('left');
            ctx.fillText('海鲜交易平台', 100, tableY + 190);

            ctx.setFillStyle('#757575');
            ctx.setFontSize(12);
            ctx.fillText('长按图片识别小程序码', 100, tableY + 210);

            // 绘制到Canvas
            ctx.draw(false, function () {
              // 将Canvas内容转换为临时图片文件
              wx.canvasToTempFilePath({
                canvasId: 'posterCanvas',
                success: function (res) {
                  // 隐藏加载提示
                  wx.hideLoading();

                  // 设置海报URL
                  that.setData({
                    posterUrl: res.tempFilePath,
                    isShareShow: false,
                    showModal: true
                  });

                  // 显示成功提示
                  wx.showToast({
                    title: '海报生成成功',
                    icon: 'success',
                    duration: 2000
                  });
                },
                fail: function (err) {
                  // 隐藏加载提示
                  wx.hideLoading();

                  // 显示错误提示
                  wx.showToast({
                    title: '生成失败',
                    icon: 'none',
                    duration: 2000
                  });

                  // console.error('海报生成失败:', err);
                }
              });
            });
          },
          fail: (qrErr) => {
            wx.hideLoading();
            wx.showToast({
              title: '小程序码加载失败',
              icon: 'none',
              duration: 2000
            });
            // console.error('小程序码加载失败:', qrErr);
          }
        });
      },
      fail: (productErr) => {
        wx.hideLoading();
        wx.showToast({
          title: '商品图片加载失败',
          icon: 'none',
          duration: 2000
        });
        // console.error('商品图片加载失败:', productErr);
      }
    });
  },
  // 隐藏模态层
  hideModal: function () {
    this.setData({
      showModal: false
    });
  },
  // 保存海报到相册
  savePoster: function () {
    const that = this;

    if (!this.data.posterUrl) {
      wx.showToast({
        title: '请先生成海报',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    // 请求相册授权
    wx.getSetting({
      success: (res) => {
        if (!res.authSetting['scope.writePhotosAlbum']) {
          // 未授权，请求授权
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success: () => {
              // 授权成功，保存图片
              that.saveImageToAlbum();
            },
            fail: () => {
              // 授权失败，提示用户手动开启
              wx.showModal({
                title: '提示',
                content: '需要您授权保存图片到相册',
                confirmText: '去设置',
                success: (res) => {
                  if (res.confirm) {
                    wx.openSetting({
                      success: (settingRes) => {
                        if (settingRes.authSetting['scope.writePhotosAlbum']) {
                          that.saveImageToAlbum();
                        }
                      }
                    });
                  }
                }
              });
            }
          });
        } else {
          // 已授权，直接保存
          that.saveImageToAlbum();
        }
      }
    });
  },

  // 保存图片到相册
  saveImageToAlbum: function () {
    wx.saveImageToPhotosAlbum({
      filePath: this.data.posterUrl,
      success: () => {
        wx.showToast({
          title: '保存成功',
          icon: 'success',
          duration: 2000
        });
      },
      fail: (err) => {
        // console.error('保存失败:', err);
        wx.showToast({
          title: '保存失败',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },
  previewImage(e) {
    const index = e.detail.index;
    const current = this.data.goodsInfo.pics[index];
    wx.previewImage({
      current: current,
      urls: this.data.goodsInfo.pics
    });
  },
  // 判断是否有上一页
  canGoBack: function () {
    const pages = getCurrentPages();
    const currentPageIndex = pages.length - 1;

    if (currentPageIndex > 0) {
      return true;
    } else {
      return false;
    }
  },
  goback: function () {
    if (this.canGoBack()) {
      wx.navigateBack({
        delta: 1
      });
    } else {
      wx.switchTab({
        url: '/pages/tabbar/home/home',
      });
    }
  },
  async storeClickHandle() {
    // [改动] auth.requireLogin() 替代原 checkToken()
    if (!auth.requireLogin()) {
      return false;
    }
    const {
      storeId
    } = this.data;
    // [改动] post('/setStoreGz', ...) 替代原 fetchSetGoods + 硬编码 URL
    const res = await post('/setStoreGz', { storeId: storeId });
    let goodsInfo = this.data.goodsInfo;
    if (res.code == 1) {
      goodsInfo.gz = res.action
      this.setData({
        goodsInfo: goodsInfo
      });
    }
  },
  onVisibleChange() {
    const goodsInfo = this.data.goodsInfo;
    this.setData({
      isShow: false,
      gg: [],
      goodsInfo: goodsInfo
    })

  },
  // [改动] 原 checkToken() 方法已删除 —— 由 auth.requireLogin() 替代
  // 原 136 处 wx.getStorageSync('token') + 弹窗引导登录 的重复逻辑收敛到 services/auth.js
  handleShow() {
    if (auth.requireLogin()) {
      this.setData({
        isShow: true
      })
    }
  },
  onShareVisibleChange() {
    this.setData({
      isShareShow: false
    })
  },
  handleShareShow() {
    this.setData({
      isShareShow: true
    })
  },
  handleGoReview() {
    const goodsId = this.data.goodsId;
    wx.navigateTo({
      url: '/pages/goods/pages/review/index?goodsId=' + goodsId
    });
  },
  handleGoOffer() {
    const goodsId = this.data.goodsId;
    wx.navigateTo({
      url: '/pages/goods/pages/offer/index?goodsId=' + goodsId
    });
  },
  async init() {

    const res1 = wx.getMenuButtonBoundingClientRect()
    this.setData({
      statusbar: res1.top, // 胶囊顶部高度
      jiaonangheight: res1.height // 胶囊高度
    })
    const res = await this.fetchGoodsInfo(this.data.goodsId, this.data.fxId);
    if (res.code == 1) {
      let total = this.data.total;
      total.stock = res.data.goods.stock;
      total.weight = res.data.goods.weight;
      total.price = res.data.goods.price;
      this.setData({
        goodsInfo: res.data.goods,
        storeId: res.data.goods.storeid,
        orderInfos: res.data.orderInfos,
        sc: res.data.goods.sc,
        total: total,
        fxuId: res.data.goods.fxId,
        hideMydata: res.data.goods.hideMydata,
      })
    }
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    wx.stopPullDownRefresh();
  },
  submitBJ: async function () {
    // [改动] auth.requireLogin() 替代原 checkToken()
    if (!auth.requireLogin()) {
      return false;
    }
    const formData = {};
    formData.goodsId = this.data.goodsId;
    formData.gg = this.data.gg;
    formData.lang = this.data.globalLangData.lang;
    // [改动] post('/setGoodsQuot', ...) 替代原 fetchSetGoods + 硬编码 URL + 手动塞 token
    if (formData.gg.length == 0) {
      wx.showToast({
        title: app.globalData.languagePack.lang == 1 ? 'Please make a bid first' : '请先出价',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    const res = await post('/setGoodsQuot', formData, { showError: false });
    if (res.code == 1) {
      this.onVisibleChange();
      wx.showToast({
        title: res.msg,
        icon: 'success',
        duration: 2000
      })

      this.init();
    } else if (res.code == -1) {
      wx.showModal({
        title: app.globalData.languagePack.reminder,
        content: res.msg,
        showCancel: true,
        cancelText: app.globalData.languagePack.exit,
        confirmText: app.globalData.languagePack.immediate_certification,
        success: function (res) {
          if (res.confirm) {
            wx.redirectTo({
              url: '/pages/my/pages/approve/index'
            });
          } else if (res.cancel) {
            wx.navigateBack({
              delta: 1
            });
          }
        }
      });
    } else {

      wx.showModal({
        title: app.globalData.languagePack.reminder,
        content: res.msg,
        showCancel: false, // 隐藏取消按钮
        confirmText: app.globalData.languagePack.sure, // 自定义确认按钮文案
        confirmColor: "#007AFF", // 自定义确认按钮颜色
      });
    }
  },
  ggainput(e) {
    let goodsspec = this.data.goodsInfo.spec;
    let total = this.data.total;
    total.price = 0;
    const gg = e.detail[0].gg;
    for (let i = 0; i < gg.length; i++) {

      total.price += parseFloat(goodsspec[i].a4 * gg[i]);
    }

    this.setData({
      gg: gg,
      total: total,
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    if (options.cpage == 1) {
      this.setData({
        currentPage: 1
      });
    }
    if (options.fxId > 0) {
      this.setData({
        fxId: options.fxId
      });
    }
    this.setData({
      fxId: options.fxId,
      goodsId: options.spuId,
      qrCodeUrl: API_HOST + '/generate_qrcode.php?spuId=' + options.spuId // [改动] 硬编码 URL → config 常量
    });

    //this.init();
  },
  onShow() {
    this.init();
  },
  onTabsClick(e) {
    const index = e.detail.value;
    this.setData({
      goodslabs: index
    })
  },
  fetchGoodsInfo(spuId, fxId) {
    // [改动] 使用统一请求层 post()，替代原 new Promise + wx.request + 硬编码 URL + 手动塞 token
    var lang = this.data.globalLangData.lang;
    return post('/getGoodsDatas', {
      spuId: spuId,
      fxId: fxId,
      lang: lang,
    }, { showError: false });
  },
  handleFinish: async function () {
    const goodsId = this.data.goodsId;
    const res = await this.fetchGoodsInfo(goodsId);
    if (res.code == 1) {
      this.setData({
        goodsInfo: res.data.goods,
      })
    }
  },
  handlesc: async function (e) {
    // [改动] auth.requireLogin() 替代原 checkToken()
    if (!auth.requireLogin()) {
      return false;
    }
    // [改动] post('/setGoodssc', ...) 替代原 fetchSetGoods + 硬编码 URL + 手动塞 token
    const res = await post('/setGoodssc', { goodsId: e.currentTarget.id });
    if (res.code == 1) {
      this.setData({
        sc: res.action,
      })
    }
  },
  // [改动] 删除原 fetchSetGoods 方法 —— 已被 utils/request.js 的 post() 替代
  // 以下方法中的 this.fetchSetGoods(url, data) 已替换为 post(endpoint, data)
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      this.setData({
        isShareShow: false
      })
    }
    let title = this.data.goodsInfo.btype == 1 ? app.globalData.languagePack.sell : app.globalData.languagePack.buy;
    title += this.data.goodsInfo.place + ' ';
    title += this.data.goodsInfo.nature + ' ';
    title += this.data.goodsInfo.title + ' ';
    return {
      title: title,
      imageUrl: 'https://imgs.phanlink.com/' + this.data.goodsInfo.pic,
      path: '/pages/goods/pages/index/index?cpage=1&spuId=' + this.data.goodsInfo.id + '&fxId=' + this.data.fxuId,
    }
  },
  onShareTimeline: function (res) {
    let title = this.data.goodsInfo.btype == 1 ? app.globalData.languagePack.sell : app.globalData.languagePack.buy;
    title += this.data.goodsInfo.place + ' ';
    title += this.data.goodsInfo.nature + ' ';
    title += this.data.goodsInfo.title + ' ';
    return {
      title: title, //字符串  自定义标题
      query: 'spuId=' + this.data.goodsInfo.id + '&fxId=' + this.data.fxuId, //页面携带参数
      imageUrl: 'https://imgs.phanlink.com/' + this.data.goodsInfo.pic //图片地址
    }
  },
})