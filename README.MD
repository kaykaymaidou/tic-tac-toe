# 井字棋游戏(人机对战版)

> 井字棋, 英文名叫Tic-Tac-Toe, 是一种在 3 * 3 格子上进行的连珠游戏, 和五子棋类似, 由于棋盘一般不画边框, 格线排成井字故得名。由分别代表O和X的两个游戏者轮流在格子里留下标记（一般来说先手者为X）, 任意三个标记形成一条直线, 则为获胜

## 初始化棋盘

首先, 定义一个 3 * 3 的二维数组, 利用循环生成一个棋盘的格式

![alt 棋盘](https://img-blog.csdnimg.cn/img_convert/8fe842bc515a3673c7d3cdbc1622f741.png "棋盘格式")

然后定义一个下棋的方法 playChess 当每落一个子都判断时候结束 (结束可以是和棋或者分出胜负)

## 判断输赢

这里判断输赢, 可以有两种方法:

> ### 方法一
>
> 因为井字棋过于简单, 可以通过组合赢棋的规则, 例如:
>
> **1, 2, 3** 或者 **4, 5, 6** 或者 **7, 8, 9** 或者 **1, 4, 7** 或者 **2, 5, 8** 这样的组合
>
> 当每一个棋子落下的时候, 通过判定匹配的时候是否命中其中的组合, 从而判断胜利方

---

> ### 方法二 (推荐)
>
> 为什么推荐这种呢, 因为这种可以同样适合在五子棋, 避免了一个个列举组合, 如果是五子棋那种棋盘大的穷举就不合适了
>
> 假设当前盘面是这样的:
>
> ![alt X快赢了](https://img0.baidu.com/it/u=999310031,431478421&fm=253&fmt=auto&app=138&f=JPG?w=500&h=500 "快赢了")
>
> 当 X 落点在 [0, 1] 这个格子里的时候, 随即在这个点位向八个方位去递归循环, 如果已经超出边界则跳过, 比如:
>
> 先定义一个计数器

```JavaScript
    let counter = 0;
```

> 判断"南方"位置的棋子是否是连贯的, 如果连贯则 +1 分, 否则 -1 分

```JavaScript
    for (let index = 0; index < currentChessboard.length; index++) {
      const row = x + r * index
      const column = y + c * index
      if ((0 <= row && row < currentChessboard.length) 
        && (0 <= column && column < currentChessboard.length) 
        && currentChessboard[column][row] === chess) {
        counter++
      } else {
        counter--
      }
    }
```

> 当八个方向都判断完之后, 通过计算每个方向的得分, 如果是对角线方向则可以相加得分, 如果得分 >= 2 则可以判断已经分出胜负了

```JavaScript
    if ((south + north >= 2) 
      || (east + west >= 2) 
      || (east_south + west_south >= 2) 
      || (east_north + west_north >= 2)) {
      return true
    }
```

如果结果为 true 即表明已经存在赢家了, 如果为 false 则往下走判断是否和棋

```JavaScript
    // 没点击一次添加一步, 3 x 3一共9步
    this.move.push([x, y])
    // 9步走完还没有赢家, 应该就是和了
    if (this.move.length === 9) {
      this.notice = 'What a coincidence. It\'s a draw!'
      this.oneAgain = true
    }
```

> 和棋最简单的就是判断步数

## 添加电脑玩家

这里就是井字棋的进阶版, 因为涉及博弈算法的最简单的版本

---

> 先简单介绍一下博弈算法, 博弈算法是指用于解决博弈问题的算法, 主要分为以下几种:
>
> 1. 极小化极大算法(Minimax Algorithm) : 这是最常见的博弈算法之一, 用于计算两个玩家在一种博弈中的最佳策略。它基于一个假设, 即每个玩家都会采取最佳策略, 然后通过最小化自己的最大损失来确定最佳决策。
>
> 2. Alpha-Beta剪枝算法(Alpha-Beta Pruning): 这是一种优化版的极小化极大算法, 它可以有效地减少搜索的节点数量。Alpha-Beta剪枝算法在搜索树中寻找最优解时, 通过在搜索过程中去除不可能产生最优解的节点, 大大减少了搜索树的分支数。
>
> 3. 蒙特卡罗树搜索算法(Monte Carlo Tree Search) : 这是一种基于模拟的算法, 它通过对当前状态进行随机模拟, 不断迭代和更新搜索树, 最终找到最优解。蒙特卡罗树搜索算法通常应用于复杂的博弈问题, 例如围棋和扑克等。
>
> 4. 博弈论的数学模型:博弈论是一种数学模型, 用于描述在有限理性条件下的博弈策略和行为。博弈论的数学模型可以分析博弈的规则、博弈双方的策略、利益等因素, 并为博弈参与者提供最优决策的策略。
>
> 这其中最有名的可能就是 **蒙特卡罗树搜索算法**, 因为 AlphaGo 就是一种基于蒙特卡罗树搜索算法和深度学习的人工智能程序

而这里则用极小化极大算法或者剪枝算法即可实现一个智能的电脑玩家

> 极小化极大算法
>
>> 极小化极大算法, 是一种找出失败的最大可能性中的最小值的算法。Minimax算法常用于棋类等由两方较量的游戏和程序, 这类程序由两个游戏者轮流, 每次执行一个步骤。我们众所周知的五子棋、象棋等都属于这类程序, 所以说Minimax算法是基于搜索的博弈算法的基础。该算法是一种零总和算法, 即一方要在可选的选项中选择将其优势最大化的选择, 而另一方则选择令对手优势最小化的方法。
>>
>>> 基本思路
>>>
>>> + **极小化极大算法(Minmax)** 是一种悲观算法, 即假设对手每一步都会将我方引入从当前看理论上价值最小的格局方向, 即对手具有完美决策能力。因此我方的策略应该是选择那些对方所能达到的让我方最差情况中最好的, 也就是让对方在完美决策下所对我造成的损失最小。
>>>
>>> + **极小化极大算法(Minmax)** 不找理论最优解, 因为理论最优解往往依赖于对手是否足够愚蠢, **极小化极大算法(Minmax)** 中我方完全掌握主动, 如果对方每一步决策都是完美的, 则我方可以达到预计的最小损失格局, 如果对方没有走出完美决策, 则我方可能达到比预计的最悲观情况更好的结局。总之我方就是要在最坏情况中选择最好的。
>
> 下面是模拟的图解
>
> ![alt 井字棋部分图解](https://img-blog.csdnimg.cn/20200603175838466.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80MzkzMDk4MA==,size_16,color_FFFFFF,t_70 "井字棋部分图解")
>
> 当在棋盘上落下一个子的时候, 都进行模拟, 为什么叫极小化极大算法呢, 因为我们要的结果是尽可能赢棋, 因此从我们能获得的最优解得分最优的结果去模拟, 然后下一步模拟对方走得最差的一步棋
>
> 这里可以用伪代码表示好理解一点

```JavaScript
    // 假设对手很强, 每次也能走到自己的最好方案上。这一步体现在为结点赋值上。
    // 算法将给出全部的行棋方式。

    S0：初始状态, 规范游戏开始时的情况。
    PLAYER(s): 定义此时该谁行动。
    ACTIONS(s): 返回此状态下的合法移动集合。
    RESULT(s, a): 转移模型
    TERMINAL−TEST(s): 终止测试, 游戏结束返回真, 否则返回假。结束状态称为终止状态
    UTILITY(s, p): 效用函数
    arg_max(a ∈ S) f(a): 找出集合S中有最大f(a)值的a

    function MINIMAX-DECISION(state) returns an action // 给定一个开始状态
        return arg_max(a ∈ ACTIONS(s)) MIN-VALUE(RESULT(state, a))
    // 下一步的MIN也会找到它自己的最优解, 但是我们自己的最大收益取决于对手最坏的情况, 所以MAX的返回值是对手行棋里面最差的一步

    function MAX-VALUE(state) returns a utility value
      if TERMINAL-TEST(state) then return UTILITY(state) // 终止测试
      v ← ∞
      for each a in ACTIONS(state) do
        v ← MAX(v, MIN-VALUE(RESULT(s, a)))
      return v;

    // 为对手找到最优解, 当前这个结点的收益值就是 "我" 下一步的收益里面最小的那一个
    function MIN-VALUE(state) returns a utility value
      if TERMINAL-TEST(state) then return UTILITY(state)
      v ← ∞
      for each a in ACTIONS(state) do
        v ← MIN(v,MAX-VALUE(RESULT(s, a)))
      return v; // 这就是当前MIN结点的值, 孩子结点中最小的一个
```

> 由此可见, 极小化极大值算法是一个深度优先搜索, 如果树的深度为 m, 每个节点的合法行棋有 b 个, 那么极小极大算法的时间复杂度为 **O(b^m)**, 一次性生成所有的后继空间复杂度为 **O(bm)**, 一次只生成一个后继那么空间复杂度为 **O(m)**

回到代码, 电脑玩家和普通玩家的走法其实是一样的, 都是没下一步棋, 然后判断下的这步棋有没有分出胜负或者和棋, 因此其他步骤都一样, 重点就在模拟最优的解

+ 首先定义一个 bestChoice 的方法, 然后克隆一个棋盘, 判断若走出这一步是否会胜出, 若胜出则把当前

```JavaScript
    // 预测判断是否存在胜者
    let point = this.predictWin(chessboard, chess)
    // 胜利方的得分记为 1, 返回棋子和棋子的点位还有得分
    if (point) {
      return {
        chess: chess,
        point: point,
        result: 1
      }
    }
```

+ 定义一个最差的解, 然后通过递归循环, 模拟走的每一步棋, 通过和最差的解比较后, 得出当前最优解, 知道回到上一步, 当前即将要走的这步棋是最优的解既可

```JavaScript
    let result = -2;

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
```
