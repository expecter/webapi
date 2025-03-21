const express = require('express');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');
const app = express();
const PORT = process.env.PORT || 3002; // 修改默认端口为3002，避免冲突

// 提供静态文件服务
app.use(express.static(path.join(__dirname)));

// 主页路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 创建HTTP服务器
const server = http.createServer(app);

// 创建WebSocket服务器
const wss = new WebSocket.Server({ server });

// WebSocket连接处理
wss.on('connection', (ws) => {
  console.log('WebSocket客户端已连接');
  
  // 接收消息
  ws.on('message', (message) => {
    console.log(`收到消息: ${message}`);
    
    // 发送响应消息
    ws.send(`服务器已收到: ${message}`);
  });
  
  // 连接关闭
  ws.on('close', () => {
    console.log('WebSocket客户端已断开连接');
  });
  
  // 发送欢迎消息
  ws.send('欢迎连接到WebSocket服务器！');
});

// 启动服务器
server.listen(PORT, () => {
  console.log(`服务器已启动，访问 http://localhost:${PORT}`);
  console.log(`WebSocket服务器运行在 ws://localhost:${PORT}`);
  console.log('按Ctrl+C退出服务器');
});