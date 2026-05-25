/**
 * 楼层平面图（拟真线稿风格 SVG）。
 *
 * 设计约定：
 *   - 统一 viewBox: 0 0 400 300（与种子数据 position_x/y 范围一致）
 *   - 米黄底 + 深灰墙体，外墙厚（4px），内墙细（1.8px）
 *   - 楼梯 = 多条平行短线表示踏步；电梯 = 方框带 X
 *   - 门洞 = 内墙留缺口
 *   - 拼装时通过 `routeWaypoints`（按顺序的 {x,y} 数组）追加路线虚线
 *
 * 用法：
 *   const url = floorPlanDataUrl(floor, routeWaypoints)
 *   <image src="{{url}}" />
 */

// 颜色变量
const C = {
  bg: '#fdfaf2',
  floor: '#ffffff',
  wall: '#3d3a36',
  innerWall: '#5a5550',
  label: '#7a7570',
  facility: '#6b6660',
  entry: '#c97a3b',
  route: '#e6a23c',
}

// 通用样式片段
const STYLE = `
<style>
  .outer { fill: ${C.bg}; stroke: ${C.wall}; stroke-width: 4; }
  .room  { fill: ${C.floor}; stroke: ${C.innerWall}; stroke-width: 1.8; }
  .label { fill: ${C.label}; font-size: 13px; font-family: "PingFang SC", "Microsoft YaHei", sans-serif; font-weight: 600; letter-spacing: 1px; }
  .sub   { fill: ${C.facility}; font-size: 9px; font-family: sans-serif; }
  .stair-line { stroke: ${C.facility}; stroke-width: 0.9; fill: none; }
  .stair-box  { fill: none; stroke: ${C.facility}; stroke-width: 1.4; }
  .elev-box   { fill: none; stroke: ${C.facility}; stroke-width: 1.4; }
  .elev-x     { stroke: ${C.facility}; stroke-width: 1.2; }
  .door-gap   { stroke: ${C.bg}; stroke-width: 2.8; stroke-linecap: butt; }
  .door-arc   { fill: none; stroke: ${C.innerWall}; stroke-width: 0.8; }
  .entry-arrow { stroke: ${C.entry}; stroke-width: 2; fill: none; }
  .entry-text  { fill: ${C.entry}; font-size: 10px; font-weight: 600; }
  .route-path  { fill: none; stroke: ${C.route}; stroke-width: 2.5; stroke-dasharray: 6 4; stroke-linecap: round; stroke-linejoin: round; }
</style>
`

// 楼梯 SVG 片段（左上角 x,y，宽 w 高 h）
function stairs(x, y, w, h, label = '楼梯') {
  const steps = 6
  const stepW = w / steps
  let lines = ''
  for (let i = 1; i < steps; i++) {
    const sx = x + i * stepW
    lines += `<line class="stair-line" x1="${sx}" y1="${y}" x2="${sx}" y2="${y + h}"/>`
  }
  return `
    <rect class="stair-box" x="${x}" y="${y}" width="${w}" height="${h}"/>
    ${lines}
    <text class="sub" x="${x + w / 2}" y="${y + h + 10}" text-anchor="middle">${label}</text>
  `
}

// 电梯 SVG 片段
function elevator(x, y, size = 22, label = '电梯') {
  return `
    <rect class="elev-box" x="${x}" y="${y}" width="${size}" height="${size}"/>
    <line class="elev-x" x1="${x}" y1="${y}" x2="${x + size}" y2="${y + size}"/>
    <line class="elev-x" x1="${x + size}" y1="${y}" x2="${x}" y2="${y + size}"/>
    <text class="sub" x="${x + size / 2}" y="${y + size + 10}" text-anchor="middle">${label}</text>
  `
}

