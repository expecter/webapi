document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const tab1Content = document.getElementById('tab1-content');
    const tab2Content = document.getElementById('tab2-content');
    const tab3Content = document.getElementById('tab3-content');
    const tab1Btn = document.getElementById('tab1');
    const tab2Btn = document.getElementById('tab2');
    const tab3Btn = document.getElementById('tab3');
    
    // 标签切换功能
    tab1Btn.addEventListener('click', () => {
        tab1Btn.classList.add('active');
        tab2Btn.classList.remove('active');
        tab3Btn.classList.remove('active');
        tab1Content.style.display = 'block';
        tab2Content.style.display = 'none';
        tab3Content.style.display = 'none';
        currentTab = 1;
        displayReports(allReports);
    });
    
    tab2Btn.addEventListener('click', () => {
        tab2Btn.classList.add('active');
        tab1Btn.classList.remove('active');
        tab3Btn.classList.remove('active');
        tab1Content.style.display = 'none';
        tab2Content.style.display = 'block';
        tab3Content.style.display = 'none';
        currentTab = 2;
        displayReports(allReports);
    });
    
    tab3Btn.addEventListener('click', () => {
        tab3Btn.classList.add('active');
        tab1Btn.classList.remove('active');
        tab2Btn.classList.remove('active');
        tab1Content.style.display = 'none';
        tab2Content.style.display = 'none';
        tab3Content.style.display = 'block';
        currentTab = 3;
        // 如果是第一次点击，加载武将和战法数据
        if (!generalsLoaded || !tacticsLoaded) {
            fetchGameData();
        }
    });
    
    // HTTP请求测试功能
    const httpMethod = document.getElementById('httpMethod');
    const httpUrl = document.getElementById('httpUrl');
    const httpHeaders = document.getElementById('httpHeaders');
    const httpBody = document.getElementById('httpBody');
    const sendHttpRequest = document.getElementById('sendHttpRequest');
    const httpResponse = document.getElementById('httpResponse');
    
    sendHttpRequest.addEventListener('click', async () => {
        try {
            // 解析请求头
            let headers = {};
            try {
                headers = httpHeaders.value ? JSON.parse(httpHeaders.value) : {};
            } catch (e) {
                throw new Error('请求头格式错误，请确保是有效的JSON格式');
            }
            
            // 解析请求体
            let body = null;
            if (httpBody.value) {
                try {
                    body = JSON.parse(httpBody.value);
                } catch (e) {
                    throw new Error('请求体格式错误，请确保是有效的JSON格式');
                }
            }
            
            // 发送请求
            const response = await fetch(httpUrl.value, {
                method: httpMethod.value,
                headers: headers,
                body: body ? JSON.stringify(body) : null
            });
            
            // 获取响应
            const responseText = await response.text();
            let formattedResponse;
            try {
                // 尝试格式化JSON响应
                const jsonResponse = JSON.parse(responseText);
                formattedResponse = JSON.stringify(jsonResponse, null, 2);
            } catch (e) {
                // 如果不是JSON，直接显示文本
                formattedResponse = responseText;
            }
            
            // 显示响应结果
            httpResponse.textContent = `状态码: ${response.status} ${response.statusText}\n\n${formattedResponse}`;
        } catch (error) {
            httpResponse.textContent = `错误: ${error.message}`;
        }
    });
    
    // WebSocket测试功能
    const wsUrl = document.getElementById('wsUrl');
    const wsConnect = document.getElementById('wsConnect');
    const wsDisconnect = document.getElementById('wsDisconnect');
    const wsMessage = document.getElementById('wsMessage');
    const wsSend = document.getElementById('wsSend');
    const wsMessages = document.getElementById('wsMessages');
    const wsStatus = document.getElementById('wsStatus');
    
    let ws = null;
    
    // 添加消息到日志
    function addMessageToLog(message, type) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', type);
        messageElement.textContent = message;
        wsMessages.appendChild(messageElement);
        wsMessages.scrollTop = wsMessages.scrollHeight;
    }
    
    // WebSocket连接
    wsConnect.addEventListener('click', () => {
        try {
            ws = new WebSocket(wsUrl.value);
            
            ws.onopen = () => {
                wsStatus.textContent = '已连接';
                wsConnect.disabled = true;
                wsDisconnect.disabled = false;
                wsSend.disabled = false;
                addMessageToLog('WebSocket连接已建立', 'info');
            };
            
            ws.onclose = () => {
                wsStatus.textContent = '未连接';
                wsConnect.disabled = false;
                wsDisconnect.disabled = true;
                wsSend.disabled = true;
                ws = null;
                addMessageToLog('WebSocket连接已关闭', 'info');
            };
            
            ws.onerror = (error) => {
                addMessageToLog(`WebSocket错误: ${error.message}`, 'error');
            };
            
            ws.onmessage = (event) => {
                addMessageToLog(`收到消息: ${event.data}`, 'received');
            };
        } catch (error) {
            addMessageToLog(`连接错误: ${error.message}`, 'error');
        }
    });
    
    // WebSocket断开连接
    wsDisconnect.addEventListener('click', () => {
        if (ws) {
            ws.close();
        }
    });
    
    // WebSocket发送消息
    wsSend.addEventListener('click', () => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            const message = wsMessage.value;
            ws.send(message);
            addMessageToLog(`发送消息: ${message}`, 'sent');
            wsMessage.value = '';
        }
    });

    // 更新页脚年份
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    // 获取DOM元素
    const reportsList = document.getElementById('reportsList');
    const loadingElement = document.getElementById('loading');
    const errorElement = document.getElementById('error');
    
    // 存储所有报告的数组
    let allReports = [];
    
    // 标签相关变量
    let currentTab = 1;
    const reportsPerPage = 11; // 每页显示11条报告
    
    // 获取AIbase日报数据
    async function fetchReports() {
        try {
            // 显示加载状态
            loadingElement.style.display = 'block';
            errorElement.style.display = 'none';
            reportsList.innerHTML = '';
            
            // 使用本地代理路由来解决跨域问题
            const targetUrl = 'https://www.aibase.com/zh/daily';
            const localProxyUrl = `/proxy?url=${encodeURIComponent(targetUrl)}`;
            
            console.log('正在请求本地代理:', localProxyUrl);
            
            // 使用本地代理发送请求
            let response = null;
            try {
                response = await fetch(localProxyUrl);
                console.log('响应状态:', response.status, response.statusText);
                
                if (!response.ok && response.status !== 304) {
                    throw new Error(`网络响应不正常: ${response.status} ${response.statusText}`);
                }
            } catch (error) {
                console.error('使用本地代理失败:', error);
                throw new Error(`本地代理请求失败: ${error.message}`);
            }
            
            const html = await response.text();
            
            // 创建一个DOM解析器来解析HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // 提取热点话题信息 (使用更广泛的选择器来适应网站结构变化)
            // 尝试多种可能的选择器组合，针对aibase.com/zh/daily页面结构
            const possibleSelectors = [
                '.daily-content .topic-item', // 日报页面中的话题项
                '.daily-topic, .hot-topic, .trending-item', // 热点话题可能的选择器
                '.news-item, .topic-item', // 新闻/话题类选择器
                '.content-item', // 通用内容项
                'article', // HTML5语义标签
                '.list-item', // 列表项
                '.daily-list li' // 日报列表项
            ];
            
            allReports = [];
            
            // 尝试每一个选择器
            for (const selector of possibleSelectors) {
                const elements = doc.querySelectorAll(selector);
                console.log(`尝试选择器 ${selector}, 找到 ${elements.length} 个元素`);
                
                if (elements.length > 0) {
                    elements.forEach(element => {
                        const linkElement = element.querySelector('a');
                        if (linkElement) {
                            const title = linkElement.textContent.trim();
                            let url = linkElement.getAttribute('href');
                            
                            // 确保URL是完整的
                            if (url && !url.startsWith('http')) {
                                url = 'https://aibase.com' + (url.startsWith('/') ? '' : '/') + url;
                            }
                            
                            // 获取当前日期
                            const today = new Date();
                            const dateStr = today.toISOString().split('T')[0]; // 格式：YYYY-MM-DD
                            
                            if (title && url) {
                                // 避免重复添加
                                if (!allReports.some(report => report.title === title)) {
                                    allReports.push({ title, url, date: dateStr });
                                }
                            }
                        }
                    });
                    
                    // 如果找到了话题，就不再尝试其他选择器
                    if (allReports.length > 0) {
                        console.log(`使用选择器 ${selector} 成功找到 ${allReports.length} 个热点话题`);
                        break;
                    }
                }
            }
            
            // 如果没有找到热点话题，尝试从页面中提取任何可能的话题
            if (allReports.length === 0) {
                // 尝试更通用的选择器
                const allLinks = doc.querySelectorAll('a');
                allLinks.forEach(link => {
                    const title = link.textContent.trim();
                    let url = link.getAttribute('href');
                    
                    // 只选择看起来像热点话题的链接
                    if (title && url && title.length > 10 && !title.includes('登录') && !title.includes('注册')) {
                        // 确保URL是完整的
                        if (!url.startsWith('http')) {
                            url = 'https://aibase.com' + (url.startsWith('/') ? '' : '/') + url;
                        }
                        
                        // 获取当前日期
                        const today = new Date();
                        const dateStr = today.toISOString().split('T')[0]; // 格式：YYYY-MM-DD
                        
                        allReports.push({ title, url, date: dateStr });
                    }
                });
            }
            
            // 显示报告
            displayReports(allReports);
            
        } catch (error) {
            console.error('获取日报失败:', error);
            loadingElement.style.display = 'none';
            errorElement.style.display = 'block';
            
            // 清除之前的错误信息
            while (errorElement.childNodes.length > 1) {
                errorElement.removeChild(errorElement.lastChild);
            }
            
            // 设置主要错误信息
            errorElement.querySelector('p').textContent = `获取日报信息失败: ${error.message}`;
            
            // 如果是CORS错误，自动提示使用演示数据
            if (error.message.includes('CORS') || error.message.includes('跨域') || error.message.includes('access control')) {
                const autoDemo = document.createElement('p');
                autoDemo.innerHTML = '<strong>提示：</strong>由于跨域问题，建议使用演示数据查看功能演示。';
                autoDemo.style.color = '#ff9800';
                autoDemo.style.marginTop = '10px';
                errorElement.insertBefore(autoDemo, errorElement.childNodes[1]);
            }
            
            // 根据错误类型提供不同的帮助信息
            if (error.message.includes('CORS') || error.message.includes('跨域') || error.message.includes('access control')) {
                const corsMessage = document.createElement('p');
                corsMessage.innerHTML = '跨域请求被阻止。请尝试：<br>1. 安装CORS浏览器扩展<br>2. 使用自己的代理服务器<br>3. 点击下方"加载演示数据"';  
                errorElement.appendChild(corsMessage);
            } else if (error.message.includes('网络') || error.message.includes('Network') || error.message.includes('timeout')) {
                const networkMessage = document.createElement('p');
                networkMessage.innerHTML = '网络连接问题。请检查：<br>1. 您的网络连接是否正常<br>2. 目标网站是否可访问';
                errorElement.appendChild(networkMessage);
            } else if (error.message.includes('解析失败') || error.message.includes('未找到')) {
                const parseMessage = document.createElement('p');
                parseMessage.innerHTML = '数据解析问题。可能原因：<br>1. 目标网站结构已更改<br>2. 返回的数据格式不符合预期';
                errorElement.appendChild(parseMessage);
            }
            
            // 添加重试按钮
            const retryButton = document.createElement('button');
            retryButton.textContent = '重新尝试';
            retryButton.style.margin = '10px 10px 10px 0';
            retryButton.style.padding = '8px 16px';
            retryButton.style.backgroundColor = '#4CAF50';
            retryButton.style.color = 'white';
            retryButton.style.border = 'none';
            retryButton.style.borderRadius = '4px';
            retryButton.style.cursor = 'pointer';
            retryButton.addEventListener('click', fetchReports);
            errorElement.appendChild(retryButton);
            
            // 添加演示数据按钮
            const demoButton = document.createElement('button');
            demoButton.textContent = '加载演示数据';
            demoButton.style.margin = '10px 0';
            demoButton.style.padding = '8px 16px';
            demoButton.style.backgroundColor = '#6e8efb';
            demoButton.style.color = 'white';
            demoButton.style.border = 'none';
            demoButton.style.borderRadius = '4px';
            demoButton.style.cursor = 'pointer';
            demoButton.addEventListener('click', loadDemoData);
            errorElement.appendChild(demoButton);
        }
    }
    
    // 加载演示数据
    function loadDemoData() {
        // 使用当前日期生成热点话题演示数据
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0]; // 格式：YYYY-MM-DD
        const demoReports = [];
        
        // 生成10个日报热点话题
        const hotTopics = [
            '【今日要闻】OpenAI发布GPT-4 Turbo，性能大幅提升，处理速度提高2倍',
            '【技术突破】谷歌推出Gemini模型，在多项基准测试中超越GPT-4',
            '【开源动态】Meta开源大型语言模型Llama 3，参数规模达700B',
            '【国内进展】百度文心一言4.0发布，中文能力大幅提升',
            '【产品更新】微软推出新一代Copilot AI助手，集成Office全家桶',
            '【模型发布】Anthropic发布Claude 3 Opus，多模态能力显著增强',
            '【行业里程碑】国内首个千亿参数开源大模型发布，填补技术空白',
            '【创意AI】AI绘画新突破：Midjourney V6支持精确人物描述和场景控制',
            '【应用前沿】自动驾驶新进展：特斯拉FSD V12完全基于端到端AI训练',
            '【AI医疗】AI医疗诊断准确率首次超过人类医生，FDA批准临床使用'
        ];
        
        // 添加所有热点话题
        hotTopics.forEach(topic => {
            demoReports.push({ title: topic, url: '#', date: dateStr });
        });
        
        allReports = demoReports;
        displayReports(demoReports);
        loadingElement.style.display = 'none';
        errorElement.style.display = 'none';
        
        // 显示演示模式提示
        const demoNotice = document.createElement('div');
        demoNotice.className = 'demo-notice';
        demoNotice.innerHTML = '<p><strong>演示模式</strong>：当前显示的是演示数据，非实际AI日报热点内容。</p>';
        reportsList.parentNode.insertBefore(demoNotice, reportsList);
    }
    
    // 显示热点话题列表
    function displayReports(reports) {
        loadingElement.style.display = 'none';
        reportsList.innerHTML = '';
        
        // 更新标签状态
        updateTabStatus();
        
        // 如果是第二个标签，显示空白页面
        if (currentTab === 2) {
            const emptyPage = document.createElement('div');
            emptyPage.className = 'empty-page';
            emptyPage.innerHTML = '<h3>空白页面</h3><p>这是一个空白页面</p>';
            emptyPage.style.textAlign = 'center';
            emptyPage.style.padding = '3rem 0';
            emptyPage.style.color = '#666';
            reportsList.appendChild(emptyPage);
            return;
        }
        
        // 第一页显示AI日报内容
        if (reports.length === 0) {
            const noResults = document.createElement('p');
            noResults.textContent = '没有找到相关热点话题';
            noResults.style.textAlign = 'center';
            noResults.style.padding = '2rem 0';
            reportsList.appendChild(noResults);
            return;
        }
        
        // 显示报告（最多显示11条）
        const reportsToShow = reports.slice(0, reportsPerPage);
        
        // 显示报告
        reportsToShow.forEach(report => {
            const li = document.createElement('li');
            li.className = 'report-item';
            
            const a = document.createElement('a');
            a.href = report.url;
            a.target = '_blank';
            a.textContent = report.title;
            
            const dateSpan = document.createElement('div');
            dateSpan.className = 'report-date';
            dateSpan.textContent = report.date;
            
            li.appendChild(a);
            li.appendChild(dateSpan);
            reportsList.appendChild(li);
        });
    }
    
    // 武将和战法数据相关变量
    const generalsList = document.getElementById('generalsList');
    const tacticsList = document.getElementById('tacticsList');
    const generalsLoadingElement = document.getElementById('generalsLoading');
    const tacticsLoadingElement = document.getElementById('tacticsLoading');
    const generalsErrorElement = document.getElementById('generalsError');
    const tacticsErrorElement = document.getElementById('tacticsError');
    
    // 存储武将和战法数据的数组
    let allGenerals = [];
    let allTactics = [];
    let generalsLoaded = false;
    let tacticsLoaded = false;
    
    // 获取武将和战法数据
    async function fetchGameData() {
        // 获取武将数据
        fetchGenerals();
        // 获取战法数据
        fetchTactics();
    }
    
    // 获取武将数据
    async function fetchGenerals() {
        try {
            // 显示加载状态
            generalsLoadingElement.style.display = 'block';
            generalsErrorElement.style.display = 'none';
            generalsList.innerHTML = '';
            
            // 使用本地代理路由来解决跨域问题
            const targetUrl = 'https://sgzzlb.lingxigames.com/station/';
            const localProxyUrl = `/proxy?url=${encodeURIComponent(targetUrl)}`;
            
            console.log('正在请求本地代理:', localProxyUrl);
            
            // 使用本地代理发送请求
            let response = null;
            try {
                response = await fetch(localProxyUrl);
                console.log('响应状态:', response.status, response.statusText);
                
                if (!response.ok && response.status !== 304) {
                    throw new Error(`网络响应不正常: ${response.status} ${response.statusText}`);
                }
            } catch (error) {
                console.error('使用本地代理失败:', error);
                throw new Error(`本地代理请求失败: ${error.message}`);
            }
            
            const html = await response.text();
            
            // 创建一个DOM解析器来解析HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // 提取武将信息
            allGenerals = [];
            
            // 尝试多种可能的选择器组合
            const possibleSelectors = [
                '.general-list .general-item',
                '.general-card, .general-info',
                '.hero-list .hero-item',
                '.character-list .character-item',
                '.general-table tr',
                '.general-grid .grid-item'
            ];
            
            // 尝试每一个选择器
            for (const selector of possibleSelectors) {
                const elements = doc.querySelectorAll(selector);
                console.log(`尝试选择器 ${selector}, 找到 ${elements.length} 个元素`);
                
                if (elements.length > 0) {
                    elements.forEach(element => {
                        // 尝试提取武将名称和属性
                        const nameElement = element.querySelector('.name, h3, .title, strong');
                        if (nameElement) {
                            const name = nameElement.textContent.trim();
                            
                            // 提取武将属性
                            const attributes = {};
                            const attributeElements = element.querySelectorAll('.attribute, .stat, .property');
                            attributeElements.forEach(attrElement => {
                                const attrName = attrElement.querySelector('.label, .name')?.textContent.trim() || '属性';
                                const attrValue = attrElement.querySelector('.value')?.textContent.trim() || attrElement.textContent.trim();
                                attributes[attrName] = attrValue;
                            });
                            
                            // 如果没有找到属性，尝试从其他元素提取
                            if (Object.keys(attributes).length === 0) {
                                const statElements = element.querySelectorAll('span, div:not(.name)');
                                let attrCount = 0;
                                statElements.forEach(statElement => {
                                    if (statElement.textContent.trim() && statElement !== nameElement) {
                                        attributes[`属性${++attrCount}`] = statElement.textContent.trim();
                                    }
                                });
                            }
                            
                            // 添加到武将列表
                            if (name && !allGenerals.some(general => general.name === name)) {
                                allGenerals.push({ name, attributes });
                            }
                        }
                    });
                    
                    // 如果找到了武将，就不再尝试其他选择器
                    if (allGenerals.length > 0) {
                        console.log(`使用选择器 ${selector} 成功找到 ${allGenerals.length} 个武将`);
                        break;
                    }
                }
            }
            
            // 如果没有找到武将，使用演示数据
            if (allGenerals.length === 0) {
                loadDemoGenerals();
            } else {
                // 显示武将列表
                displayGenerals(allGenerals);
                generalsLoaded = true;
            }
            
        } catch (error) {
            console.error('获取武将数据失败:', error);
            generalsLoadingElement.style.display = 'none';
            generalsErrorElement.style.display = 'block';
            generalsErrorElement.querySelector('p').textContent = `获取武将数据失败: ${error.message}`;
            
            // 添加演示数据按钮
            const demoButton = document.createElement('button');
            demoButton.textContent = '加载演示数据';
            demoButton.style.margin = '10px 0';
            demoButton.style.padding = '8px 16px';
            demoButton.style.backgroundColor = '#6e8efb';
            demoButton.style.color = 'white';
            demoButton.style.border = 'none';
            demoButton.style.borderRadius = '4px';
            demoButton.style.cursor = 'pointer';
            demoButton.addEventListener('click', loadDemoGenerals);
            generalsErrorElement.appendChild(demoButton);
        }
    }
    
    // 获取战法数据
    async function fetchTactics() {
        try {
            // 显示加载状态
            tacticsLoadingElement.style.display = 'block';
            tacticsErrorElement.style.display = 'none';
            tacticsList.innerHTML = '';
            
            // 使用本地代理路由来解决跨域问题
            const targetUrl = 'https://sgzzlb.lingxigames.com/station/';
            const localProxyUrl = `/proxy?url=${encodeURIComponent(targetUrl)}`;
            
            console.log('正在请求本地代理:', localProxyUrl);
            
            // 使用本地代理发送请求
            let response = null;
            try {
                response = await fetch(localProxyUrl);
                console.log('响应状态:', response.status, response.statusText);
                
                if (!response.ok && response.status !== 304) {
                    throw new Error(`网络响应不正常: ${response.status} ${response.statusText}`);
                }
            } catch (error) {
                console.error('使用本地代理失败:', error);
                throw new Error(`本地代理请求失败: ${error.message}`);
            }
            
            const html = await response.text();
            
            // 创建一个DOM解析器来解析HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // 提取战法信息
            allTactics = [];
            
            // 尝试多种可能的选择器组合
            const possibleSelectors = [
                '.tactic-list .tactic-item',
                '.tactic-card, .tactic-info',
                '.skill-list .skill-item',
                '.ability-list .ability-item',
                '.tactic-table tr',
                '.tactic-grid .grid-item'
            ];
            
            // 尝试每一个选择器
            for (const selector of possibleSelectors) {
                const elements = doc.querySelectorAll(selector);
                console.log(`尝试选择器 ${selector}, 找到 ${elements.length} 个元素`);
                
                if (elements.length > 0) {
                    elements.forEach(element => {
                        // 尝试提取战法名称和属性
                        const nameElement = element.querySelector('.name, h3, .title, strong');
                        if (nameElement) {
                            const name = nameElement.textContent.trim();
                            
                            // 提取战法属性
                            const attributes = {};
                            const attributeElements = element.querySelectorAll('.attribute, .stat, .property');
                            attributeElements.forEach(attrElement => {
                                const attrName = attrElement.querySelector('.label, .name')?.textContent.trim() || '属性';
                                const attrValue = attrElement.querySelector('.value')?.textContent.trim() || attrElement.textContent.trim();
                                attributes[attrName] = attrValue;
                            });
                            
                            // 如果没有找到属性，尝试从其他元素提取
                            if (Object.keys(attributes).length === 0) {
                                const statElements = element.querySelectorAll('span, div:not(.name)');
                                let attrCount = 0;
                                statElements.forEach(statElement => {
                                    if (statElement.textContent.trim() && statElement !== nameElement) {
                                        attributes[`属性${++attrCount}`] = statElement.textContent.trim();
                                    }
                                });
                            }
                            
                            // 添加到战法列表
                            if (name && !allTactics.some(tactic => tactic.name === name)) {
                                allTactics.push({ name, attributes });
                            }
                        }
                    });
                    
                    // 如果找到了战法，就不再尝试其他选择器
                    if (allTactics.length > 0) {
                        console.log(`使用选择器 ${selector} 成功找到 ${allTactics.length} 个战法`);
                        break;
                    }
                }
            }
            
            // 如果没有找到战法，使用演示数据
            if (allTactics.length === 0) {
                loadDemoTactics();
            } else {
                // 显示战法列表
                displayTactics(allTactics);
                tacticsLoaded = true;
            }
            
        } catch (error) {
            console.error('获取战法数据失败:', error);
            tacticsLoadingElement.style.display = 'none';
            tacticsErrorElement.style.display = 'block';
            tacticsErrorElement.querySelector('p').textContent = `获取战法数据失败: ${error.message}`;
            
            // 添加演示数据按钮
            const demoButton = document.createElement('button');
            demoButton.textContent = '加载演示数据';
            demoButton.style.margin = '10px 0';
            demoButton.style.padding = '8px 16px';
            demoButton.style.backgroundColor = '#6e8efb';
            demoButton.style.color = 'white';
            demoButton.style.border = 'none';
            demoButton.style.borderRadius = '4px';
            demoButton.style.cursor = 'pointer';
            demoButton.addEventListener('click', loadDemoTactics);
            tacticsErrorElement.appendChild(demoButton);
        }
    }
    
    // 加载演示武将数据
    function loadDemoGenerals() {
        // 演示武将数据
        const demoGenerals = [
            { name: '曹操', attributes: { '武力': '90', '智力': '95', '统率': '96', '政治': '90' } },
            { name: '刘备', attributes: { '武力': '82', '智力': '85', '统率': '92', '政治': '95' } },
            { name: '孙权', attributes: { '武力': '80', '智力': '90', '统率': '92', '政治': '88' } },
            { name: '关羽', attributes: { '武力': '97', '智力': '80', '统率': '94', '政治': '75' } },
            { name: '张飞', attributes: { '武力': '96', '智力': '70', '统率': '89', '政治': '65' } },
            { name: '赵云', attributes: { '武力': '95', '智力': '85', '统率': '90', '政治': '80' } },
            { name: '吕布', attributes: { '武力': '100', '智力': '70', '统率': '85', '政治': '60' } },
            { name: '诸葛亮', attributes: { '武力': '65', '智力': '100', '统率': '90', '政治': '95' } },
            { name: '周瑜', attributes: { '武力': '80', '智力': '98', '统率': '92', '政治': '85' } },
            { name: '司马懿', attributes: { '武力': '70', '智力': '97', '统率': '88', '政治': '90' } }
        ];
        
        allGenerals = demoGenerals;
        displayGenerals(demoGenerals);
        generalsLoaded = true;
        generalsLoadingElement.style.display = 'none';
        generalsErrorElement.style.display = 'none';
    }
    
    // 加载演示战法数据
    function loadDemoTactics() {
        // 演示战法数据
        const demoTactics = [
            { name: '火计', attributes: { '类型': '谋略', '消耗': '3', '效果': '对敌军造成大量火焰伤害' } },
            { name: '水计', attributes: { '类型': '谋略', '消耗': '3', '效果': '降低敌军移动速度' } },
            { name: '突击', attributes: { '类型': '武力', '消耗': '2', '效果': '提高我方部队攻击力' } },
            { name: '强袭', attributes: { '类型': '武力', '消耗': '4', '效果': '对敌军造成大量物理伤害' } },
            { name: '鼓舞', attributes: { '类型': '统率', '消耗': '2', '效果': '提高我方部队士气' } },
            { name: '军威', attributes: { '类型': '统率', '消耗': '3', '效果': '降低敌军士气' } },
            { name: '伏兵', attributes: { '类型': '谋略', '消耗': '4', '效果': '在指定位置埋伏部队' } },
            { name: '疾行', attributes: { '类型': '统率', '消耗': '1', '效果': '提高我方部队移动速度' } },
            { name: '箭雨', attributes: { '类型': '武力', '消耗': '3', '效果': '对敌军范围造成伤害' } },
            { name: '智谋', attributes: { '类型': '谋略', '消耗': '2', '效果': '提高我方部队防御力' } }
        ];
        
        allTactics = demoTactics;
        displayTactics(demoTactics);
        tacticsLoaded = true;
        tacticsLoadingElement.style.display = 'none';
        tacticsErrorElement.style.display = 'none';
    }
    
    // 显示武将列表
    function displayGenerals(generals) {
        generalsList.innerHTML = '';
        
        generals.forEach(general => {
            const li = document.createElement('li');
            li.className = 'data-item';
            
            const nameDiv = document.createElement('div');
            nameDiv.className = 'data-name';
            nameDiv.textContent = general.name;
            
            const attributesDiv = document.createElement('div');
            attributesDiv.className = 'data-attributes';
            
            for (const [key, value] of Object.entries(general.attributes)) {
                const attrSpan = document.createElement('span');
                attrSpan.className = 'attribute';
                attrSpan.textContent = `${key}: ${value}`;
                attributesDiv.appendChild(attrSpan);
            }
            
            li.appendChild(nameDiv);
            li.appendChild(attributesDiv);
            generalsList.appendChild(li);
        });
    }
    
    // 显示战法列表
    function displayTactics(tactics) {
        tacticsList.innerHTML = '';
        
        tactics.forEach(tactic => {
            const li = document.createElement('li');
            li.className = 'data-item';
            
            const nameDiv = document.createElement('div');
            nameDiv.className = 'data-name';
            nameDiv.textContent = tactic.name;
            
            const attributesDiv = document.createElement('div');
            attributesDiv.className = 'data-attributes';
            
            for (const [key, value] of Object.entries(tactic.attributes)) {
                const attrSpan = document.createElement('span');
                attrSpan.className = 'attribute';
                attrSpan.textContent = `${key}: ${value}`;
                attributesDiv.appendChild(attrSpan);
            }
            
            li.appendChild(nameDiv);
            li.appendChild(attributesDiv);
            tacticsList.appendChild(li);
        });
    }
    
    // 更新标签状态
    function updateTabStatus() {
        // 根据当前标签更新UI状态
        if (currentTab === 1) {
            tab1Btn.classList.add('active');
            tab2Btn.classList.remove('active');
            tab3Btn.classList.remove('active');
            tab1Content.style.display = 'block';
            tab2Content.style.display = 'none';
            tab3Content.style.display = 'none';
        } else if (currentTab === 2) {
            tab2Btn.classList.add('active');
            tab1Btn.classList.remove('active');
            tab3Btn.classList.remove('active');
            tab1Content.style.display = 'none';
            tab2Content.style.display = 'block';
            tab3Content.style.display = 'none';
        } else if (currentTab === 3) {
            tab3Btn.classList.add('active');
            tab1Btn.classList.remove('active');
            tab2Btn.classList.remove('active');
            tab1Content.style.display = 'none';
            tab2Content.style.display = 'none';
            tab3Content.style.display = 'block';
        }
    }
    
    // 初始化标签状态
    updateTabStatus();
    
    // 初始加载
    fetchReports();
});