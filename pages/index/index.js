// pages/index/index.js
Page({
  data: {
    roulettes: []
  },

  onShow() {
    this.loadData();
  },

  loadData() {
    const roulettes = wx.getStorageSync('roulettes') || [];
    this.setData({ roulettes });
  },

  goToPlay(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/play/play?id=${id}`
    });
  },

  goToEdit(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/edit/edit?id=${id}`
    });
  },

  createRoulette() {
    wx.navigateTo({
      url: '/pages/edit/edit'
    });
  },

  deleteRoulette(e) {
    const id = e.currentTarget.dataset.id;
    const roulette = this.data.roulettes.find(r => r.id === id);
    if (roulette.isDefault) {
      wx.showToast({ title: '默认转盘不可删除', icon: 'none' });
      return;
    }

    wx.showModal({
      title: '提示',
      content: '确定要删除这个转盘吗？',
      success: (res) => {
        if (res.confirm) {
          const newRoulettes = this.data.roulettes.filter(r => r.id !== id);
          wx.setStorageSync('roulettes', newRoulettes);
          this.loadData();
        }
      }
    });
  }
});
