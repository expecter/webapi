// app.js
App({
  globalData: {
    userInfo: null,
    allReports: [],
    generalsData: [],
    tacticsData: [],
    apiBaseUrl: 'https://www.aibase.com'
  },
  onLaunch: function() {
    // 小程序启动时执行的逻辑
    console.log('小程序启动');
  },
  onShow: function(options) {
    // 小程序显示时执行的逻辑
    console.log('小程序显示');
  },
  onHide: function() {
    // 小程序隐藏时执行的逻辑
    console.log('小程序隐藏');
  },
  onError: function(msg) {
    // 小程序发生错误时执行的逻辑
    console.error('小程序错误:', msg);
  },
  // 封装请求方法
  request: function(options) {
    const baseUrl = this.globalData.apiBaseUrl;
    return new Promise((resolve, reject) => {
      wx.request({
        url: options.url.startsWith('http') ? options.url : baseUrl + options.url,
        method: options.method || 'GET',
        data: options.data || {},
        header: options.header || {
          'Content-Type': 'application/json'
        },
        success: function(res) {
          resolve(res.data);
        },
        fail: function(err) {
          reject(err);
        }
      });
    });
  },
  // 封装获取AI日报数据的方法
  fetchReports: function() {
    // 微信小程序不支持直接爬取网页，需要通过服务器代理
    // 这里假设我们有一个服务器API提供数据
    return this.request({
      url: '/proxy?url=' + encodeURIComponent('https://www.aibase.com/zh/daily'),
      method: 'GET'
    });
  }
});