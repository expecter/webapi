// index.js
const app = getApp();

Page({
  data: {
    reports: [],
    loading: true,
    error: false,
    errorMsg: '',
    currentYear: new Date().getFullYear()
  },
  
  onLoad: function() {
    this.fetchReports();
  },
  
  onPullDownRefresh: function() {
    this.fetchReports();
  },
  
  fetchReports: function() {
    // 显示加载状态
    this.setData({
      loading: true,
      error: false
    });
    
    // 调用全局方法获取报告数据
    wx.request({
      url: 'https://www.example.com/api/reports', // 这里需要替换为实际的API地址
      method: 'GET',
      success: (res) => {
        // 模拟数据处理
        // 实际项目中，这里应该解析服务器返回的数据
        const mockData = [
          { title: 'OpenAI发布GPT-5，性能大幅提升', date: '2023-06-15', url: 'https://example.com/news/1' },
          { title: '谷歌推出新一代AI模型Gemini Pro', date: '2023-06-15', url: 'https://example.com/news/2' },
          { title: '微软推出AI助手Copilot，提升办公效率', date: '2023-06-15', url: 'https://example.com/news/3' },
          { title: '百度文心一言开放公测，注册用户突破1000万', date: '2023-06-15', url: 'https://example.com/news/4' },
          { title: 'AI绘画工具Midjourney发布V6版本', date: '2023-06-15', url: 'https://example.com/news/5' },
          { title: '特斯拉发布全自动驾驶AI系统更新', date: '2023-06-15', url: 'https://example.com/news/6' },
          { title: 'AI医疗诊断系统获FDA批准，准确率超过人类医生', date: '2023-06-15', url: 'https://example.com/news/7' },
          { title: '人工智能在气候变化研究中取得重大突破', date: '2023-06-15', url: 'https://example.com/news/8' },
          { title: '全球AI芯片市场规模预计2025年将达1000亿美元', date: '2023-06-15', url: 'https://example.com/news/9' },
          { title: '中国发布AI产业发展规划，投入2000亿元', date: '2023-06-15', url: 'https://example.com/news/10' }
        ];
        
        this.setData({
          reports: mockData,
          loading: false
        });
        
        // 停止下拉刷新
        wx.stopPullDownRefresh();
      },
      fail: (err) => {
        console.error('获取报告失败:', err);
        this.setData({
          loading: false,
          error: true,
          errorMsg: '获取热点话题失败，请稍后再试'
        });
        
        // 停止下拉刷新
        wx.stopPullDownRefresh();
      }
    });
  },
  
  // 打开报告详情
  openReportDetail: function(e) {
    const url = e.currentTarget.dataset.url;
    const title = e.currentTarget.dataset.title;
    
    // 使用web-view组件打开网页
    wx.navigateTo({
      url: `/pages/webview/webview?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`
    });
  }
});