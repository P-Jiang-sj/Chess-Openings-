# PJ和VLZ的棋谱

中文界面的静态开局学习网页，包含 Lichess 数据库中的 3,865 条命名开局与变化。

## 本地运行

使用 Node.js 运行 `node scripts/serve.mjs`，打开 http://127.0.0.1:4173 。
检查源码与资源：`node scripts/check.mjs`。

## 功能

- 24 条常见开局入口，完整数据库按 ECO 编号排列。
- 按中文常用名、英文原名、ECO 或标准棋谱走法搜索。
- 按第一步 e4、d4、c4 / Nf3 或其他走法筛选。
- 完整着法列表：每一步的序号、执棋方、标准记谱与中文走法说明；点击任意一步直接跳转棋盘。
- 按每个局面的实际后续走法展开变招树，支持多层展开和节点跳转；不合并移步同形。
- 常见变例入口，包括西西里的纳道尔夫、龙式、加速龙式、古典、舍维宁根、斯维什尼科夫、泰马诺夫、卡恩、阿拉平、封闭、罗索里莫和莫斯科。
- 棋盘翻转、键盘左右键切换；链接保存当前开局与步数。没有播放控制、进度条或自由试走。
- 每条开局走到末尾后，可在独立对弈界面选择执白或执黑，与参考 ELO 800 / 1200 / 1500 的机器人继续对局。
- 使用自托管 Stockfish.js 19.0.1 lite single-threaded WASM 引擎，支持合法落点、王车易位、吃过路兵、升变、终局检测、悔棋和从开局局面重来。
- ELO 档位为近似参考：1500 使用引擎的限强选项，800 / 1200 在最低引擎限强档基础上分别增加 30% / 8% 的随机合法着法，不是实测平台评级。
- 本地收藏；不需账户，不向服务器上传收藏。
- 手机与桌面均使用单屏左右布局：缩小的棋盘固定在左侧，右侧通过「步骤 / 变招树 / 开局库」切换，列表独立滚动；点选着法不滚动整页。
- 顶部「PJ & VLZ」爱心按钮打开保留的爱心封面。

## 数据与许可

开局数据：https://github.com/lichess-org/chess-openings ，CC0，获取日期 2026-10-17。数据中的所有棋谱均通过 chess.js 的合法性校验；命名开局包含多条同名但不同着法顺序的记录。冷门变例保留英文名称。

走棋库：chess.js 1.4.0，BSD-2-Clause，许可随 dist/vendor/chess-LICENSE 提供。

棋子：Colin M. L. Burnett / Lichess cburnett，GPL-2.0-or-later。完整 SVG 源文件与声明随 dist/pieces 提供。

字体：Google Fonts 的 Noto Sans SC、Noto Serif SC，无法联网时使用本地中文字体。

对弈引擎：Stockfish.js 19.0.1，GPL-3.0，原版二进制、许可证和源码地址位于 dist/vendor/stockfish。源码：https://github.com/nmrugg/stockfish.js/tree/v19.0.1 。引擎在浏览器 Worker 内执行，无需 API 密钥。资产重新获取：`node scripts/fetch-engine.mjs`。

## 部署

无构建和运行时依赖。将 dist 目录作为静态站点部署；使用相对资源路径。
本站专注开局学习与从开局继续的人机练习，不含线上真人对战。树与数据检查：`node scripts/check-tree.mjs`。对手控制与资产检查：`node scripts/check-opponent.mjs`。
