App({
  onLaunch() {
    // Web API 兼容层 (针对在普通浏览器中打开的兼容处理)
    if (typeof wx === 'undefined') {
      window.wx = {
        getStorageSync: (key) => {
          const val = localStorage.getItem(key);
          try { return val ? JSON.parse(val) : null; } catch(e) { return val; }
        },
        setStorageSync: (key, data) => {
          localStorage.setItem(key, typeof data === 'object' ? JSON.parse(JSON.stringify(data)) : data);
        },
        navigateTo: (obj) => {
          // 仅做简单的URL映射，实际上H5通过DOM控制了，这里只为防报错
          console.log('Navigate to:', obj.url);
        },
        navigateBack: () => {
          console.log('Navigate back');
        },
        showToast: (obj) => {
          alert(obj.title);
        },
        showModal: (obj) => {
          const res = confirm(obj.title + '\n' + obj.content);
          if (obj.success) obj.success({ confirm: res, cancel: !res });
        },
        vibrateShort: () => {
          if (navigator.vibrate) navigator.vibrate(50);
        },
        setNavigationBarTitle: (obj) => {
          document.title = obj.title;
        }
      };
    }

    this.initDefaultData();
  },

  initDefaultData() {
    let roulettes = wx.getStorageSync('roulettes');
    if (!roulettes || roulettes.length === 0) {
      // 默认转盘数据，移除强制的 type 分类
      roulettes = [
        {
          id: '1',
          name: '儿童日常行为奖励',
          isDefault: true,
          fallbackMode: 'random',
          items: [
            { text: '多看20分钟绘本', color: '#FF7F50', weight: 1 },
            { text: '免一次家务', color: '#6495ED', weight: 1 },
            { text: '获得小贴纸', color: '#FFB6C1', weight: 1 },
            { text: '看一集动画片', color: '#32CD32', weight: 1 },
            { text: '吃一个小零食', color: '#FFA500', weight: 1 },
            { text: '去公园玩一次', color: '#9370DB', weight: 1 }
          ]
        },
        {
          id: '2',
          name: '儿童日常行为惩罚',
          isDefault: true,
          fallbackMode: 'random',
          items: [
            { text: '收拾玩具', color: '#4682B4', weight: 1 },
            { text: '背诵一首古诗', color: '#D2B48C', weight: 1 },
            { text: '禁止看电视30分钟', color: '#778899', weight: 1 },
            { text: '罚站5分钟', color: '#5F9EA0', weight: 1 },
            { text: '写一篇日记', color: '#BC8F8F', weight: 1 },
            { text: '没收电子产品一天', color: '#708090', weight: 1 }
          ]
        }
      ];
      wx.setStorageSync('roulettes', roulettes);
    }
  }
})
