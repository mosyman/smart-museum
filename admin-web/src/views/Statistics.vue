<template>
  <div class="statistics-container">
    <!-- 统计卡片 -->
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-icon">
            <el-icon :size="40"><Collection /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-title">展品总数</div>
            <div class="stat-value">{{ stats.totalExhibits || 0 }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-icon">
            <el-icon :size="40"><User /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-title">用户总数</div>
            <div class="stat-value">{{ stats.totalUsers || 0 }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-icon">
            <el-icon :size="40"><View /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-title">总访问量</div>
            <div class="stat-value">{{ stats.totalVisits || 0 }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-icon">
            <el-icon :size="40"><TrendCharts /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-title">今日访问</div>
            <div class="stat-value">{{ stats.todayVisits || 0 }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 热门展品表格 -->
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <span>热门展品 TOP 10</span>
          </template>
          <el-table :data="hotExhibits" stripe v-loading="loading">
            <el-table-column prop="rank" label="排名" width="70">
              <template #default="{ $index }">
                <span :class="getRankClass($index + 1)">{{ $index + 1 }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="name" label="展品名称" min-width="150" />
            <el-table-column prop="viewCount" label="浏览次数" width="100" sortable />
          </el-table>
        </el-card>
      </el-col>

      <!-- 分类统计饼图 -->
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <span>展品分类统计</span>
          </template>
          <div ref="pieChartRef" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 访问趋势折线图 -->
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="24">
        <el-card class="chart-card">
          <template #header>
            <span>近7天访问趋势</span>
          </template>
          <div ref="lineChartRef" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import { Collection, User, View, TrendCharts } from '@element-plus/icons-vue'
import { getHotExhibit, getVisitorFlow, getCategoryStats, getVisitTrend } from '@/api/statistics'

// 数据
const loading = ref(false)
const stats = ref({})
const hotExhibits = ref([])

// 图表引用
const pieChartRef = ref(null)
const lineChartRef = ref(null)

let pieChart = null
let lineChart = null

// 获取排名样式
const getRankClass = (rank) => {
  if (rank === 1) return 'rank-1'
  if (rank === 2) return 'rank-2'
  if (rank === 3) return 'rank-3'
  return ''
}

// 加载统计卡片数据
const loadStats = async () => {
  try {
    const res = await getVisitorFlow()
    if (res.code === 200) {
      stats.value = res.data
    }
  } catch (error) {
    console.error('加载统计数据失败', error)
  }
}

// 加载热门展品
const loadHotExhibits = async () => {
  loading.value = true
  try {
    const res = await getHotExhibit()
    if (res.code === 200) {
      hotExhibits.value = res.data || []
    }
  } catch (error) {
    console.error('加载热门展品失败', error)
  } finally {
    loading.value = false
  }
}

// 加载分类统计并绘制饼图
const loadCategoryStats = async () => {
  try {
    const res = await getCategoryStats()
    if (res.code === 200 && pieChartRef.value) {
      const data = res.data || {}
      const pieData = Object.entries(data).map(([name, value]) => ({ name, value }))

      pieChart = echarts.init(pieChartRef.value)
      pieChart.setOption({
        tooltip: { trigger: 'item' },
        legend: { orient: 'vertical', left: 'left' },
        series: [{
          type: 'pie',
          radius: '55%',
          data: pieData,
          emphasis: { scale: true },
          label: { show: true, formatter: '{b}: {d}%' }
        }]
      })
    }
  } catch (error) {
    console.error('加载分类统计失败', error)
  }
}

// 加载访问趋势并绘制折线图
const loadVisitTrend = async () => {
  try {
    const res = await getVisitTrend()
    if (res.code === 200 && lineChartRef.value) {
      const { dates, counts } = res.data

      lineChart = echarts.init(lineChartRef.value)
      lineChart.setOption({
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: dates, name: '日期' },
        yAxis: { type: 'value', name: '访问量' },
        series: [{
          type: 'line',
          data: counts,
          smooth: true,
          areaStyle: { opacity: 0.3 },
          lineStyle: { color: '#409EFF', width: 2 },
          symbol: 'circle',
          symbolSize: 8
        }]
      })
    }
  } catch (error) {
    console.error('加载访问趋势失败', error)
  }
}

// 页面自适应
const handleResize = () => {
  if (pieChart) pieChart.resize()
  if (lineChart) lineChart.resize()
}

onMounted(async () => {
  await Promise.all([
    loadStats(),
    loadHotExhibits(),
    loadCategoryStats(),
    loadVisitTrend()
  ])

  window.addEventListener('resize', handleResize)
})
</script>

<style scoped>
.statistics-container {
  padding: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 15px;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-icon {
  flex-shrink: 0;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-info {
  flex: 1;
  text-align: center;
}

.stat-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.chart-card {
  height: 400px;
}

.chart {
  width: 100%;
  height: 320px;
}

.rank-1 {
  color: #f56c6c;
  font-weight: bold;
}

.rank-2 {
  color: #e6a23c;
  font-weight: bold;
}

.rank-3 {
  color: #67c23a;
  font-weight: bold;
}
</style>