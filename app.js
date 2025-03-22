const express = require('express');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');
const app = express();
const PORT = process.env.PORT || 3003; // 修改默认端口为3003，避免冲突

// 添加CORS中间件，允许所有来源的请求
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// 提供静态文件服务
app.use(express.static(path.join(__dirname)));

// 主页路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 添加代理路由，用于转发请求到目标网站
app.get('/proxy', async (req, res) => {
  try {
    const targetUrl = req.query.url;
    if (!targetUrl) {
      return res.status(400).json({ error: '缺少url参数' });
    }
    
    console.log(`代理请求: ${targetUrl}`);
    
    // 使用http/https模块发送请求
    const https = require('https');
    const http = require('http');
    const httpModule = targetUrl.startsWith('https') ? https : http;
    
    const options = new URL(targetUrl);
    
    // 添加请求头，模拟浏览器请求
    const requestOptions = {
      hostname: options.hostname,
      path: options.pathname + options.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Referer': 'https://www.google.com/'
      }
    };
    
    const proxyReq = httpModule.request(requestOptions, (response) => {
      // 设置响应头
      res.status(response.statusCode);
      
      // 复制响应头，但排除可能导致问题的头
      const headersToExclude = ['content-encoding', 'content-length', 'transfer-encoding'];
      Object.keys(response.headers).forEach(key => {
        if (!headersToExclude.includes(key.toLowerCase())) {
          res.setHeader(key, response.headers[key]);
        }
      });
      
      // 设置CORS头
      res.setHeader('Access-Control-Allow-Origin', '*');
      
      // 转发响应数据
      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        res.send(data);
      });
    });
    
    proxyReq.on('error', (error) => {
      console.error('代理请求失败:', error);
      res.status(500).json({ error: `代理请求失败: ${error.message}` });
    });
    
    proxyReq.end();
  } catch (error) {
    console.error('代理请求失败:', error);
    res.status(500).json({ error: `代理请求失败: ${error.message}` });
  }
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