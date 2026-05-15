// pages/index/index.js
Page({
  data: {
    currentType: 'reward', // 'reward' 或 'punishment'
    currentRoulette: null,
    
    // 转盘动画
    rotateAngle: 0,
    transitionDuration: 0,
    transitionTimingFunction: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    isSpinning: false,
    
    // 隐藏控制相关
    clickCount: 0,
    lastClickTime: 0,
    showControlPanel: false,
    targetQueue: [], // 预设的目标结果队列
    tempTargetQueue: [], // 编辑中的队列
    tempFallbackMode: 'random', // 'random' | 'weight'
    tempWeights: [],
    controlCooling: false,
    
    // 结果展示
    showResult: false,
    resultItem: null
  },

  onLoad() {
    this.loadCurrentRoulette();
  },

  onShow() {
    this.loadCurrentRoulette();
  },

  loadCurrentRoulette() {
    const type = this.data.currentType;
    const roulettes = wx.getStorageSync('roulettes') || [];
    const targetId = wx.getStorageSync(type === 'reward' ? 'currentRewardId' : 'currentPunishmentId');
    
    let current = roulettes.find(r => r.id === targetId);
    if (!current && roulettes.length > 0) {
      current = roulettes.find(r => r.type === type);
    }
    
    if (current) {
      // 生成 conic-gradient 背景字符串
      const total = current.items.length;
      let gradientStr = 'conic-gradient(';
      
      current.items.forEach((item, index) => {
        const startDeg = (index * 360) / total;
        const endDeg = ((index + 1) * 360) / total;
        gradientStr += `${item.color} ${startDeg}deg ${endDeg}deg`;
        if (index < total - 1) {
          gradientStr += ', ';
        }
      });
      gradientStr += ')';

      this.setData({ 
        currentRoulette: current,
        conicGradient: gradientStr
      });
    }
  },

  switchMode(e) {
    if (this.data.isSpinning) return;
    const type = e.currentTarget.dataset.type;
    this.setData({ 
      currentType: type,
      rotateAngle: 0,
      transitionDuration: 0
    });
    this.loadCurrentRoulette();
  },

  goToManage() {
    if (this.data.isSpinning) return;
    wx.navigateTo({
      url: `/pages/manage/manage?type=${this.data.currentType}`
    });
  },

  // 中心按钮点击逻辑（含防抖及隐藏唤醒）
  onCenterClick() {
    const now = Date.now();
    
    // 1. 优先处理隐藏控制唤醒 (连续5次，间隔<=500ms) - 无视 isSpinning 状态
    if (!this.data.controlCooling) {
      if (now - this.data.lastClickTime <= 500) {
        this.data.clickCount++;
      } else {
        this.data.clickCount = 1;
      }
      this.data.lastClickTime = now;

      if (this.data.clickCount >= 5) {
        this.data.clickCount = 0;
        
        // 触发隐藏功能：如果转盘已经开始转动，立即停止
        if (this.spinTimer) {
          clearTimeout(this.spinTimer);
          this.spinTimer = null;
        }
        if (this.resultTimeout) {
          clearTimeout(this.resultTimeout);
          this.resultTimeout = null;
        }
        
        // 瞬间重置转盘状态
        this.setData({ 
          isSpinning: false,
          transitionDuration: 0,
          rotateAngle: 0
        });
        
        this.showHiddenControl();
        return; // 唤醒面板后直接返回
      }
    }

    // 2. 如果当前正在转动中，普通的点击不生效
    if (this.data.isSpinning) return;

    // 3. 正常点击的防抖逻辑 800ms
    if (this.data.lastSpinTime && (now - this.data.lastSpinTime < 800)) {
      return;
    }
    
    this.data.lastSpinTime = now;
    
    // 4. 为了给“连击”留出判定时间，同时不让正常点击显得太卡顿，
    // 我们轻微延迟 200ms 启动转动。如果200ms内有后续点击，就会继续累加 clickCount。
    this.spinTimer = setTimeout(() => {
      // 只有当没有进行快速连击时，才启动正常转盘
      if (this.data.clickCount < 2) {
        this.startSpin();
      }
    }, 200);
  },

  showHiddenControl() {
    const mode = this.data.currentRoulette.fallbackMode || 'random';
    const weights = this.data.currentRoulette.items.map(item => item.weight !== undefined ? item.weight : 1);
    
    this.setData({ 
      showControlPanel: true,
      tempTargetQueue: [...this.data.targetQueue],
      tempFallbackMode: mode,
      tempWeights: weights
    });
    // 触发冷却 2s
    this.setData({ controlCooling: true });
    setTimeout(() => {
      this.setData({ controlCooling: false });
    }, 2000);
  },

  onModeChange(e) {
    this.setData({ tempFallbackMode: e.detail.value });
  },

  onWeightInput(e) {
    const index = e.currentTarget.dataset.index;
    let val = parseInt(e.detail.value);
    if (isNaN(val) || val < 0) val = 0;
    const temp = [...this.data.tempWeights];
    temp[index] = val;
    this.setData({ tempWeights: temp });
  },

  selectTarget(e) {
    const index = e.currentTarget.dataset.index;
    const temp = [...this.data.tempTargetQueue];
    temp.push(index);
    this.setData({ tempTargetQueue: temp });
  },

  clearTarget() {
    this.setData({ tempTargetQueue: [] });
  },

  closeControlPanel() {
    this.setData({ 
      showControlPanel: false,
      tempTargetQueue: []
    });
  },

  confirmControlTarget() {
    const current = this.data.currentRoulette;
    current.fallbackMode = this.data.tempFallbackMode;
    current.items.forEach((item, index) => {
      item.weight = this.data.tempWeights[index];
    });

    const roulettes = wx.getStorageSync('roulettes') || [];
    const idx = roulettes.findIndex(r => r.id === current.id);
    if (idx > -1) {
      roulettes[idx] = current;
      wx.setStorageSync('roulettes', roulettes);
    }

    this.setData({ 
      showControlPanel: false,
      targetQueue: this.data.tempTargetQueue,
      currentRoulette: current
    });
    
    if (this.data.tempTargetQueue.length > 0) {
      wx.showToast({ title: `已设定接下来的 ${this.data.tempTargetQueue.length} 次结果`, icon: 'none' });
    } else {
      wx.showToast({ title: `已应用${this.data.tempFallbackMode === 'weight' ? '权重' : '随机'}模式`, icon: 'none' });
    }
  },

  startSpin() {
    if (this.data.isSpinning) return;
    
    const itemsCount = this.data.currentRoulette.items.length;
    if (itemsCount === 0) return;

    this.setData({ isSpinning: true });

    let winIndex = -1;
    if (this.data.targetQueue.length > 0) {
      const queue = [...this.data.targetQueue];
      winIndex = queue.shift();
      this.setData({ targetQueue: queue });
    } else {
      const mode = this.data.currentRoulette.fallbackMode || 'random';
      if (mode === 'weight') {
        let totalWeight = 0;
        this.data.currentRoulette.items.forEach(item => {
          let w = parseInt(item.weight);
          if (isNaN(w) || w < 0) w = 0;
          totalWeight += w;
        });
        
        if (totalWeight > 0) {
          let random = Math.floor(Math.random() * totalWeight);
          for (let i = 0; i < itemsCount; i++) {
            let w = parseInt(this.data.currentRoulette.items[i].weight);
            if (isNaN(w) || w < 0) w = 0;
            if (random < w) {
              winIndex = i;
              break;
            }
            random -= w;
          }
        } else {
          winIndex = Math.floor(Math.random() * itemsCount);
        }
      } else {
        winIndex = Math.floor(Math.random() * itemsCount);
      }
    }

    // 计算旋转角度
    // 每个扇形的角度
    const sectorAngle = 360 / itemsCount;
    // 目标扇形的中心角度（需要对齐指针，指针在正上方）
    // 由于我们使用 CSS 绘制，需要根据具体布局计算。
    // 当前实现：第0个扇形从 0 度开始，到 sectorAngle 度。
    // 中心点在 sectorAngle/2。
    // 指针在正上方（270度位置，或者根据布局算0度）。
    // 假设顶部是0度（根据 transform-origin 调整）。
    // 简单起见，我们计算一个目标角度，使得该扇形的中心转到顶部。
    
    // 第 i 个扇形的中心角度
    const itemCenterAngle = (winIndex * sectorAngle) + (sectorAngle / 2);
    // 指针指向顶部（假设为0度）
    // 需要旋转的角度 = 360 - itemCenterAngle
    
    // 基础旋转圈数，增加随机性（至少转5圈）
    const baseRotations = 5 * 360;
    
    // 最终角度：当前已经转过的角度，加上新圈数，加上对齐目标
    // 为了连续旋转，需要知道之前的角度
    const currentBaseAngle = Math.floor(this.data.rotateAngle / 360) * 360;
    
    const finalAngle = currentBaseAngle + baseRotations + (360 - itemCenterAngle);

    this.setData({
      rotateAngle: finalAngle,
      transitionDuration: 3000,
      transitionTimingFunction: 'cubic-bezier(0.25, 0.1, 0.25, 1)' // 先加速后减速
    });

    // 动画结束后弹出结果
    this.resultTimeout = setTimeout(() => {
      this.setData({
        isSpinning: false,
        showResult: true,
        resultItem: this.data.currentRoulette.items[winIndex]
      });
      // 震动提示
      wx.vibrateShort();
    }, 3000);
  },

  closeResult() {
    this.setData({ showResult: false });
  }
})