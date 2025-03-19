document.addEventListener('DOMContentLoaded', function() {
    // 更新页脚年份
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    // 获取DOM元素
    const reportsList = document.getElementById('reportsList');
    const loadingElement = document.getElementById('loading');
    const errorElement = document.getElementById('error');
    const tab1Btn = document.getElementById('tab1');
    const tab2Btn = document.getElementById('tab2');
    
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
            
            // 使用代理服务器来解决跨域问题
            // 注意：cors-anywhere现在需要访问https://cors-anywhere.herokuapp.com/corsdemo获取临时访问权限
            // 尝试使用多个可选的代理服务器
            const proxyOptions = [
                'https://api.allorigins.win/raw?url=',
                'https://thingproxy.freeboard.io/fetch/',
                'https://api.codetabs.com/v1/proxy?quest=',
                'https://cors-anywhere.herokuapp.com/',
                'https://crossorigin.me/',
                'https://cors-proxy.htmldriven.com/?url=',
                'https://corsproxy.io/?'
            ];
            
            // 尝试所有代理服务器，直到成功
            let proxyIndex = 0;
            const targetUrl = 'https://www.aibase.com/zh/daily';
            
            // 简化请求配置，避免CORS问题
            const fetchOptions = {
                // 不设置自定义请求头，避免触发复杂的预检请求
                mode: 'cors' // 保留CORS模式
            };
            
            // 尝试所有代理服务器，直到成功或全部失败
            let response = null;
            let lastError = null;
            
            for (let i = 0; i < proxyOptions.length; i++) {
                const proxyUrl = proxyOptions[i];
                try {
                    console.log(`尝试使用代理 ${i+1}/${proxyOptions.length}: ${proxyUrl}`);
                    console.log('正在请求:', proxyUrl + targetUrl);
                    
                    response = await fetch(proxyUrl + targetUrl, fetchOptions);
                    console.log('响应状态:', response.status, response.statusText);
                    
                    // 304状态码表示资源未被修改，这不是错误
                    if (response.ok || response.status === 304) {
                        console.log(`代理 ${proxyUrl} 请求成功`);
                        break; // 成功获取响应，跳出循环
                    } else {
                        throw new Error(`网络响应不正常: ${response.status} ${response.statusText}`);
                    }
                } catch (error) {
                    console.error(`使用代理 ${proxyUrl} 失败:`, error);
                    lastError = error;
                    // 继续尝试下一个代理
                }
            }
            
            // 如果所有代理都失败了
            if (!response || (!response.ok && response.status !== 304)) {
                throw new Error(`所有代理服务器都失败: ${lastError?.message || '未知错误'}`);
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
    
    // 更新标签状态
    function updateTabStatus() {
        // 更新标签按钮状态
        tab1Btn.classList.toggle('active', currentTab === 1);
        tab2Btn.classList.toggle('active', currentTab === 2);
    }
    
    // 添加标签按钮事件监听
    tab1Btn.addEventListener('click', function() {
        currentTab = 1;
        displayReports(allReports);
    });
    
    tab2Btn.addEventListener('click', function() {
        currentTab = 2;
        displayReports(allReports);
    });
    
    // 初始加载
    fetchReports();
    // 初始化标签状态
    updateTabStatus();
});