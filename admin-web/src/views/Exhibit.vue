<template>
  <div class="exhibit-container">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input
              v-model="searchForm.name"
              placeholder="展品名称"
              clearable
              @clear="handleSearch"
          />
        </el-col>
        <el-col :span="6">
          <el-select v-model="searchForm.category" placeholder="选择分类" clearable @change="handleSearch">
            <el-option label="陶瓷" value="陶瓷" />
            <el-option label="书画" value="书画" />
            <el-option label="青铜器" value="青铜器" />
            <el-option label="雕塑" value="雕塑" />
            <el-option label="服饰" value="服饰" />
            <el-option label="壁画" value="壁画" />
            <el-option label="文献" value="文献" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-col>
        <el-col :span="6" style="text-align: right">
          <el-button type="danger" @click="handleBatchDelete" :disabled="selectedIds.length === 0">
            批量删除
          </el-button>
          <el-button type="success" @click="handleAdd">新增展品</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 展品列表表格 -->
    <el-card class="table-card">
      <el-table :data="tableData" stripe v-loading="loading">
        <el-table-column type="selection" width="55" @selection-change="handleSelectionChange" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="展品名称" min-width="150" />
        <el-table-column prop="category" label="分类" width="100">
          <template #default="{ row }">
            <el-tag :type="getCategoryType(row.category)">{{ row.category }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="250" show-overflow-tooltip />
        <el-table-column prop="viewCount" label="浏览次数" width="100" sortable />
        <el-table-column prop="locationArea" label="位置" width="100" />
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="success" link @click="handleShowQr(row)">二维码</el-button>
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
        width="600px"
        @close="resetForm"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="展品名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入展品名称" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="form.category" placeholder="请选择分类">
            <el-option label="陶瓷" value="陶瓷" />
            <el-option label="书画" value="书画" />
            <el-option label="青铜器" value="青铜器" />
            <el-option label="雕塑" value="雕塑" />
            <el-option label="服饰" value="服饰" />
            <el-option label="壁画" value="壁画" />
            <el-option label="文献" value="文献" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input type="textarea" v-model="form.description" rows="4" placeholder="请输入展品描述" />
        </el-form-item>
        <el-form-item label="图片URL" prop="imageUrl">
          <el-input v-model="form.imageUrl" placeholder="请输入图片URL" />
        </el-form-item>
        <el-form-item label="语音URL" prop="audioUrl">
          <el-input v-model="form.audioUrl" placeholder="请输入语音讲解URL" />
        </el-form-item>
        <el-form-item label="所在楼层" prop="locationFloor">
          <el-input-number v-model="form.locationFloor" :min="1" :max="5" />
        </el-form-item>
        <el-form-item label="所在区域" prop="locationArea">
          <el-input v-model="form.locationArea" placeholder="如：A区、B区" />
        </el-form-item>
        <el-form-item label="位置X坐标" prop="positionX">
          <el-input-number v-model="form.positionX" :min="0" :max="1000" />
        </el-form-item>
        <el-form-item label="位置Y坐标" prop="positionY">
          <el-input-number v-model="form.positionY" :min="0" :max="1000" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitLoading">确定</el-button>
      </template>
    </el-dialog>

    <!-- 二维码弹窗 -->
    <el-dialog v-model="qrVisible" :title="`展品二维码 - ${qrName}`" width="380px" align-center>
      <div style="text-align:center;">
        <img v-if="qrUrl" :src="qrUrl" :alt="qrName" style="width:300px;height:300px;" />
        <p style="margin-top:12px;color:#666;font-size:13px;">
          内容：<code style="background:#f5f5f5;padding:2px 6px;border-radius:4px;">{{ qrUrl ? `(URL 形式，扫码后小程序解析跳转)` : '' }}</code>
        </p>
        <p style="color:#999;font-size:12px;margin:4px 0 16px;">下载后可打印张贴在展品旁</p>
        <el-button type="primary" @click="downloadQr">下载 PNG</el-button>
        <el-button @click="printQr">打印</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getExhibitList, addExhibit, updateExhibit, deleteExhibit } from '@/api/exhibit'

