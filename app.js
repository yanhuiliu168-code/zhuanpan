// 封装一个简单的兼容层，让 wx API 可以在网页中运行（如果是 H5 环境）
if (typeof wx === 'undefined') {
  window.wx = {
    getStorageSync: function(key) {
      const val = localStorage.getItem(key);
      try {
        return val ? JSON.parse(val) : '';
      } catch (e) {
        return val;
      }
    },
    setStorageSync: function(key, data) {
      localStorage.setItem(key, typeof data === 'object' ? JSON.stringify(data) : data);
    },
    navigateTo: function(obj) {
      if (obj && obj.url) {
        // 简单模拟页面跳转，实际 H5 可能需要路由库
        console.log('Navigate to:', obj.url);
        window.location.href = obj.url + '.html'; // 假设编译为html
      }
    },
    navigateBack: function() {
      window.history.back();
    },
    showToast: function(obj) {
      if (obj && obj.title) {
        alert(obj.title);
      }
    },
    showModal: function(obj) {
      if (obj && obj.content) {
        const res = confirm(obj.content);
        if (obj.success) {
          obj.success({ confirm: res, cancel: !res });
        }
      }
    },
    vibrateShort: function() {
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    },
    setNavigationBarTitle: function(obj) {
      if (obj && obj.title) {
        document.title = obj.title;
      }
    }
  };
}

App({
  onLaunch: function () {
    this.initDefaultData();
  },
  initDefaultData() {
    let roulettes = wx.getStorageSync('roulettes');
    if (!roulettes) {
      roulettes = [
        {
          id: '1',
          name: '日常奖励',
          type: 'reward',
          isDefault: true,
          items: [
            { text: '多看20分钟绘本', color: '#FF7F50' }, // 珊瑚色
            { text: '免一次家务', color: '#6495ED' }, // 矢车菊蓝
            { text: '获得小贴纸', color: '#FFB6C1' }, // 浅粉红
            { text: '看一集动画片', color: '#32CD32' }, // 鲜黄绿
            { text: '吃一个小零食', color: '#FFA500' }, // 橙色
            { text: '去公园玩一次', color: '#9370DB' }  // 中紫
          ]
        },
        {
          id: '2',
          name: '日常惩罚',
          type: 'punishment',
          isDefault: true,
          items: [
            { text: '收拾玩具', color: '#4682B4' }, // 钢蓝
            { text: '背诵一首古诗', color: '#D2B48C' }, // 浅灰紫红
            { text: '禁止看电视30分钟', color: '#778899' }, // 浅石板灰
            { text: '罚站5分钟', color: '#5F9EA0' }, // 军蓝
            { text: '写一篇日记', color: '#BC8F8F' }, // 玫瑰棕
            { text: '没收电子产品一天', color: '#708090' } // 石板灰
          ]
        }
      ];
      wx.setStorageSync('roulettes', roulettes);
    }
    
    if (!wx.getStorageSync('currentRewardId')) {
      wx.setStorageSync('currentRewardId', '1');
    }
    if (!wx.getStorageSync('currentPunishmentId')) {
      wx.setStorageSync('currentPunishmentId', '2');
    }
  },
  globalData: {
    userInfo: null
  }
})