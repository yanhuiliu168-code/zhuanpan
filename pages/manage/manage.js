// pages/manage/manage.js
Page({
  data: {
    currentType: 'reward',
    roulettes: [],
    currentId: ''
  },

  onLoad(options) {
    if (options.type) {
      this.setData({ currentType: options.type });
    }
  },

  onShow() {
    this.loadData();
  },

  loadData() {
    const allRoulettes = wx.getStorageSync('roulettes') || [];
    const filtered = allRoulettes.filter(r => r.type === this.data.currentType);
    
    const currentId = wx.getStorageSync(
      this.data.currentType === 'reward' ? 'currentRewardId' : 'currentPunishmentId'
    );

    this.setData({
      roulettes: filtered,
      currentId: currentId
    });
  },

  selectRoulette(e) {
    const id = e.currentTarget.dataset.id;
    const key = this.data.currentType === 'reward' ? 'currentRewardId' : 'currentPunishmentId';
    wx.setStorageSync(key, id);
    this.setData({ currentId: id });
    
    wx.navigateBack();
  },

  editRoulette(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/edit/edit?id=${id}&type=${this.data.currentType}`
    });
  },

  deleteRoulette(e) {
    const id = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '提示',
      content: '确定要删除这个转盘吗？',
      success: (res) => {
        if (res.confirm) {
          let allRoulettes = wx.getStorageSync('roulettes') || [];
          allRoulettes = allRoulettes.filter(r => r.id !== id);
          wx.setStorageSync('roulettes', allRoulettes);
          
          // 如果删除的是当前选中的，重置为默认
          if (this.data.currentId === id) {
            const defaultItem = allRoulettes.find(r => r.type === this.data.currentType && r.isDefault);
            if (defaultItem) {
              const key = this.data.currentType === 'reward' ? 'currentRewardId' : 'currentPunishmentId';
              wx.setStorageSync(key, defaultItem.id);
            }
          }
          
          this.loadData();
          wx.showToast({ title: '已删除', icon: 'success' });
        }
      }
    });
  },

  addRoulette() {
    wx.navigateTo({
      url: `/pages/edit/edit?type=${this.data.currentType}`
    });
  }
})