// 数据
const tableData = ref([])
const total = ref(0)
const loading = ref(false)

// 批量删除：存储选中的展品ID
const selectedIds = ref([])

// 处理表格多选框变化
const handleSelectionChange = (selection) => {
  selectedIds.value = selection.map(item => item.id)
}

// 批量删除
const handleBatchDelete = () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要删除的展品')
    return
  }

  ElMessageBox.confirm(`确定删除选中的 ${selectedIds.value.length} 个展品吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      // 逐个删除
      for (const id of selectedIds.value) {
        await deleteExhibit(id)
      }
      ElMessage.success('批量删除成功')
      // 清空选中
      selectedIds.value = []
      // 重新加载数据
      loadData()
    } catch (error) {
      ElMessage.error('批量删除失败')
    }
  }).catch(() => {})
}

// 搜索表单
const searchForm = reactive({
  name: '',
  category: ''
})

// 分页参数
const pageParams = reactive({
  pageNum: 1,
  pageSize: 10
})

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('新增展品')
const submitLoading = ref(false)
const formRef = ref(null)

// 表单数据
const form = reactive({
  id: null,
  name: '',
  category: '',
  description: '',
  imageUrl: '',
  audioUrl: '',
  locationFloor: 1,
  locationArea: '',
  positionX: 0,
  positionY: 0
})

// 表单验证规则
const rules = {
  name: [{ required: true, message: '请输入展品名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }]
}

// 获取分类标签样式
const getCategoryType = (category) => {
  const types = {
    '陶瓷': 'danger',
    '书画': 'primary',
    '青铜器': 'success',
    '雕塑': 'warning',
    '服饰': 'info',
    '壁画': 'danger',
    '文献': 'primary'
  }
  return types[category] || 'info'
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const res = await getExhibitList()
    if (res.code === 200) {
      let data = res.data || []

      // 搜索过滤
      if (searchForm.name) {
        data = data.filter(item => item.name.includes(searchForm.name))
      }
      if (searchForm.category) {
        data = data.filter(item => item.category === searchForm.category)
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
  searchForm.category = ''
  handleSearch()
}

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增展品'
  resetForm()
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  dialogTitle.value = '编辑展品'
  Object.assign(form, row)
  dialogVisible.value = true
}

// 二维码弹窗
const qrVisible = ref(false)
const qrUrl = ref('')
const qrName = ref('')
const handleShowQr = (row) => {
  qrName.value = row.name
  qrUrl.value = `/api/exhibit/${row.id}/qr-code?t=${Date.now()}`
  qrVisible.value = true
}

// 下载 PNG
const downloadQr = async () => {
  try {
    const res = await fetch(qrUrl.value)
    const blob = await res.blob()
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${qrName.value}_qrcode.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(a.href)
  } catch (e) {
    ElMessage.error('下载失败')
  }
}

// 打印
const printQr = () => {
  const w = window.open('', '_blank', 'width=400,height=500')
  if (!w) {
    ElMessage.warning('请允许弹出窗口以打印')
    return
  }
  w.document.write(`
    <html><head><title>${qrName.value}</title>
      <style>
        body { display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;font-family:sans-serif; }
        h2 { font-size:18px;margin:8px 0; }
        img { width:300px;height:300px; }
        p { color:#666;font-size:12px;margin:4px 0; }
      </style>
    </head><body>
      <h2>${qrName.value}</h2>
      <img src="${qrUrl.value}" />
      <p>智慧博物馆 · 扫码听讲解</p>
    </body></html>
  `)
  w.document.close()
  w.onload = () => { w.print(); }
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定删除展品"${row.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await deleteExhibit(row.id)
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

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    submitLoading.value = true
    try {
      let res
      if (form.id) {
        res = await updateExhibit(form)
      } else {
        res = await addExhibit(form)
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
  form.category = ''
  form.description = ''
  form.imageUrl = ''
  form.audioUrl = ''
  form.locationFloor = 1
  form.locationArea = ''
  form.positionX = 0
  form.positionY = 0
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
.exhibit-container {
  padding: 20px;
}
.search-card {
  margin-bottom: 20px;
}
.table-card {
  width: 100%;
}
</style>