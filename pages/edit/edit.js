// pages/edit/edit.js
Page({
  data: {
    id: '',
    type: 'reward',
    name: '',
    items: [],
    
    // 预设颜色池
    colors: [
      '#FFD700', '#FF8C00', '#FF6347', '#32CD32', '#1E90FF', '#9370DB',
      '#FF69B4', '#20B2AA', '#F08080', '#87CEFA', '#98FB98', '#DDA0DD'
    ]
  },

  onLoad(options) {
    const type = options.type || 'reward';
    this.setData({ type });

    if (options.id) {
      // 编辑模式
      this.setData({ id: options.id });
      wx.setNavigationBarTitle({ title: '编辑转盘' });
      this.loadRoulette(options.id);
    } else {
      // 新增模式
      wx.setNavigationBarTitle({ title: '新增转盘' });
      this.initNewRoulette();
    }
  },

  loadRoulette(id) {
    const allRoulettes = wx.getStorageSync('roulettes') || [];
    const roulette = allRoulettes.find(r => r.id === id);
    if (roulette) {
      this.setData({
        name: roulette.name,
        // 深拷贝items，避免直接修改缓存
        items: JSON.parse(JSON.stringify(roulette.items))
      });
    }
  },

  initNewRoulette() {
    // 默认2个选项
    this.setData({
      name: '',
      items: [
        { text: '', color: this.getRandomColor() },
        { text: '', color: this.getRandomColor() }
      ]
    });
  },

  getRandomColor() {
    const idx = Math.floor(Math.random() * this.data.colors.length);
    return this.data.colors[idx];
  },

  onNameInput(e) {
    this.setData({ name: e.detail.value });
  },

  onItemInput(e) {
    const index = e.currentTarget.dataset.index;
    const value = e.detail.value;
    const key = `items[${index}].text`;
    this.setData({ [key]: value });
  },

  addItem() {
    if (this.data.items.length >= 12) {
      wx.showToast({ title: '最多支持12个选项', icon: 'none' });
      return;
    }
    const items = this.data.items;
    items.push({ text: '', color: this.getRandomColor() });
    this.setData({ items });
  },

  deleteItem(e) {
    if (this.data.items.length <= 2) {
      wx.showToast({ title: '至少需要2个选项', icon: 'none' });
      return;
    }
    const index = e.currentTarget.dataset.index;
    const items = this.data.items;
    items.splice(index, 1);
    this.setData({ items });
  },

  changeColor(e) {
    const index = e.currentTarget.dataset.index;
    const items = this.data.items;
    // 简单循环切换颜色
    const currentColor = items[index].color;
    let colorIndex = this.data.colors.indexOf(currentColor);
    colorIndex = (colorIndex + 1) % this.data.colors.length;
    
    const key = `items[${index}].color`;
    this.setData({ [key]: this.data.colors[colorIndex] });
  },

  saveRoulette() {
    if (!this.data.name.trim()) {
      wx.showToast({ title: '请输入转盘名称', icon: 'none' });
      return;
    }
    
    for (let i = 0; i < this.data.items.length; i++) {
      if (!this.data.items[i].text.trim()) {
        wx.showToast({ title: `第${i+1}个选项内容不能为空`, icon: 'none' });
        return;
      }
    }

    let allRoulettes = wx.getStorageSync('roulettes') || [];
    
    if (this.data.id) {
      // 更新
      const index = allRoulettes.findIndex(r => r.id === this.data.id);
      if (index > -1) {
        // 不修改isDefault等其他属性
        allRoulettes[index].name = this.data.name;
        allRoulettes[index].items = this.data.items;
      }
    } else {
      // 新增
      const newRoulette = {
        id: Date.now().toString(),
        name: this.data.name,
        type: this.data.type,
        isDefault: false,
        items: this.data.items
      };
      allRoulettes.push(newRoulette);
      
      // 自动设置为当前选中
      const key = this.data.type === 'reward' ? 'currentRewardId' : 'currentPunishmentId';
      wx.setStorageSync(key, newRoulette.id);
    }
    
    wx.setStorageSync('roulettes', allRoulettes);
    
    wx.showToast({ title: '保存成功', icon: 'success' });
    setTimeout(() => {
      wx.navigateBack();
    }, 1500);
  }
})