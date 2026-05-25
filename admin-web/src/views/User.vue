<template>
  <div class="user-container">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input
              v-model="searchForm.username"
              placeholder="用户名"
              clearable
              @clear="handleSearch"
          />
        </el-col>
        <el-col :span="6">
          <el-select v-model="searchForm.role" placeholder="选择角色" clearable @change="handleSearch">
            <el-option label="管理员" value="admin" />
            <el-option label="普通用户" value="tourist" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-col>
        <el-col :span="6" style="text-align: right">
          <el-button type="success" @click="handleAdd">新增用户</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 用户列表表格 -->
    <el-card class="table-card">
      <el-table :data="tableData" stripe v-loading="loading">
        <el-table-column type="selection" width="55" @selection-change="handleSelectionChange" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column prop="nickname" label="昵称" min-width="120" />
        <el-table-column prop="role" label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="row.role === 'admin' ? 'danger' : 'primary'">
              {{ row.role === 'admin' ? '管理员' : '普通用户' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="createTime" label="注册时间" width="180" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button
                type="danger"
                link
                @click="handleDelete(row)"
                :disabled="row.username === 'admin'"
            >
              删除
            </el-button>
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
        width="500px"
        @close="resetForm"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" :disabled="!!form.id" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!form.id">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="form.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-radio-group v-model="form.role">
            <el-radio label="tourist">普通用户</el-radio>
            <el-radio label="admin">管理员</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitLoading">确定</el-button>
      </template>
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
import { getUserList, deleteUser, adminCreateUser, updateUser } from '@/api/user'

// 数据
const tableData = ref([])
const total = ref(0)
const loading = ref(false)

// 搜索表单
const searchForm = reactive({
  username: '',
  role: ''
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
const dialogTitle = ref('新增用户')
const submitLoading = ref(false)
const formRef = ref(null)

// 表单数据
const form = reactive({
  id: null,
  username: '',
  password: '',
  nickname: '',
  role: 'tourist',
  phone: ''
})

// 表单验证规则
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur', min: 6 }],
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }]
}

// 处理多选框变化
const handleSelectionChange = (selection) => {
  selectedIds.value = selection.map(item => item.id)
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const res = await getUserList()
    if (res.code === 200) {
      let data = res.data || []

      // 搜索过滤
      if (searchForm.username) {
        data = data.filter(item => item.username.includes(searchForm.username))
      }
      if (searchForm.role) {
        data = data.filter(item => item.role === searchForm.role)
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
  searchForm.username = ''
  searchForm.role = ''
  handleSearch()
}

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增用户'
  resetForm()
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  dialogTitle.value = '编辑用户'
  Object.assign(form, {
    id: row.id,
    username: row.username,
    nickname: row.nickname,
    role: row.role,
    phone: row.phone || '',
    password: ''
  })
  dialogVisible.value = true
}

// 删除单个用户
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定删除用户"${row.username}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await deleteUser(row.id)
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
  ElMessageBox.confirm(`确定删除选中的 ${selectedIds.value.length} 个用户吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      for (const id of selectedIds.value) {
        await deleteUser(id)
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

    submitLoading.value = true
    try {
      let res
      if (form.id) {
        // 编辑
        const updateData = {
          id: form.id,
          username: form.username,
          nickname: form.nickname,
          role: form.role,
          phone: form.phone
        }
        res = await updateUser(updateData)
      } else {
        // 新增（走 admin 接口，可创建任意角色）
        res = await adminCreateUser({
          username: form.username,
          password: form.password,
          nickname: form.nickname,
          role: form.role,
          phone: form.phone
        })
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
  form.username = ''
  form.password = ''
  form.nickname = ''
  form.role = 'tourist'
  form.phone = ''
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
.user-container {
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
</style>