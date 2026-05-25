<template>
  <el-container class="layout-container">
    <el-aside width="220px" class="aside">
      <div class="logo">
        <h2>智慧博物馆</h2>
      </div>
      <el-menu
          :default-active="activeMenu"
          router
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataBoard /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>
        <el-menu-item index="/exhibit">
          <el-icon><Collection /></el-icon>
          <span>展品管理</span>
        </el-menu-item>
        <el-menu-item index="/user">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item index="/route">
          <el-icon><MapLocation /></el-icon>
          <span>路线管理</span>
        </el-menu-item>
        <el-menu-item index="/statistics">
          <el-icon><DataAnalysis /></el-icon>
          <span>数据统计</span>
        </el-menu-item>
        <el-menu-item index="/behavior">
          <el-icon><View /></el-icon>
          <span>用户行为</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="header-right">
          <span class="username">{{ userInfo?.nickname || userInfo?.username }}</span>
          <el-button type="danger" text @click="handleLogout">退出</el-button>
        </div>
      </el-header>
      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { DataBoard, Collection, User, MapLocation, DataAnalysis, View } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const activeMenu = computed(() => route.path)

const userInfo = ref(null)

onMounted(() => {
  const user = localStorage.getItem('user')
  if (user) {
    userInfo.value = JSON.parse(user)
  }
})

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  ElMessage.success('已退出登录')
  router.push('/login')
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}
.aside {
  background-color: #304156;
}
.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background-color: #2b3a4a;
}
.logo h2 {
  font-size: 18px;
}
.header {
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}
.username {
  color: #333;
}
.main {
  background-color: #f0f2f5;
  padding: 20px;
}
</style>