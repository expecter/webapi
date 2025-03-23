// game.js
Page({
  data: {
    activeTab: 'generals', // 当前激活的标签页：武将或战法
    loading: true,
    error: false,
    errorMsg: '',
    searchKeyword: '',
    
    // 武将数据
    generals: [],
    filteredGenerals: [],
    
    // 战法数据
    tactics: [],
    filteredTactics: [],
    
    // 筛选选项
    qualityOptions: ['全部', 'SSR', 'SR', 'R', 'N'],
    countryOptions: ['全部', '魏', '蜀', '吴', '群'],
    typeOptions: ['全部', '主动', '被动', '特殊'],
    
    // 筛选条件
    filterOptions: {
      generals: {
        quality: '全部',
        country: '全部'
      },
      tactics: {
        type: '全部',
        quality: '全部'
      }
    }
  },
  
  onLoad: function() {
    this.fetchGameData();
  },
  
  onPullDownRefresh: function() {
    this.fetchGameData();
  },
  
  // 切换标签页
  switchTab: function(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({
      activeTab: tab
    });
    
    // 如果数据还没加载，则加载数据
    if (tab === 'generals' && this.data.generals.length === 0) {
      this.fetchGenerals();
    } else if (tab === 'tactics' && this.data.tactics.length === 0) {
      this.fetchTactics();
    }
  },
  
  // 搜索输入
  onSearchInput: function(e) {
    this.setData({
      searchKeyword: e.detail.value
    });
    
    // 根据当前标签页筛选数据
    if (this.data.activeTab === 'generals') {
      this.filterGenerals();
    } else {
      this.filterTactics();
    }
  },
  
  // 品质筛选变化
  onQualityChange: function(e) {
    const quality = this.data.qualityOptions[e.detail.value];
    
    if (this.data.activeTab === 'generals') {
      this.setData({
        'filterOptions.generals.quality': quality
      });
      this.filterGenerals();
    } else {
      this.setData({
        'filterOptions.tactics.quality': quality
      });
      this.filterTactics();
    }
  },
  
  // 国家筛选变化
  onCountryChange: function(e) {
    const country = this.data.countryOptions[e.detail.value];
    
    this.setData({
      'filterOptions.generals.country': country
    });
    this.filterGenerals();
  },
  
  // 战法类型筛选变化
  onTypeChange: function(e) {
    const type = this.data.typeOptions[e.detail.value];
    
    this.setData({
      'filterOptions.tactics.type': type
    });
    this.filterTactics();
  },
  
  // 获取游戏数据
  fetchGameData: function() {
    this.fetchGenerals();
    this.fetchTactics();
  },
  
  // 获取武将数据
  fetchGenerals: function() {
    // 显示加载状态
    this.setData({
      loading: true,
      error: false
    });
    
    // 模拟数据 - 实际项目中应该从服务器获取
    const mockGenerals = [
      { id: 1, name: '曹操', quality: 'SSR', country: '魏', attack: 95, defense: 90, intelligence: 98, leadership: 100 },
      { id: 2, name: '刘备', quality: 'SSR', country: '蜀', attack: 85, defense: 88, intelligence: 92, leadership: 98 },
      { id: 3, name: '孙权', quality: 'SSR', country: '吴', attack: 88, defense: 92, intelligence: 95, leadership: 96 },
      { id: 4, name: '关羽', quality: 'SSR', country: '蜀', attack: 98, defense: 95, intelligence: 80, leadership: 90 },
      { id: 5, name: '张飞', quality: 'SR', country: '蜀', attack: 96, defense: 94, intelligence: 70, leadership: 85 },
      { id: 6, name: '赵云', quality: 'SR', country: '蜀', attack: 95, defense: 90, intelligence: 85, leadership: 88 },
      { id: 7, name: '马超', quality: 'SR', country: '蜀', attack: 97, defense: 85, intelligence: 78, leadership: 86 },
      { id: 8, name: '黄忠', quality: 'SR', country: '蜀', attack: 96, defense: 80, intelligence: 75, leadership: 82 },
      { id: 9, name: '典韦', quality: 'SR', country: '魏', attack: 99, defense: 92, intelligence: 65, leadership: 80 },
      { id: 10, name: '许褚', quality: 'SR', country: '魏', attack: 97, defense: 95, intelligence: 60, leadership: 78 },
      { id: 11, name: '夏侯惇', quality: 'SR', country: '魏', attack: 94, defense: 93, intelligence: 75, leadership: 85 },
      { id: 12, name: '夏侯渊', quality: 'SR', country: '魏', attack: 92, defense: 88, intelligence: 80, leadership: 86 },
      { id: 13, name: '周瑜', quality: 'SR', country: '吴', attack: 85, defense: 80, intelligence: 98, leadership: 92 },
      { id: 14, name: '陆逊', quality: 'SR', country: '吴', attack: 78, defense: 82, intelligence: 96, leadership: 90 },
      { id: 15, name: '太史慈', quality: 'R', country: '吴', attack: 90, defense: 85, intelligence: 80, leadership: 82 },
      { id: 16, name: '甘宁', quality: 'R', country: '吴', attack: 92, defense: 80, intelligence: 75, leadership: 80 },
      { id: 17, name: '吕布', quality: 'SSR', country: '群', attack: 100, defense: 98, intelligence: 70, leadership: 92 },
      { id: 18, name: '貂蝉', quality: 'SR', country: '群', attack: 70, defense: 65, intelligence: 90, leadership: 75 },
      { id: 19, name: '华佗', quality: 'SR', country: '群', attack: 60, defense: 70, intelligence: 100, leadership: 80 },
      { id: 20, name: '司马懿', quality: 'SSR', country: '魏', attack: 80, defense: 85, intelligence: 100, leadership: 95 }
    ];
    
    // 延迟模拟网络请求
    setTimeout(() => {
      this.setData({
        generals: mockGenerals,
        loading: false
      });
      
      // 筛选数据
      this.filterGenerals();
      
      // 停止下拉刷新
      wx.stopPullDownRefresh();
    }, 1000);
  },
  
  // 获取战法数据
  fetchTactics: function() {
    // 显示加载状态
    if (this.data.activeTab === 'tactics') {
      this.setData({
        loading: true,
        error: false
      });
    }
    
    // 模拟数据 - 实际项目中应该从服务器获取
    const mockTactics = [
      { id: 1, name: '突袭', quality: 'SSR', type: '主动', description: '对敌方单体造成150%伤害，并有30%几率眩晕目标1回合' },
      { id: 2, name: '火计', quality: 'SSR', type: '主动', description: '对敌方全体造成120%伤害，并附加灼烧效果，持续2回合' },
      { id: 3, name: '水淹', quality: 'SSR', type: '主动', description: '对敌方全体造成130%伤害，并降低目标20%攻击力，持续2回合' },
      { id: 4, name: '连环计', quality: 'SR', type: '主动', description: '对敌方单体造成两次80%伤害，并有25%几率眩晕目标1回合' },
      { id: 5, name: '奇袭', quality: 'SR', type: '主动', description: '对敌方单体造成140%伤害，并无视目标30%防御' },
      { id: 6, name: '强袭', quality: 'SR', type: '主动', description: '对敌方单体造成160%伤害' },
      { id: 7, name: '火攻', quality: 'SR', type: '主动', description: '对敌方全体造成110%伤害，并附加灼烧效果，持续2回合' },
      { id: 8, name: '铁壁', quality: 'SR', type: '被动', description: '提高自身30%防御力，受到攻击时有20%几率反击' },
      { id: 9, name: '鹰眼', quality: 'SR', type: '被动', description: '提高自身20%命中率，攻击时有25%几率造成暴击' },
      { id: 10, name: '疾风', quality: 'SR', type: '被动', description: '提高自身15%速度，每回合开始时有20%几率获得额外行动机会' },
      { id: 11, name: '神医', quality: 'SR', type: '被动', description: '每回合结束时恢复自身10%生命值，并有15%几率解除一个负面效果' },
      { id: 12, name: '破军', quality: 'R', type: '主动', description: '对敌方单体造成130%伤害，并降低目标15%防御力，持续2回合' },
      { id: 13, name: '火箭', quality: 'R', type: '主动', description: '对敌方全体造成100%伤害' },
      { id: 14, name: '坚守', quality: 'R', type: '被动', description: '提高自身25%防御力' },
      { id: 15, name: '飞矢', quality: 'R', type: '主动', description: '对敌方单体造成120%伤害，并有15%几率造成流血效果，持续2回合' },
      { id: 16, name: '勇猛', quality: 'R', type: '被动', description: '提高自身20%攻击力' },
      { id: 17, name: '神速', quality: 'R', type: '被动', description: '提高自身10%速度，攻击时有15%几率获得额外攻击机会' },
      { id: 18, name: '天眼', quality: 'N', type: '被动', description: '提高自身15%命中率' },
      { id: 19, name: '回春', quality: 'N', type: '被动', description: '每回合结束时恢复自身5%生命值' },
      { id: 20, name: '突刺', quality: 'N', type: '主动', description: '对敌方单体造成110%伤害' }
    ];
    
    // 延迟模拟网络请求
    setTimeout(() => {
      this.setData({
        tactics: mockTactics,
        loading: false
      });
      
      // 筛选数据
      this.filterTactics();
      
      // 停止下拉刷新
      wx.stopPullDownRefresh();
    }, 1000);
  },
  
  // 筛选武将数据
  filterGenerals: function() {
    const keyword = this.data.searchKeyword.toLowerCase();
    const quality = this.data.filterOptions.generals.quality;
    const country = this.data.filterOptions.generals.country;
    
    const filtered = this.data.generals.filter(general => {
      // 关键词筛选
      const matchKeyword = general.name.toLowerCase().includes(keyword);
      
      // 品质筛选
      const matchQuality = quality === '全部' || general.quality === quality;
      
      // 国家筛选
      const matchCountry = country === '全部' || general.country === country;
      
      return matchKeyword && matchQuality && matchCountry;
    });
    
    this.setData({
      filteredGenerals: filtered
    });
  },
  
  // 筛选战法数据
  filterTactics: function() {
    const keyword = this.data.searchKeyword.toLowerCase();
    const quality = this.data.filterOptions.tactics.quality;
    const type = this.data.filterOptions.tactics.type;
    
    const filtered = this.data.tactics.filter(tactic => {
      // 关键词筛选
      const matchKeyword = tactic.name.toLowerCase().includes(keyword) || 
                           tactic.description.toLowerCase().includes(keyword);
      
      // 品质筛选
      const matchQuality = quality === '全部' || tactic.quality === quality;
      
      // 类型筛选
      const matchType = type === '全部' || tactic.type === type;
      
      return matchKeyword && matchQuality && matchType;
    });
    
    this.setData({
      filteredTactics: filtered
    });
  },
  
  // 获取筛选后的武将数据
  getFilteredGenerals: function() {
    return this.data.filteredGenerals;
  },
  
  // 获取筛选后的战法数据
  getFilteredTactics: function() {
    return this.data.filteredTactics;
  },
  
  // 查看武将详情
  viewGeneralDetail: function(e) {
    const id = e.currentTarget.dataset.id;
    const general = this.data.generals.find(g => g.id === id);
    
    if (general) {
      wx.showModal({
        title: general.name,
        content: `品质: ${general.quality}\n国家: ${general.country}\n攻击: ${general.attack}\n防御: ${general.defense}\n智力: ${general.intelligence}\n统率: ${general.leadership}`,
        showCancel: false
      });
    }
  },
  
  // 查看战法详情
  viewTacticDetail: function(e) {
    const id = e.currentTarget.dataset.id;
    const tactic = this.data.tactics.find(t => t.id === id);
    
    if (tactic) {
      wx.showModal({
        title: tactic.name,
        content: `品质: ${tactic.quality}\n类型: ${tactic.type}\n描述: ${tactic.description}`,
        showCancel: false
      });
    }
  }
});