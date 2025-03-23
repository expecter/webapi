// api.js
Page({
  data: {
    // HTTP请求相关数据
    httpMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
    httpMethodIndex: 0,
    httpUrl: '',
    httpHeaders: '{\n  "Content-Type": "application/json"\n}',
    httpBody: '',
    httpResponse: '',
    
    // WebSocket相关数据
    wsUrl: '',
    wsConnected: false,
    wsStatus: '未连接',
    wsMessage: '',
    wsMessages: [],
    socketTask: null
  },
  
  onLoad: function() {
    // 页面加载时执行
    console.log('API测试页面加载');
    // 初始化默认值
    this.setData({
      httpUrl: getApp().globalData.apiBaseUrl + '/api/test',
      wsUrl: 'wss://echo.websocket.org'
    });
  },
  
  // HTTP请求相关方法
  onHttpMethodChange: function(e) {
    this.setData({
      httpMethodIndex: e.detail.value
    });
  },
  
  onHttpUrlInput: function(e) {
    this.setData({
      httpUrl: e.detail.value
    });
  },
  
  onHttpHeadersInput: function(e) {
    this.setData({
      httpHeaders: e.detail.value
    });
  },
  
  onHttpBodyInput: function(e) {
    this.setData({
      httpBody: e.detail.value
    });
  },
  
  sendHttpRequest: function() {
    const app = getApp();
    const self = this;
    
    // 解析请求头和请求体
    let headers = {};
    let body = null;
    
    try {
      if (this.data.httpHeaders.trim()) {
        headers = JSON.parse(this.data.httpHeaders);
      }
      
      if (this.data.httpBody.trim()) {
        body = JSON.parse(this.data.httpBody);
      }
    } catch (e) {
      wx.showToast({
        title: 'JSON格式错误',
        icon: 'none'
      });
      return;
    }
    
    // 显示加载中
    wx.showLoading({
      title: '请求中...'
    });
    
    // 发送请求
    wx.request({
      url: this.data.httpUrl,
      method: this.data.httpMethods[this.data.httpMethodIndex],
      header: headers,
      data: body,
      success: function(res) {
        // 格式化响应结果
        const response = JSON.stringify(res.data, null, 2);
        self.setData({
          httpResponse: response
        });
      },
      fail: function(err) {
        self.setData({
          httpResponse: JSON.stringify(err, null, 2)
        });
      },
      complete: function() {
        wx.hideLoading();
      }
    });
  },
  
  // WebSocket相关方法
  onWsUrlInput: function(e) {
    this.setData({
      wsUrl: e.detail.value
    });
  },
  
  onWsMessageInput: function(e) {
    this.setData({
      wsMessage: e.detail.value
    });
  },
  
  wsConnect: function() {
    if (!this.data.wsUrl) {
      wx.showToast({
        title: 'URL不能为空',
        icon: 'none'
      });
      return;
    }
    
    const self = this;
    
    // 创建WebSocket连接
    const socketTask = wx.connectSocket({
      url: this.data.wsUrl,
      success: function() {
        console.log('WebSocket连接创建成功');
      },
      fail: function(err) {
        console.error('WebSocket连接创建失败', err);
        self.addWsMessage('系统', '连接创建失败: ' + JSON.stringify(err));
      }
    });
    
    // 监听WebSocket事件
    socketTask.onOpen(function() {
      console.log('WebSocket连接已打开');
      self.setData({
        wsConnected: true,
        wsStatus: '已连接',
        socketTask: socketTask
      });
      self.addWsMessage('系统', '连接已建立');
    });
    
    socketTask.onClose(function() {
      console.log('WebSocket连接已关闭');
      self.setData({
        wsConnected: false,
        wsStatus: '未连接',
        socketTask: null
      });
      self.addWsMessage('系统', '连接已关闭');
    });
    
    socketTask.onError(function(err) {
      console.error('WebSocket错误', err);
      self.addWsMessage('系统', '连接错误: ' + JSON.stringify(err));
    });
    
    socketTask.onMessage(function(res) {
      console.log('收到WebSocket消息', res);
      self.addWsMessage('接收', res.data);
    });
  },
  
  wsDisconnect: function() {
    if (this.data.socketTask) {
      this.data.socketTask.close();
    }
  },
  
  wsSend: function() {
    if (!this.data.wsConnected || !this.data.socketTask) {
      wx.showToast({
        title: '未连接WebSocket',
        icon: 'none'
      });
      return;
    }
    
    if (!this.data.wsMessage.trim()) {
      wx.showToast({
        title: '消息不能为空',
        icon: 'none'
      });
      return;
    }
    
    const self = this;
    this.data.socketTask.send({
      data: this.data.wsMessage,
      success: function() {
        self.addWsMessage('发送', self.data.wsMessage);
        self.setData({
          wsMessage: ''
        });
      },
      fail: function(err) {
        wx.showToast({
          title: '发送失败',
          icon: 'none'
        });
        console.error('WebSocket发送消息失败', err);
      }
    });
  },
  
  addWsMessage: function(type, content) {
    const messages = this.data.wsMessages;
    messages.push({
      type: type,
      content: content,
      time: new Date().toLocaleTimeString()
    });
    
    this.setData({
      wsMessages: messages
    });
  }
});