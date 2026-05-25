<template>
  <div class="route-container">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input
              v-model="searchForm.name"
              placeholder="路线名称"
              clearable
              @clear="handleSearch"
          />
        </el-col>
        <el-col :span="6">
          <el-select v-model="searchForm.floor" placeholder="选择楼层" clearable @change="handleSearch">
            <el-option label="1楼" value="1" />
            <el-option label="2楼" value="2" />
            <el-option label="3楼" value="3" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-col>
        <el-col :span="6" style="text-align: right">
          <el-button type="success" @click="handleAdd">新增路线</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 路线列表表格 -->
    <el-card class="table-card">
      <el-table :data="tableData" stripe v-loading="loading">
        <el-table-column type="selection" width="55" @selection-change="handleSelectionChange" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="路线名称" min-width="150" />
        <el-table-column prop="floor" label="楼层" width="80">
          <template #default="{ row }">
            <el-tag>{{ row.floor }}楼</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="recommendTime" label="推荐时长(分钟)" width="130" />
        <el-table-column prop="description" label="路线描述" min-width="200" show-overflow-tooltip />
        <el-table-column label="途经展品" width="150">
          <template #default="{ row }">
            <el-button type="primary" link @click="showWaypoints(row)">查看展品</el-button>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
          v-model:current-page="pageParams.pageNum"
          v-model:page-size="pageParams.pageSize"
          :page-sizes="[10, 20, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadData"
          @current-change="loadData"
          style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
        :title="dialogTitle"
        v-model="dialogVisible"
        width="550px"
        @close="resetForm"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="路线名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入路线名称" />
        </el-form-item>
        <el-form-item label="所属楼层" prop="floor">
          <el-select v-model="form.floor" placeholder="请选择楼层">
            <el-option label="1楼" :value="1" />
            <el-option label="2楼" :value="2" />
            <el-option label="3楼" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="推荐时长(分钟)" prop="recommendTime">
          <el-input-number v-model="form.recommendTime" :min="10" :max="180" />
        </el-form-item>
        <el-form-item label="路线描述" prop="description">
          <el-input type="textarea" v-model="form.description" rows="3" placeholder="请输入路线描述" />
        </el-form-item>
        <el-form-item label="途经展品" prop="waypoints">
          <el-select
              v-model="selectedExhibits"
              multiple
              filterable
              placeholder="请选择途经展品"
              style="width: 100%"
          >
            <el-option
                v-for="item in exhibitList"
                :key="item.id"
                :label="`${item.name} (${item.category})`"
                :value="item.id"
            />
          </el-select>
          <div class="waypoint-tips">
            <el-tag
                v-for="id in selectedExhibits"
                :key="id"
                closable
                @close="removeExhibit(id)"
                style="margin: 5px 5px 0 0"
            >
              {{ getExhibitName(id) }}
            </el-tag>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitLoading">确定</el-button>
      </template>
    </el-dialog>

    <!-- 途经展品详情对话框 -->
    <el-dialog title="途经展品" v-model="waypointsVisible" width="500px">
      <el-table :data="currentWaypoints" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="展品名称" />
        <el-table-column prop="category" label="分类" />
      </el-table>
    </el-dialog>

    <!-- 批量删除按钮 -->
    <div class="batch-bar" v-if="selectedIds.length > 0">
      <el-button type="danger" @click="handleBatchDelete">
        批量删除 ({{ selectedIds.length }})
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getRouteList, addRoute, updateRoute, deleteRoute } from '@/api/route'
import { getExhibitList } from '@/api/exhibit'

// 数据
const tableData = ref([])
const exhibitList = ref([])
const total = ref(0)
const loading = ref(false)

// 搜索表单
const searchForm = reactive({
  name: '',
  floor: ''
})

// 分页参数
const pageParams = reactive({
  pageNum: 1,
  pageSize: 10
})

// 批量删除选中的ID
const selectedIds = ref([])

// 对话框
const dialogVisible = ref(false)
const waypointsVisible = ref(false)
const dialogTitle = ref('新增路线')
const submitLoading = ref(false)
const formRef = ref(null)

// 表单数据
const form = reactive({
  id: null,
  name: '',
  floor: 1,
  recommendTime: 30,
  description: '',
  waypoints: '[]'
})

const selectedExhibits = ref([])
const currentWaypoints = ref([])

