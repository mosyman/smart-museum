<template>
  <div class="behavior-container">
    <el-card>
      <div class="toolbar">
        <span>选择用户：</span>
        <el-select v-model="selectedUserId" placeholder="请选择" style="width:260px" filterable @change="onUserChange">
          <el-option
            v-for="u in users"
            :key="u.id"
            :label="`${u.nickname || u.username}（${u.role}）`"
            :value="u.id"
          />
        </el-select>
      </div>

      <el-tabs v-model="tab" v-if="selectedUserId">
        <el-tab-pane label="参观足迹" name="footprint">
          <el-table :data="footprint" v-loading="loadingFp" stripe>
            <el-table-column prop="exhibitId" label="展品ID" width="100" />
            <el-table-column prop="exhibitName" label="展品名称" min-width="180" />
            <el-table-column prop="category" label="分类" width="100" />
            <el-table-column prop="visitCount" label="参观次数" width="100" />
            <el-table-column prop="lastVisitTime" label="最近参观" width="200" />
            <el-table-column prop="totalDuration" label="累计停留(秒)" width="140" />
          </el-table>
          <el-empty v-if="!loadingFp && footprint.length === 0" description="该用户暂无参观记录" />
        </el-tab-pane>

        <el-tab-pane label="收藏" name="favorite">
          <el-table :data="favorites" v-loading="loadingFav" stripe>
            <el-table-column prop="exhibitId" label="展品ID" width="100" />
            <el-table-column prop="exhibitName" label="展品名称" min-width="180" />
            <el-table-column prop="category" label="分类" width="120" />
          </el-table>
          <el-empty v-if="!loadingFav && favorites.length === 0" description="该用户暂无收藏" />
        </el-tab-pane>
      </el-tabs>

      <el-empty v-else description="请先选择用户" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getUserList } from '@/api/user'
import { getUserFootprint } from '@/api/visit'
import { getUserFavorites } from '@/api/favorite'

const users = ref([])
const selectedUserId = ref(null)
const tab = ref('footprint')

const footprint = ref([])
const favorites = ref([])
const loadingFp = ref(false)
const loadingFav = ref(false)

const loadUsers = async () => {
  try {
    const res = await getUserList()
    if (res.code === 200) users.value = res.data || []
  } catch (e) {
    ElMessage.error('加载用户失败')
  }
}

const onUserChange = async (id) => {
  if (!id) return
  loadingFp.value = true
  loadingFav.value = true
  try {
    const [fp, fav] = await Promise.all([
      getUserFootprint(id),
      getUserFavorites(id)
    ])
    footprint.value = fp.code === 200 ? (fp.data || []) : []
    favorites.value = fav.code === 200 ? (fav.data || []) : []
  } catch (e) {
    ElMessage.error('加载数据失败')
  } finally {
    loadingFp.value = false
    loadingFav.value = false
  }
}

onMounted(loadUsers)
</script>

<style scoped>
.behavior-container { padding: 20px; }
.toolbar { display:flex; align-items:center; gap:10px; margin-bottom:20px; }
</style>
