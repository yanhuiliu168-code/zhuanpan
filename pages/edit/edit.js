// pages/edit/edit.js
Page({
  data: {
    roulette: null,
    colorList: ['#FF7F50', '#6495ED', '#FFB6C1', '#32CD32', '#FFA500', '#9370DB', '#4682B4', '#D2B48C', '#778899', '#5F9EA0', '#BC8F8F', '#708090']
  },

  onLoad(options) {
    if (options.id) {
      const roulettes = wx.getStorageSync('roulettes') || [];
      const roulette = roulettes.find(r => r.id === options.id);
      if (roulette) {
        wx.setNavigationBarTitle({ title: '编辑转盘' });
        this.setData({ roulette: JSON.parse(JSON.stringify(roulette)) });
      }
    } else {
      wx.setNavigationBarTitle({ title: '新增转盘' });
      this.setData({
        roulette: {
          id: Date.now().toString(),
          name: '',
          isDefault: false,
          fallbackMode: 'random',
          items: [
            { text: '选项1', color: this.data.colorList[0], weight: 1 },
            { text: '选项2', color: this.data.colorList[1], weight: 1 }
          ]
        }
      });
    }
  },

  onNameInput(e) {
    this.setData({ 'roulette.name': e.detail.value });
  },

  onItemInput(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      [`roulette.items[${index}].text`]: e.detail.value
    });
  },

  changeColor(e) {
    const index = e.currentTarget.dataset.index;
    const currentColor = this.data.roulette.items[index].color;
    let colorIdx = this.data.colorList.indexOf(currentColor);
    colorIdx = (colorIdx + 1) % this.data.colorList.length;
    
    this.setData({
      [`roulette.items[${index}].color`]: this.data.colorList[colorIdx]
    });
  },

  addItem() {
    const items = this.data.roulette.items;
    if (items.length >= 12) {
      wx.showToast({ title: '最多支持12个选项', icon: 'none' });
      return;
    }
    items.push({ 
      text: '', 
      color: this.data.colorList[items.length % this.data.colorList.length],
      weight: 1
    });
    this.setData({ 'roulette.items': items });
  },

  deleteItem(e) {
    const index = e.currentTarget.dataset.index;
    const items = this.data.roulette.items;
    if (items.length <= 2) {
      wx.showToast({ title: '最少需要2个选项', icon: 'none' });
      return;
    }
    items.splice(index, 1);
    this.setData({ 'roulette.items': items });
  },

  save() {
    const { roulette } = this.data;
    if (!roulette.name.trim()) {
      wx.showToast({ title: '请输入转盘名称', icon: 'none' });
      return;
    }
    for (let item of roulette.items) {
      if (!item.text.trim()) {
        wx.showToast({ title: '选项内容不能为空', icon: 'none' });
        return;
      }
    }

    const roulettes = wx.getStorageSync('roulettes') || [];
    const index = roulettes.findIndex(r => r.id === roulette.id);
    
    if (index > -1) {
      roulettes[index] = roulette;
    } else {
      roulettes.push(roulette);
    }
    
    wx.setStorageSync('roulettes', roulettes);
    wx.showToast({ title: '保存成功' });
    setTimeout(() => { wx.navigateBack(); }, 1500);
  }
});
