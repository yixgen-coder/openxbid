const app = getApp()
export default [{
    icon: 'https://imgs.phanlink.com/program/images/bar1.png',
    aicon: 'https://imgs.phanlink.com/program/images/abar1.png',
    text: app.globalData.languagePack.home,
    url: 'pages/tabbar/home/home',
  },
  {
    icon: 'https://imgs.phanlink.com/program/images/bar2.png',
    aicon: 'https://imgs.phanlink.com/program/images/abar2.png',
    text: app.globalData.languagePack.service,
    url: 'pages/tabbar/serve/index',
  },
  {
    icon: 'https://imgs.phanlink.com/program/images/tabadd.png',
    aicon: 'https://imgs.phanlink.com/program/images/tabadd.png',
    text: '',
    url: 'pages/tabbar/publish/index',
  },
  {
    icon: 'https://imgs.phanlink.com/program/images/bar3.png',
    aicon: 'https://imgs.phanlink.com/program/images/abar3.png',
    text: app.globalData.languagePack.info,
    url: 'pages/tabbar/message/index',
  },
  {
    icon: 'https://imgs.phanlink.com/program/images/bar4.png',
    aicon: 'https://imgs.phanlink.com/program/images/abar4.png',
    text: app.globalData.languagePack.me,
    url: 'pages/tabbar/my/index',
  },
];