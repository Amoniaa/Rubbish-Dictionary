// pages/index/index.js

var touchStartX = 0; //触摸时的原点 
var touchStartY = 0; //触摸时的原点 
var time = 0; // 时间记录，用于滑动时且时间小于1s则执行左右滑动 
var interval = ""; // 记录/清理时间记录 
var touchMoveX = 0; // x轴方向移动的距离
var touchMoveY = 0; // y轴方向移动的距离
var move = false;

Page({
  data: {
    newUser: -1,
    none: 0,
    loading: 0,
    offline: 0,
    caution: 0,
    mask: 0,
    indexblur: -1,

    focus: false,
    showClear: false,
    rotate: false,
    refuseTap: false,

    inputValue: '',
    searchValue: '',
    result: '',

    statechange: true,
    state0: true,
    code: -1,
    state: [-1, -1, -1, -1],

    detail: -1,
    exit: false,
    gotodetail: false,

    showrecord: -1,
    searchRecord: [],

    //---------------option------------------
    showoption: -1,
    optionRotate: false,
    theme: ['1', '2', '3'],

    bcktype: 0,
    bckindex: 0,
    bckcolorindex: 0,
    bckblur: false,
    myimg: '',
    bckcolor: ['#FFFFFF', '#EFFFEF', '#FEFFD7', '#D8FFFF', '#D8EFFF', '#DDDDDD', ],
  },
  onShow() {
    let newUser = 0
    if (wx.getStorageSync('newUser'))
      newUser = wx.getStorageSync('newUser')
    else newUser = -1
    let bcktype = wx.getStorageSync('bcktype')
    let bckindex = wx.getStorageSync('bckindex')
    let bckcolorindex = wx.getStorageSync('bckcolorindex')
    let bckblur = wx.getStorageSync('bckblur')
    let myimg = wx.getStorageSync('myimg')
    this.openHistorySearch()
    this.setData({
      mask: -1,
      none: -1,
      loading: -1,
      caution: -1,
      offline: -1,
      indexblur: -1,
      showrecord: -1,
      bcktype: bcktype,
      bckindex: bckindex,
      bckcolorindex: bckcolorindex,
      bckblur: bckblur,
      myimg: myimg,
      newUser: newUser
    })
    wx.setStorageSync('newUser', 1)
    console.log("newUser")
    console.log(this.data.newUser)
  },

  // 阻止用户点击事件
  refuseTap(length) {
    this.setData({
      refuseTap: true
    })
    setTimeout(() => {
      this.releaseTap()
    }, length);
  },

  // 解除阻止用户点击事件
  releaseTap() {
    this.setData({
      refuseTap: false
    })
  },

  // 点击logo产生旋转效果
  rotate() {
    if (!this.data.rotate)
      this.setData({
        rotate: true,
        statechange: false,
      })
    setTimeout(() => {
      if (this.data.rotate)
        this.setData({
          rotate: false,
        })
    }, 1500);
  },

  // 状态切换
  stateChange() {
    this.refuseTap(500)
    let state0 = this.data.state0
    if (state0) {
      if (!this.data.inputValue.trim() && this.data.detail == -1) {
        this.showCaution(true)
      } else {
        this.toState1()
      }
    } else {
      this.toState0()
    }
    this.setData({
      state0: !state0,
      statechange: true,
    })
    this.refresh()
  },

  // 从index状态转换到选中某一类垃圾的状态
  toState1() {
    this.setData({
      searchValue: this.data.inputValue.trim(),
      detail: 0
    })
    if (!this.data.gotodetail)
      this.request(this.data.searchValue)
  },

  // 从选中某一类垃圾的状态转换到index状态
  toState0() {
    this.deactive(this.data.code)
    this.hideMask()
    this.hideOffline()
    this.hideNone()
    this.hideCaution()
    this.setData({
      searchValue: '',
      result: '',
      code: -1,
      detail: -1,
      exit: false
    })
  },

  // 点击搜索图标触发的事件
  searchTap(e) {
    if (this.data.none != 1 && this.data.loading != 1 && this.data.offline != 1 && this.data.caution != 1) {
      this.stateChange()
    }
  },

  // 点击垃圾箱触发的事件
  cardTap(e) {
    if (!this.data.state0 && !this.data.refuseTap) {
      this.stateChange()
    }
    // console.log("tapped"+currindex)
  },

  // 监听输入框的内容输入
  searchInput(event) {
    this.setData({
      inputValue: event.detail.value
    })
    if (this.data.inputValue != '') {
      this.setData({
        showClear: true,
      })
    }
  },

  // 清除输入框的内容
  clearInput() {
    this.setData({
      showClear: false,
      inputValue: ''
    })
    console.log(this.data.inputValue)
  },

  // 发送网络请求
  // request(name) {
  //   this.showLoading()
  //   var _this = this
  //   wx.request({
  //     url: 'https://api.66mz8.com/api/garbage.php',
  //     data: {
  //       name
  //     },
  //     header: {
  //       'content-type': 'application/json'
  //     },
  //     timeout: 3000,
  //     success(res) {
  //       var searchRecord = _this.data.searchRecord
  //       var searchValue = _this.data.searchValue
  //       console.log(res)
  //       if (res.data.code == 200) {
  //         let data = '';
  //         let code = -1;
  //         switch (res.data.data) {
  //           case '可回收垃圾':
  //             data = '可回收物';
  //             code = 0;
  //             break;
  //           case '有害垃圾或干垃圾':
  //             data = '有害垃圾';
  //             code = 1;
  //             break;
  //           case '湿垃圾或厨余垃圾':
  //             data = '厨余垃圾';
  //             code = 2;
  //             break;
  //           case '干垃圾或其他垃圾':
  //             data = '其他垃圾';
  //             code = 3;
  //             break;
  //           default:
  //             data = '其他垃圾';
  //             code = 3;
  //         }
  //         _this.hideLoading()
  //         _this.active(code)
  //         _this.showMask()
  //         _this.setData({
  //           result: data,
  //           code: code,
  //         })


  //         // 查找重复元素
  //         var index = searchRecord.findIndex((item, index) => {
  //           return item.value == searchValue;
  //         })

  //         // console.log(index)
  //         // 删除重复元素
  //         if (index != -1) {
  //           searchRecord.splice(index, 1);
  //         }

  //         // 在首位插入新元素
  //         searchRecord.unshift({
  //           value: searchValue,
  //           data: data,
  //           code: code + 1
  //         })
  //         if (searchRecord.length > 10) {
  //           searchRecord.pop()
  //         }
  //         wx.setStorageSync('searchRecord', searchRecord)
  //         _this.openHistorySearch()
  //       } else if (res.data.code == 202) {
  //         _this.hideLoading()
  //         _this.showNone(true)
  //       }
  //     },
  //     fail: function (res) {},
  //   })
  // },

  request(name) {
    this.showLoading()
    var _this = this
    wx.request({
      url: 'https://amoniaa.com/student/index.php/Home/rubbish/getRubbish',
      data: {
        rubbishname: name
      },
      method: 'post',
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      timeout: 3000,
      success(res) {
        console.log(res)
        if (res.data.error_code == 0) {
          _this.setData({
            searchValue: res.data.data.rubbishname,
          })
          let data = '';
          let code = -1;
          switch (res.data.data.rubbishcategory) {
            case '可回收物':
              data = '可回收物';
              code = 0;
              break;
            case '有害垃圾':
              data = '有害垃圾';
              code = 1;
              break;
            case '厨余垃圾':
              data = '厨余垃圾';
              code = 2;
              break;
            case '其他垃圾':
              data = '其他垃圾';
              code = 3;
              break;
            default:
              data = '其他垃圾';
              code = 3;
          }
          _this.hideLoading()
          _this.active(code)
          _this.showMask()
          _this.setData({
            result: data,
            code: code,
          })

          var searchRecord = _this.data.searchRecord
          var searchValue = _this.data.searchValue
          // 查找重复元素
          var index = searchRecord.findIndex((item, index) => {
            return item.value == searchValue;
          })

          // console.log(index)
          // 删除重复元素
          if (index != -1) {
            searchRecord.splice(index, 1);
          }

          // 在首位插入新元素
          searchRecord.unshift({
            value: searchValue,
            data: data,
            code: code + 1
          })
          if (searchRecord.length > 10) {
            searchRecord.pop()
          }
          wx.setStorageSync('searchRecord', searchRecord)
          _this.openHistorySearch()
        } else if (res.data.error_code == 1) {
          _this.hideLoading()
          _this.showNone(true)
        }
      },
      fail: function (res) {},
    })
  },

  // 刷新页面
  refresh() {
    this.setData({
      showClear: false,
      inputValue: '',
      focus: false,
    })
  },

  // 选中某一类垃圾
  active(index) {
    let state = [-2, -2, -2, -2]
    state[index] = 0
    this.setData({
      state
    })
  },

  // 退出选中某一类垃圾的状态
  deactive(index) {
    let state = this.data.state
    for (let i = 0; i < state.length; i++) {
      if (state[i] == 1) return;
    }
    let state1 = [-1, -1, -1, -1]
    state1[index] = 1
    this.setData({
      state: state1
    })
  },

  // 显示遮罩层
  showMask() {
    this.setData({
      mask: 1
    })
  },

  // 隐藏遮罩层
  hideMask() {
    if (this.data.mask != -1) {
      this.setData({
        mask: 0
      })
    }
  },

  // 显示加载动画
  showLoading() {
    if (this.data.searchValue) {
      this.setData({
        loading: 1
      })
      setTimeout(() => {
        if (this.data.loading) this.showOffline(true)
        this.hideLoading()
      }, 5000);
    }
  },

  // 隐藏加载动画
  hideLoading() {
    if (this.loading != -1) {
      this.setData({
        loading: 0
      })
    }
  },

  // 提示查询结果为空
  showNone(auto) {
    this.setData({
      none: 1
    })
    if (auto) {
      setTimeout(() => {
        this.hideNone()
        if (!this.data.state0) this.stateChange()
      }, 2000);
    }
  },

  // 隐藏提示查询结果为空
  hideNone() {
    if (this.data.none != -1) {
      this.setData({
        none: 0
      })
    }
  },

  // 提示网络状态出现问题
  showOffline(auto) {
    this.setData({
      offline: 1
    })
    if (auto) {
      setTimeout(() => {
        this.hideOffline()
        if (!this.data.state0) this.stateChange()
      }, 2000);
    }
  },

  // 隐藏提示网络状态出现问题
  hideOffline() {
    if (this.data.offline != -1) {
      this.setData({
        offline: 0
      })
    }
  },

  // 提示输入内容不能为空
  showCaution(auto) {
    this.setData({
      caution: 1
    })
    if (auto) {
      setTimeout(() => {
        this.hideCaution()
        if (!this.data.state0) this.stateChange()
      }, 2000);
    }
  },

  // 隐藏提示输入内容不能为空
  hideCaution() {
    if (this.data.caution != -1) {
      this.setData({
        caution: 0
      })
    }
  },

  // 进入详细信息状态
  enterDetail(e) {
    if (!this.data.refuseTap && this.data.none != 1 && this.data.loading != 1 && this.data.offline != 1 && this.data.caution != 1) {
      this.refuseTap(500)
      if (this.data.detail == -1) {
        let currindex = e.currentTarget.dataset.index
        console.log(currindex)
        this.setData({
          code: currindex,
          detail: 1,
          gotodetail: true
        })
        this.stateChange()
        this.active(currindex)
        this.showMask()
        this.setData({
          detail: 1,
          exit: true,
        })
      } else {
        this.setData({
          detail: 1,
          exit: true,
        })
      }
    }
  },

  // 退出详细信息状态
  exitDetail() {
    if (!this.data.refuseTap) {
      if (this.data.gotodetail) {
        this.refuseTap(1000)
        this.setData({
          gotodetail: false,
          detail: 0,
        })
      } else {
        this.refuseTap(500)
        this.setData({
          detail: 0,
        })
      }
      this.autoBack()
    }
  },

  // 自动切换到index状态
  autoBack() {
    setTimeout(() => {
      this.stateChange()
    }, 500);
  },


  // 显示模糊效果
  showBlur() {
    this.setData({
      indexblur: 1
    })

  },

  // 隐藏模糊效果
  hideBlur() {
    this.setData({
      indexblur: 0
    })
  },
  //--------------------------------------record--------------------------------------

  /*
   *加载搜索记录
   */
  openHistorySearch: function () {
    this.setData({
      searchRecord: wx.getStorageSync('searchRecord') || [], //若无储存则为空
    })
  },

  // 显示菜单页面
  showRecord() {
    this.setData({
      showrecord: 1

    })

  },

  // 隐藏菜单页面
  hideRecord() {
    this.setData({
      showrecord: 0
    })
  },



  //--------------------------------------option--------------------------------------

  // 显示菜单页面
  showOption() {
    if (!this.data.optionRotate)
      this.setData({
        optionRotate: true,
        showoption: 1
      })
    setTimeout(() => {
      if (this.data.optionRotate)
        this.setData({
          optionRotate: false,
        })
    }, 500);
  },

  // 隐藏菜单页面
  hideOption() {
    this.setData({
      showoption: 0
    })
  },

  // 设置背景颜色
  changeBckColor(e) {

    let bckcolorindex = e.currentTarget.dataset.bckcolorindex
    console.log(this.data.bckcolor[bckcolorindex].normal)
    if (bckcolorindex != this.data.bckcolorindex) {
      this.setData({
        bcktype: 0,
        bckcolorindex: bckcolorindex,
        bckindex: -1,
      })
      this.setstorage()
    }
  },

  // 切换背景
  changeBck(e) {
    let bckindex = e.currentTarget.dataset.bckindex
    console.log(bckindex)
    this.setData({
      bcktype: 1,
      bckindex: bckindex,
      bckcolorindex: -1
    })
    this.setstorage()
  },

  // 切换背景模糊
  blurChange() {
    let bckblur = this.data.bckblur
    this.setData({
      bckblur: !bckblur
    })
    wx.setStorageSync('bckblur', this.data.bckblur)
  },

  // 选择本地图片
  chooseimg() {
    let _this = this
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths
        _this.setData({
          myimg: tempFilePaths
        })
        wx.setStorageSync('myimg', _this.data.myimg)
        _this.setData({
          bcktype: 1,
          bckindex: 4,
          bckcolorindex: -1
        })
        _this.setstorage()
      }
    })
  },
  setstorage() {
    wx.setStorageSync('bckindex', this.data.bckindex)
    wx.setStorageSync('bckcolorindex', this.data.bckcolorindex)
    wx.setStorageSync('bcktype', this.data.bcktype)
  },


  // 手势操作
  touchStart: function (e) {
    touchStartX = e.touches[0].pageX; // 获取触摸时的原点 
    touchStartY = e.touches[0].pageY; // 获取触摸时的原点 
    // 使用js计时器记录时间 
    interval = setInterval(function () {
      time++;
    }, 1000);
  },
  // 触摸移动事件 
  touchMove: function (e) {
    move = true;
    touchMoveX = e.touches[0].pageX;
    touchMoveY = e.touches[0].pageY;
  },
  // 触摸结束事件 
  touchEnd: function (e) {
    console.log(e.currentTarget.id)
    var object = e.currentTarget.id
    // console.log(move)
    if (move) {
      var moveX = touchMoveX - touchStartX
      var moveY = touchMoveY - touchStartY
      console.log(moveX)
      if (Math.sign(moveX) == -1) {
        moveX = moveX * -1
      }
      if (Math.sign(moveY) == -1) {
        moveY = moveY * -1
      }
      if (moveX <= moveY) { // 上下
        // 向上滑动
        if (touchMoveY - touchStartY <= -30 && time < 100) {
          console.log("向上滑动")
        }
        // 向下滑动 
        if (touchMoveY - touchStartY >= 30 && time < 100) {
          console.log('向下滑动 ');
        }
      } else { // 左右
        // 向左滑动
        if (touchMoveX - touchStartX <= -30 && time < 100) {
          console.log("向左滑动")
          if (object == 'index') {
            this.showBlur()
            this.showRecord()
          }

          if (object == 'option') {
            // this.hideBlur()
            this.hideOption()
          }
        }
        // 向右滑动 
        if (touchMoveX - touchStartX >= 50 && time < 100) {
          console.log('向右滑动');
          if (object == 'index')
            this.showOption()
          if (object == 'record') {
            this.hideBlur()
            this.hideRecord()
          }
        }
      }
      // console.log("clearInterval")
      clearInterval(interval); // 清除setInterval 
      time = 0;
      touchStartX = 0;
      touchStartY = 0;
      time = 0;
      interval = "";
      touchMoveX = 0;
      touchMoveY = 0;
      move = false;
    }

  },

  hideGuide() {
    this.setData({
      newUser: 1
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  onShareTimeline: function () {

  }
})