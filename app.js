const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// 提供静态文件服务
app.use(express.static(path.join(__dirname)));

// 主页路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器已启动，访问 http://localhost:${PORT}`);
  console.log('按Ctrl+C退出服务器');
});