// 1F：4 角厅 + 十字走廊 + 楼梯电梯
function floor1() {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
    ${STYLE}
    <rect class="outer" x="2" y="2" width="396" height="296"/>

    <!-- 四个展厅 -->
    <rect class="room" x="20" y="20"  width="160" height="115"/>
    <rect class="room" x="220" y="20" width="160" height="115"/>
    <rect class="room" x="20" y="165" width="160" height="115"/>
    <rect class="room" x="220" y="165" width="160" height="115"/>

    <!-- 区域标签 -->
    <text class="label" x="100" y="80"  text-anchor="middle">A 区</text>
    <text class="label" x="300" y="80"  text-anchor="middle">B 区</text>
    <text class="label" x="100" y="225" text-anchor="middle">C 区</text>
    <text class="label" x="300" y="225" text-anchor="middle">D 区</text>

    <!-- 门洞（4 厅各开一道朝中庭的门） -->
    <line class="door-gap" x1="92"  y1="135" x2="112" y2="135"/>
    <line class="door-gap" x1="288" y1="135" x2="308" y2="135"/>
    <line class="door-gap" x1="92"  y1="165" x2="112" y2="165"/>
    <line class="door-gap" x1="288" y1="165" x2="308" y2="165"/>

    <!-- 中庭楼梯 -->
    ${stairs(186, 138, 28, 24, '楼梯')}

    <!-- 中庭电梯 -->
    ${elevator(248, 138, 22, '电梯')}

    <!-- 中庭文字 -->
    <text class="sub" x="200" y="190" text-anchor="middle" fill="${C.label}" font-size="11">中庭</text>

    <!-- 入口（南墙正中） -->
    <line class="door-gap" x1="180" y1="298" x2="220" y2="298"/>
    <path class="entry-arrow" d="M 200 286 L 200 295 M 195 290 L 200 295 L 205 290"/>
    <text class="entry-text" x="200" y="278" text-anchor="middle">入口</text>
    {{ROUTE_PATH}}
  </svg>
  `.trim()
}

// 2F：顶部大厅 + 底部两个展厅 + 左侧楼梯/电梯
function floor2() {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
    ${STYLE}
    <rect class="outer" x="2" y="2" width="396" height="296"/>

    <!-- 顶部大厅（横贯） -->
    <rect class="room" x="20" y="20" width="360" height="120"/>
    <text class="label" x="200" y="85" text-anchor="middle">中央大厅</text>

    <!-- 底部两展厅 -->
    <rect class="room" x="80"  y="170" width="140" height="115"/>
    <rect class="room" x="240" y="170" width="140" height="115"/>
    <text class="label" x="150" y="230" text-anchor="middle">东展厅</text>
    <text class="label" x="310" y="230" text-anchor="middle">西展厅</text>

    <!-- 门洞 -->
    <line class="door-gap" x1="190" y1="140" x2="210" y2="140"/>
    <line class="door-gap" x1="140" y1="170" x2="160" y2="170"/>
    <line class="door-gap" x1="300" y1="170" x2="320" y2="170"/>

    <!-- 左下楼梯（连接 1F、3F） -->
    ${stairs(22, 175, 28, 30, '楼梯')}
    ${elevator(22, 230, 22, '电梯')}

    <!-- 中央走廊文字 -->
    <text class="sub" x="200" y="160" text-anchor="middle" font-size="10">通往展厅 →</text>

    {{ROUTE_PATH}}
  </svg>
  `.trim()
}

// 3F：中央主厅 + 顶部两侧小室 + 底部楼梯
function floor3() {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
    ${STYLE}
    <rect class="outer" x="2" y="2" width="396" height="296"/>

    <!-- 顶部两个小室 -->
    <rect class="room" x="20"  y="20" width="150" height="80"/>
    <rect class="room" x="230" y="20" width="150" height="80"/>
    <text class="label" x="95"  y="65" text-anchor="middle">东厢房</text>
    <text class="label" x="305" y="65" text-anchor="middle">西厢房</text>

    <!-- 中央主厅 -->
    <rect class="room" x="50" y="130" width="300" height="120"/>
    <text class="label" x="200" y="195" text-anchor="middle">中央主厅</text>

    <!-- 门洞 -->
    <line class="door-gap" x1="85"  y1="100" x2="105" y2="100"/>
    <line class="door-gap" x1="295" y1="100" x2="315" y2="100"/>
    <line class="door-gap" x1="190" y1="130" x2="210" y2="130"/>

    <!-- 底部楼梯（仅楼梯，顶层无更上） -->
    ${stairs(180, 260, 40, 22, '楼梯')}

    {{ROUTE_PATH}}
  </svg>
  `.trim()
}

const FLOORS = { 1: floor1, 2: floor2, 3: floor3 }

/**
 * 把 routeWaypoints 转成 SVG path 元素
 * @param {Array<{x:number,y:number}>} pts
 */
function buildRoutePath(pts) {
  if (!pts || pts.length < 2) return ''
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  // 在 waypoint 上放小圆点
  const dots = pts
    .map((p) => `<circle cx="${p.x}" cy="${p.y}" r="4" fill="${C.route}" stroke="#fff" stroke-width="1.2"/>`)
    .join('')
  return `<path class="route-path" d="${d}"/>${dots}`
}

/**
 * 生成 data URL 形式的楼层平面图
 * @param {number} floor 1/2/3
 * @param {Array<{x:number,y:number}>} routeWaypoints 已按顺序排列的当前楼层 waypoint 坐标
 */
function floorPlanDataUrl(floor, routeWaypoints) {
  const gen = FLOORS[floor] || FLOORS[1]
  const svg = gen().replace('{{ROUTE_PATH}}', buildRoutePath(routeWaypoints || []))
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg)
}

module.exports = { floorPlanDataUrl }
