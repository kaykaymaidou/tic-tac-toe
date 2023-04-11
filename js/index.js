const { createApp } = Vue

const app = createApp({
  data() {
    return {
      // 棋盘(二维数组, 也可以用一维数组)
      chessboard: [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
      ],
      // ❌棋子
      wrong: 'wrong.svg',
      // ⭕️棋子
      right: 'right.svg',
      // 棋子类型
      chess: 1,
      // 判断是否产生胜者
      hasWinner: false,
      // 提示语
      notice: '',
      // 走棋的步的集合
      move: [],
      // 再玩一次
      oneAgain: false
    }
  },
  created() {
    this.resizeApp()
    // 监听窗口变形事件, 如果是手机端, 则将字体大小改为12ox
    window.onresize = this.resizeApp()
  },
  methods: {
    /**
     * 重置应用的窗口
     */
    resizeApp() {
      if (this.isMobile()) {
        document.documentElement.style.fontSize = '12px'
      } else {
        document.documentElement.style.fontSize = '16px'
      }
    },
    /**
     * 判断是否是移动端
     * @returns
     */
    isMobile() {
      const userAgentInfo = navigator.userAgent;
      const mobileAgents = ["Android", "iPhone", "SymbianOS", "Windows Phone", "iPod"];
      let isPhone = false;
      // 根据userAgent判断是否是手机
      for (let v = 0; v < mobileAgents.length; v++) {
        if (userAgentInfo.indexOf(mobileAgents[v]) > 0) {
          isPhone = true;
          break;
        }
      }
      const screenWidth = window.screen.width;
      const screenHeight = window.screen.height;

      // 根据屏幕分辨率判断是否是手机
      if (screenWidth > 325 && screenHeight < 750) {
        isPhone = true;
      }

      return isPhone;
    },
    /**
     * 下棋
     * @param {number} x 第几行, X轴
     * @param {number} y 第几列, Y轴
     */
    playingChess(x, y) {
      // 如果已经赢了或者该该格子已经有棋子了, 则不让点击
      if (this.hasWinner || this.chessboard[y][x]) return
      // 下棋
      this.chessboard[y][x] = this.chess
      // 判断是否产生了赢家
      this.checkWinner(this.chessboard, x, y)
      // 如果还没产生赢家则判断是否和了
      if (!this.hasWinner) {
        // 检查是否和了
        this.checkDraw(x, y)
      }
      // 如果还没产生赢家则继续下
      if (!this.oneAgain) {
        // 每点击一次下一次就切换棋子
        this.chess = 3 - this.chess
        // 电脑玩家
        this.computer(this.chessboard, this.chess)
      }
    },
    /**
     * 判断是否产生了赢家
     * @param {array} currentChessboard 当前棋盘
     * @param {number} x 前下的棋子的X坐标
     * @param {number} y 前下的棋子的Y坐标
     */
    checkWinner(currentChessboard, x, y) {
      // 两种方法判断输赢
      // this.hasWinner = this.judgeWinner(currentChessboard, this.chess)
      this.hasWinner = this.estimateWinner(currentChessboard, x, y)
      // 存在赢家则提示
      if (this.hasWinner) {
        this.notice = this.chess === 2 ? 'The computer is winner!' : 'Congratulation, You win the game!'
        this.oneAgain = true
      }
    },
    /**
     * 判断是否已经和棋了
     * @param {Number} x 当前下的棋子的X坐标
     * @param {Number} y 当前下的棋子的Y坐标
     */
    checkDraw(x, y) {
      // 没点击一次添加一步, 3 x 3一共9步
      this.move.push([x, y])
      // 9步走完还没有赢家, 应该就是和了
      if (this.move.length === 9) {
        this.notice = 'What a coincidence. It\'s a draw!'
        this.oneAgain = true
      }
    },
    /**
     * 根据下一个要下的棋子, 判断是否存在胜者
     * @param {array} chessboard 当前棋盘
     * @param {number} chess 下一个要下的棋子
     * @returns {array|null} 返回存在胜利的点位否则为空
     */
    predictWin(chessboard, chess) {
      // 循环棋盘, 判断下棋后是否存在赢家
      for (let row = 0; row < chessboard.length; row++) {
        for (let column = 0; column < chessboard[row].length; column++) {
          if (chessboard[row][column]) continue
          // 克隆棋盘以免污染之前的棋盘
          const cloneChessboard = JSON.parse(JSON.stringify(chessboard))
          // 模拟下棋
          cloneChessboard[row][column] = chess;
          // 判断是否存在赢家
          if (this.judgeWinner(cloneChessboard, chess)) return [row, column]
        }
      }
      return null
    },
    /**
     * 计算得出最佳的下棋步 (minmax极小极大值博弈算法)
     * @param {array} chessboard 旗盘
     * @param {number} chess 棋子
     * @returns {object} 返回一个结果对象 chess: 胜利棋子, point: 胜利点位, result: 结果分数
     */
     bestChoice(chessboard, chess) {
      // 绑定this以免this指针问题
      const that = this
      // 预测判断是否存在胜者
      let point = this.predictWin(chessboard, chess)
      if (point) {
        return {
          chess: chess,
          point: point,
          result: 1
        }
      }
      // 先定义一个最差的结果
      let result = -2;
      // - 这是一个label+break的写法, 用于跳出多重循环, 例如这里的 outer是用于跳出最外层的for循环的
      /* outer: for (let row = 0; row < chessboard.length; row++) {
        for (let column = 0; column < chessboard[row].length; column++) {
          if (chessboard[row][column]) continue
          // 拷贝克隆棋盘, 模拟下棋
          let cloneChessboard = JSON.parse(JSON.stringify(chessboard))
          // 下棋
          cloneChessboard[row][column] = chess
          // 根据「对手方」目前情况下未来「最好的结果」, 换位得出我方「最差的结果」(-bestResult)
          let bestResult = this.bestChoice(cloneChessboard, 3 - chess).result
          // 比较后更新落子位置和结果
          if (-bestResult >= result) {
            result = -bestResult
            point = [row, column]
          }
          // 剪枝
          if (result === 1) {
            break outer
          }
        }
      } */

      // -- 这是第二种跳出最外层for循环的解决方法, IIFE + return
      (function() {
        for (let row = 0; row < chessboard.length; row++) {
          for (let column = 0; column < chessboard[row].length; column++) {
            if (chessboard[row][column]) continue
            // 拷贝克隆棋盘, 模拟下棋
            let cloneChessboard = JSON.parse(JSON.stringify(chessboard))
            // 下棋
            cloneChessboard[row][column] = chess
            // 根据「对手方」目前情况下未来「最好的结果」, 换位得出我方「最差的结果」(-bestResult)
            let bestResult = that.bestChoice(cloneChessboard, 3 - chess).result
            // 比较后更新落子位置和结果
            if (-bestResult >= result) {
              result = -bestResult
              point = [row, column]
            }
            // 剪枝
            if (result === 1) {
              return
            }
          }
        }
      })()
      return {
        chess: chess,
        point: point,
        result: point ? result : 0
      }
    },
    /**
     * 电脑玩家
     * @param {array} currentChessboard 当前旗盘
     * @param {number} chess 当前棋子
     */
    computer(currentChessboard, chess) {
      // 选择最优的一步
      const bestStep = this.bestChoice(currentChessboard, chess)
      // 把最优解放到棋盘上
      if (bestStep?.point) currentChessboard[bestStep?.point[0]][bestStep?.point[1]] = chess
      // 判断是否产生了赢家
      this.checkWinner(currentChessboard, bestStep?.point[1], bestStep?.point[0])
      // 检查是否和了
      this.checkDraw(bestStep?.point[1], bestStep?.point[0])
      // 每点击一次下一次就切换棋子
      this.chess = 3 - chess
    },
    /**
     * 方法一
     *
     * 判断是否有赢家(这个可能会比较硬编码, 有更好的算法实现)
     * @param {array} currentChessboard 棋盘
     * @param {number} chess 当前棋子
     * @returns
     */
    judgeWinner(currentChessboard, chess) {
      for (let i = 0; i < currentChessboard.length; ++i) {
        // 判断横排和竖排是否连着, 连着就赢了
        if ((chess === currentChessboard[0][i] && chess === currentChessboard[1][i] && chess === currentChessboard[2][i]) ||
            (chess === currentChessboard[i][0] && chess === currentChessboard[i][1] && chess === currentChessboard[i][2])) {
              return true
            }
      }
      // 判断斜线是否连着, 连着就赢了
      return ((chess === currentChessboard[0][0] && chess === currentChessboard[1][1] && chess === currentChessboard[2][2]) ||
        (chess === currentChessboard[0][2] && chess === currentChessboard[1][1] && chess === currentChessboard[2][0]))
    },
    /**
     * 方法二
     *
     * 判断是否存在赢家
     * @param {array} currentChessboard 当前棋盘
     * @param {number} x 最后一次点击棋子的X坐标
     * @param {number} y 最后一次点击棋子的Y坐标
     * @returns 返回是否存在赢家
     */
    estimateWinner(currentChessboard, x, y) {
      // 东边
      const east = this.straightSign(currentChessboard, x, y, 1, 0)
      // 南边
      const south = this.straightSign(currentChessboard, x, y, 0, 1)
      // 西边
      const west = this.straightSign(currentChessboard, x, y, -1, 0)
      // 北边
      const north = this.straightSign(currentChessboard, x, y, 0, -1)
      // 东南边
      const east_south = this.straightSign(currentChessboard, x, y, 1, 1)
      // 西南边
      const west_south = this.straightSign(currentChessboard, x, y, -1, 1)
      // 东北边
      const east_north = this.straightSign(currentChessboard, x, y, 1, -1)
      // 西北边
      const west_north = this.straightSign(currentChessboard, x, y, -1, -1)
      /*
       判断同一个方向的得分是否大于等于2
       例如: 从当前这个下落棋子的坐标向八个方向判断, 如果存在某一个方向有连续三个棋子, 则相同方向相加为2, 举例: 右侧连续得分为3, 但是左侧连续得分为-1, 相加则为2
       如果该点最后落在中间, 比如 x _ x 这样, 则左侧得分为1, 右侧得分也为1, 因此只需要是否存在某一方向上得分大于等于2的得分即可判断是否已分出胜负.
       */
      if ((south + north >= 2) || (east + west >= 2) || (east_south + west_north >= 2) || (east_north + west_south >= 2)) {
        return true
      }
      return false
    },
    /**
     * 判断该点在下一个行列号是否有同源元素(即在该方向是否有连续的相同标记)
     * @param {array} currentChessboard 当前棋盘
     * @param {number} x 最后一次点击棋子的X坐标
     * @param {number} y 最后一次点击棋子的Y坐标
     * @param {number} r 遍历的行号
     * @param {number} c 遍历的列号
     */
    straightSign(currentChessboard, x, y, r, c) {
      // 当前落下棋子
      const chess = currentChessboard[y][x]
      // 计数器
      let counter = 0
      for (let index = 0; index < currentChessboard.length; index++) {
        const row = x + r * index
        const column = y + c * index
        // 当遍历的行号和列号在范围内(3 x 3的井字)并且存在连续的符号则计数+1, 否则就扣分
        if ((0 <= row && row < currentChessboard.length) && (0 <= column && column < currentChessboard.length) && currentChessboard[column][row] === chess) {
          counter++
        } else {
          counter--
        }
      }
      return counter
    },
    /**
     * 再来一次
     */
    restart() {
      this.chessboard = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
      ]
      this.chess = 1,
      this.hasWinner = false,
      this.notice = '',
      this.move = [],
      this.oneAgain = false
    }
  },
})

app.mount('#app')
