# AI日报

一个展示每日AI行业热点话题的应用，支持浏览器访问和Electron桌面应用两种方式启动。

## 功能特点

- 展示AI行业每日热点话题
- 支持Web浏览器访问
- 支持作为桌面应用运行
- 简洁美观的UI界面
- 标签页切换功能

## 安装

```bash
# 安装依赖
npm install
```

## 使用方法

### 作为Web应用启动

```bash
# 启动Web服务器
npm start
```

然后在浏览器中访问 http://localhost:3001

### WebSocket测试

在API测试标签页中，可以使用WebSocket测试功能：

1. 输入WebSocket URL: `ws://localhost:3001`
2. 点击「连接」按钮
3. 连接成功后，可以在消息框中输入内容并发送
4. 服务器会返回确认消息

### 作为桌面应用启动

```bash
# 启动Electron应用
npm run electron
```

### 开发模式

```bash
# 使用nodemon启动，支持代码热重载
npm run dev
```

## 技术栈

- Node.js
- Express
- Electron
- HTML/CSS/JavaScript

## 许可证

ISC