// 表单验证规则
const rules = {
  name: [{ required: true, message: '请输入路线名称', trigger: 'blur' }],
  floor: [{ required: true, message: '请选择楼层', trigger: 'change' }],
  recommendTime: [{ required: true, message: '请输入推荐时长', trigger: 'blur' }]
}

// 处理多选框变化
const handleSelectionChange = (selection) => {
  selectedIds.value = selection.map(item => item.id)
}

// 获取展品名称
const getExhibitName = (id) => {
  const exhibit = exhibitList.value.find(e => e.id === id)
  return exhibit ? exhibit.name : '未知'
}

// 移除选中的展品
const removeExhibit = (id) => {
  const index = selectedExhibits.value.indexOf(id)
  if (index > -1) {
    selectedExhibits.value.splice(index, 1)
  }
}

// 显示途经展品
const showWaypoints = (row) => {
  try {
    const ids = JSON.parse(row.waypoints || '[]')
    currentWaypoints.value = exhibitList.value.filter(e => ids.includes(e.id))
    waypointsVisible.value = true
  } catch (e) {
    currentWaypoints.value = []
    waypointsVisible.value = true
  }
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    // 加载展品列表（用于选择途经展品）
    const exhibitRes = await getExhibitList()
    if (exhibitRes.code === 200) {
      exhibitList.value = exhibitRes.data || []
    }

    // 加载路线列表
    const routeRes = await getRouteList()
    if (routeRes.code === 200) {
      let data = routeRes.data || []

      // 搜索过滤
      if (searchForm.name) {
        data = data.filter(item => item.name.includes(searchForm.name))
      }
      if (searchForm.floor) {
        data = data.filter(item => item.floor === parseInt(searchForm.floor))
      }

      total.value = data.length

      // 分页
      const start = (pageParams.pageNum - 1) * pageParams.pageSize
      tableData.value = data.slice(start, start + pageParams.pageSize)
    }
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pageParams.pageNum = 1
  loadData()
}

// 重置搜索
const resetSearch = () => {
  searchForm.name = ''
  searchForm.floor = ''
  handleSearch()
}

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增路线'
  resetForm()
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  dialogTitle.value = '编辑路线'
  Object.assign(form, {
    id: row.id,
    name: row.name,
    floor: row.floor,
    recommendTime: row.recommendTime,
    description: row.description || '',
    waypoints: row.waypoints || '[]'
  })
  try {
    selectedExhibits.value = JSON.parse(form.waypoints || '[]')
  } catch (e) {
    selectedExhibits.value = []
  }
  dialogVisible.value = true
}

// 删除单个路线
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定删除路线"${row.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await deleteRoute(row.id)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        loadData()
      } else {
        ElMessage.error(res.message)
      }
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

// 批量删除
const handleBatchDelete = () => {
  ElMessageBox.confirm(`确定删除选中的 ${selectedIds.value.length} 个路线吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      for (const id of selectedIds.value) {
        await deleteRoute(id)
      }
      ElMessage.success('批量删除成功')
      selectedIds.value = []
      loadData()
    } catch (error) {
      ElMessage.error('批量删除失败')
    }
  }).catch(() => {})
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    // 保存途经展品
    form.waypoints = JSON.stringify(selectedExhibits.value)

    submitLoading.value = true
    try {
      let res
      if (form.id) {
        res = await updateRoute(form)
      } else {
        res = await addRoute(form)
      }

      if (res.code === 200) {
        ElMessage.success(form.id ? '更新成功' : '新增成功')
        dialogVisible.value = false
        loadData()
      } else {
        ElMessage.error(res.message)
      }
    } catch (error) {
      ElMessage.error('操作失败')
    } finally {
      submitLoading.value = false
    }
  })
}

// 重置表单
const resetForm = () => {
  form.id = null
  form.name = ''
  form.floor = 1
  form.recommendTime = 30
  form.description = ''
  form.waypoints = '[]'
  selectedExhibits.value = []
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// 页面加载时获取数据
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.route-container {
  padding: 20px;
}
.search-card {
  margin-bottom: 20px;
}
.table-card {
  width: 100%;
}
.batch-bar {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 100;
}
.waypoint-tips {
  margin-top: 10px;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  padding: 8px;
  min-height: 50px;
}
</style>