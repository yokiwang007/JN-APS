<template>
  <div class="workpiece-bill-list">
    <!-- 搜索区域 -->
    <div class="search-area">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="订单号">
          <el-input v-model="searchForm.orderId" placeholder="请输入订单号" clearable style="width: 180px" />
        </el-form-item>

        <el-form-item label="销售组织">
          <el-select v-model="searchForm.organization" placeholder="请选择" clearable style="width: 150px">
            <el-option label="杰诺销售公司" value="杰诺销售公司" />
            <el-option label="杰诺智造中心" value="杰诺智造中心" />
          </el-select>
        </el-form-item>

        <el-form-item label="订单类型">
          <el-select v-model="searchForm.orderType" placeholder="请选择" clearable style="width: 120px">
            <el-option label="标准订单" value="标准订单" />
            <el-option label="加急订单" value="加急订单" />
            <el-option label="补件订单" value="补件订单" />
          </el-select>
        </el-form-item>

        <el-form-item label="客户名称">
          <el-input v-model="searchForm.customerName" placeholder="请输入客户名称" clearable style="width: 180px" />
        </el-form-item>

        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 120px">
            <el-option label="待处理" value="待处理" />
            <el-option label="已处理" value="已处理" />
            <el-option label="已完成" value="已完成" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 操作区域 -->
    <div class="table-area">
      <div class="table-toolbar">
        <el-button type="success" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          新增工件清单
        </el-button>
      </div>

      <!-- 表格 -->
      <el-table
        :data="billList"
        v-loading="loading"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="billNo" label="单据号" width="150" />

        <el-table-column prop="orderId" label="订单号" width="150" />

        <el-table-column prop="organization" label="销售组织" width="120" />

        <el-table-column prop="orderType" label="订单类型" width="120">
          <template #default="{ row }">
            <span :style="{ color: getOrderTypeColor(row.orderType) }">{{ row.orderType || '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="customerName" label="客户名称" width="120" />

        <el-table-column prop="productName" label="产品名称" width="120" />

        <el-table-column prop="splitter" label="拆单人" width="100" />

        <el-table-column prop="splitDate" label="拆单日期" width="120" />

        <el-table-column prop="workpieceCount" label="工件数量" width="100">
          <template #default="{ row }">
            {{ row.workpieceCount || 0 }} 件
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleViewDetail(row)">
              <el-icon><View /></el-icon>
              详情
            </el-button>
            <el-button type="success" link @click="handleEdit(row)" v-if="row.status === '待处理'">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="danger" link @click="handleDelete(row)" v-if="row.status === '待处理'">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </div>

    <!-- 新增/编辑工件清单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEditMode ? '编辑工件清单' : '新增工件清单'"
      width="1200px"
      :close-on-click-modal="false"
    >
      <el-form :model="billForm" label-width="100px">
        <!-- 表头信息 -->
        <el-divider content-position="left">表头信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="订单号">
              <el-select v-model="billForm.orderId" placeholder="请选择订单" style="width: 100%" :disabled="isEditMode" filterable @change="handleOrderChange">
                <el-option
                  v-for="order in orderList"
                  :key="order.orderId"
                  :label="`${order.orderId} - ${order.customerName}`"
                  :value="order.orderId"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="销售组织">
              <el-input v-model="billForm.organization" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="订单类型">
              <el-input v-model="billForm.orderType" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="客户名称">
              <el-input v-model="billForm.customerName" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="产品名称">
              <el-input v-model="billForm.productName" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="承诺交期">
              <el-input v-model="billForm.dueDate" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="拆单人">
              <el-input v-model="billForm.splitter" placeholder="请输入拆单人" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="拆单日期">
              <el-date-picker
                v-model="billForm.splitDate"
                type="date"
                placeholder="选择拆单日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input
                v-model="billForm.remark"
                type="textarea"
                :rows="2"
                placeholder="请输入备注信息"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 表体信息 -->
        <el-divider content-position="left">工件明细</el-divider>
        <el-button type="primary" @click="handleAddDetail" style="margin-bottom: 10px">
          <el-icon><Plus /></el-icon>
          添加工件
        </el-button>
        <el-table :data="billForm.details" border stripe max-height="400">
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="panelNo" label="工件号" width="120">
            <template #default="{ row, $index }">
              <el-input v-model="row.panelNo" placeholder="请输入工件号" size="small" />
            </template>
          </el-table-column>
          <el-table-column prop="panelName" label="工件名称" width="150">
            <template #default="{ row }">
              <el-input v-model="row.panelName" placeholder="请输入工件名称" size="small" />
            </template>
          </el-table-column>
          <el-table-column prop="panelType" label="部件类型" width="120">
            <template #default="{ row }">
              <el-select v-model="row.panelType" placeholder="请选择" size="small" style="width: 100%">
                <el-option label="柜体板" value="柜体板" />
                <el-option label="门板" value="门板" />
                <el-option label="背板" value="背板" />
                <el-option label="装饰条" value="装饰条" />
                <el-option label="铰链" value="铰链" />
                <el-option label="滑轨" value="滑轨" />
                <el-option label="拉手" value="拉手" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column prop="itemType" label="工件类型" width="100">
            <template #default="{ row }">
              <el-select v-model="row.itemType" placeholder="请选择" size="small" style="width: 100%">
                <el-option label="板件" value="板件" />
                <el-option label="五金" value="五金" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column prop="length" label="长度(mm)" width="120">
            <template #default="{ row }">
              <el-input-number v-model="row.length" :min="0" :precision="2" size="small" style="width: 100%" placeholder="长度" @change="calculateArea(row)" />
            </template>
          </el-table-column>
          <el-table-column prop="width" label="宽度(mm)" width="120">
            <template #default="{ row }">
              <el-input-number v-model="row.width" :min="0" :precision="2" size="small" style="width: 100%" placeholder="宽度" @change="calculateArea(row)" />
            </template>
          </el-table-column>
          <el-table-column prop="thickness" label="厚度(mm)" width="120">
            <template #default="{ row }">
              <el-input-number v-model="row.thickness" :min="0" :precision="2" size="small" style="width: 100%" placeholder="厚度" />
            </template>
          </el-table-column>
          <el-table-column prop="color" label="花色" width="100">
            <template #default="{ row }">
              <el-input v-model="row.color" placeholder="花色" size="small" />
            </template>
          </el-table-column>
          <el-table-column prop="material" label="材质/规格" width="120">
            <template #default="{ row }">
              <el-input v-model="row.material" placeholder="材质" size="small" />
            </template>
          </el-table-column>
          <el-table-column prop="edgeRequirement" label="封边要求" width="120">
            <template #default="{ row }">
              <el-input v-model="row.edgeRequirement" placeholder="封边" size="small" />
            </template>
          </el-table-column>
          <el-table-column prop="area" label="面积(m²)" width="110">
            <template #default="{ row }">
              <el-input-number v-model="row.area" :min="0" :precision="4" size="small" style="width: 100%" placeholder="面积" disabled />
            </template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" width="100">
            <template #default="{ row }">
              <el-input-number :model-value="row.quantity || 1" @update:model-value="row.quantity = $event" :min="1" size="small" style="width: 100%" />
            </template>
          </el-table-column>
          <el-table-column label="工艺路径" width="200">
            <template #default="{ row }">
              <el-select v-model="row.processRoute" multiple placeholder="选择工艺" size="small" style="width: 100%">
                <el-option label="开料" value="开料" />
                <el-option label="封边" value="封边" />
                <el-option label="钻孔" value="钻孔" />
                <el-option label="分拣" value="分拣" />
                <el-option label="包装" value="包装" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80" fixed="right">
            <template #default="{ $index }">
              <el-button type="danger" link @click="handleRemoveDetail($index)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="工件清单详情"
      width="1400px"
    >
      <div v-if="currentBill">
        <!-- 表头信息 -->
        <el-descriptions :column="3" border>
          <el-descriptions-item label="单据号">{{ currentBill.billNo }}</el-descriptions-item>
          <el-descriptions-item label="订单号">{{ currentBill.orderId }}</el-descriptions-item>
          <el-descriptions-item label="销售组织">{{ currentBill.organization }}</el-descriptions-item>
          <el-descriptions-item label="订单类型">{{ currentBill.orderType }}</el-descriptions-item>
          <el-descriptions-item label="客户名称">{{ currentBill.customerName }}</el-descriptions-item>
          <el-descriptions-item label="产品名称">{{ currentBill.productName }}</el-descriptions-item>
          <el-descriptions-item label="订单日期">{{ currentBill.orderDate }}</el-descriptions-item>
          <el-descriptions-item label="承诺交期">{{ currentBill.dueDate }}</el-descriptions-item>
          <el-descriptions-item label="拆单日期">{{ currentBill.splitDate }}</el-descriptions-item>
          <el-descriptions-item label="拆单人">{{ currentBill.splitter }}</el-descriptions-item>
          <el-descriptions-item label="工件数量">{{ currentBill.workpieceCount }} 件</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentBill.status)">{{ currentBill.status }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="备注" :span="3">{{ currentBill.remark || '-' }}</el-descriptions-item>
        </el-descriptions>

        <!-- 工件明细 -->
        <el-divider content-position="left">工件明细 ({{ currentBill.details?.length || 0 }} 件)</el-divider>
        
        <!-- 视图切换 -->
        <el-radio-group v-model="detailDisplayMode" style="margin-bottom: 16px">
          <el-radio-button value="list">列表视图</el-radio-button>
          <el-radio-button value="group">分组视图</el-radio-button>
        </el-radio-group>

        <!-- 列表视图 -->
        <el-table v-if="detailDisplayMode === 'list'" :data="currentBill.details" stripe max-height="400">
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="panelNo" label="工件号" width="150" />
          <el-table-column prop="panelName" label="工件名称" width="150" />
          <el-table-column prop="panelType" label="部件类型" width="100" />
          <el-table-column prop="itemType" label="工件类型" width="90">
            <template #default="{ row }">
              <el-tag :type="row.itemType === '板件' ? 'primary' : 'success'" size="small">
                {{ row.itemType }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="尺寸" width="150">
            <template #default="{ row }">
              {{ row.length && row.width ? `${row.length} × ${row.width} mm` : '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="thickness" label="厚度(mm)" width="100">
            <template #default="{ row }">
              {{ row.thickness || '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="color" label="花色" width="100" />
          <el-table-column prop="material" label="材质/规格" width="120" />
          <el-table-column prop="edgeRequirement" label="封边要求" width="120" />
          <el-table-column prop="area" label="面积(m²)" width="100">
            <template #default="{ row }">
              {{ row.area || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="数量" width="80">
            <template #default="{ row }">
              {{ row.quantity || 1 }}
            </template>
          </el-table-column>
          <el-table-column label="工艺路径">
            <template #default="{ row }">
              {{ row.processRoute?.join(' → ') || '-' }}
            </template>
          </el-table-column>
        </el-table>

        <!-- 分组视图 -->
        <div v-if="detailDisplayMode === 'group'" style="max-height: 400px; overflow-y: auto">
          <el-collapse v-model="expandedGroups">
            <el-collapse-item
              v-for="(group, index) in groupedDetails"
              :key="index"
              :name="index"
            >
              <template #title>
                <div style="display: flex; align-items: center; width: 100%; flex-wrap: wrap">
                  <el-tag :type="group.itemType === '板件' ? 'primary' : 'success'" style="margin-right: 8px">
                    {{ group.itemType }}
                  </el-tag>
                  <span style="font-weight: 500; margin-right: 16px">
                    {{ group.panelType }}
                  </span>
                  <span v-if="group.color" style="color: #909399; margin-right: 16px">
                    {{ group.color }}
                  </span>
                  <span v-if="group.thickness" style="color: #909399; margin-right: 16px">
                    {{ group.thickness }}mm
                  </span>
                  <el-divider direction="vertical" />
                  <span style="color: #409eff; margin-right: 16px">
                    数量: {{ group.count }} 件
                  </span>
                  <span v-if="group.totalArea" style="color: #67c23a; margin-right: 16px">
                    面积: {{ group.totalArea }} m²
                  </span>
                  <template v-if="group.processRoutes && group.processRoutes.length > 0">
                    <el-divider direction="vertical" />
                    <span style="color: #909399; margin-right: 8px">工艺路径:</span>
                    <el-tag
                      v-for="(route, routeIndex) in group.processRoutes"
                      :key="routeIndex"
                      size="small"
                      type="info"
                      style="margin-right: 4px"
                    >
                      {{ route }}
                    </el-tag>
                  </template>
                </div>
              </template>
              
              <!-- 分组明细 -->
              <el-table :data="group.items" stripe size="small">
                <el-table-column prop="panelNo" label="工件号" width="150" />
                <el-table-column prop="panelName" label="工件名称" width="150" />
                <el-table-column label="尺寸" width="120">
                  <template #default="{ row }">
                    {{ row.length && row.width ? `${row.length} × ${row.width} mm` : '-' }}
                  </template>
                </el-table-column>
                <el-table-column prop="thickness" label="厚度" width="80">
                  <template #default="{ row }">
                    {{ row.thickness || '-' }}
                  </template>
                </el-table-column>
                <el-table-column prop="color" label="花色" width="100">
                  <template #default="{ row }">
                    {{ row.color || '-' }}
                  </template>
                </el-table-column>
                <el-table-column prop="material" label="材质/规格" width="150" />
                <el-table-column prop="edgeRequirement" label="封边要求" width="120">
                  <template #default="{ row }">
                    {{ row.edgeRequirement || '-' }}
                  </template>
                </el-table-column>
                <el-table-column prop="area" label="面积(m²)" width="100">
                  <template #default="{ row }">
                    {{ row.area || '-' }}
                  </template>
                </el-table-column>
                <el-table-column prop="quantity" label="数量" width="80">
                  <template #default="{ row }">
                    {{ row.quantity || 1 }}
                  </template>
                </el-table-column>
                <el-table-column label="工艺路径">
                  <template #default="{ row }">
                    {{ row.processRoute?.join(' → ') || '-' }}
                  </template>
                </el-table-column>
              </el-table>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, View, Edit, Delete } from '@element-plus/icons-vue'
import axios from 'axios'
import { API_BASE_URL, isMockMode } from '../../utils/config'
import { readMockStore } from '../../utils/api'

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

const loading = ref(false)
const billList = ref([])
const orderList = ref([])
const dialogVisible = ref(false)
const detailDialogVisible = ref(false)
const detailDisplayMode = ref('list') // 详情显示模式：list-列表，group-分组
const expandedGroups = ref([]) // 展开的分组
const isEditMode = ref(false)
const currentBill = ref(null)

const searchForm = ref({
  orderId: '',
  organization: '',
  orderType: '',
  customerName: '',
  status: ''
})

const pagination = ref({
  page: 1,
  pageSize: 20,
  total: 0
})

const billForm = ref({
  billNo: '',
  orderId: '',
  organization: '',
  orderType: '',
  customerName: '',
  orderDate: '',
  dueDate: '',
  productName: '',
  splitter: '系统',
  splitDate: '',
  remark: '',
  details: []
})

// 获取订单类型颜色
const getOrderTypeColor = (orderType) => {
  const colors = {
    '标准订单': '#409EFF',
    '加急订单': '#E6A23C',
    '补件订单': '#F56C6C'
  }
  return colors[orderType] || '#909399'
}

// 获取状态类型
const getStatusType = (status) => {
  const types = {
    '待处理': 'info',
    '已处理': 'warning',
    '已完成': 'success'
  }
  return types[status] || 'info'
}

// 搜索
const handleSearch = () => {
  pagination.value.page = 1
  fetchBills()
}

// 重置
const handleReset = () => {
  searchForm.value = {
    orderId: '',
    organization: '',
    orderType: '',
    customerName: '',
    status: ''
  }
  handleSearch()
}

// 分页
const handleSizeChange = (size) => {
  pagination.value.pageSize = size
  fetchBills()
}

const handleCurrentChange = (page) => {
  pagination.value.page = page
  fetchBills()
}

// 获取工件清单列表
const fetchBills = async () => {
  try {
    loading.value = true

    if (isMockMode()) {
      // 模拟数据模式：从订单和工件数据中获取
      const mockStore = readMockStore()
      const orders = mockStore.orders || []
      const panels = mockStore.panels || []

      // 为每个订单生成工件清单
      const workpieceBills = orders.map(order => {
        // 获取该订单的所有工件
        const orderPanels = panels.filter(p => p.orderNo === order.orderNo)

        return {
          billNo: `WB${order.orderNo.slice(-6)}`,
          orderId: order.orderNo,
          organization: order.organization || '杰诺销售公司',
          orderType: order.orderType || '标准订单',
          customerName: order.customerName,
          orderDate: order.createdAt ? order.createdAt.split('T')[0] : '',
          dueDate: order.deliveryDate,
          productName: order.productType || '',
          splitter: '系统',
          splitDate: order.createdAt ? order.createdAt.split('T')[0] : '',
          workpieceCount: orderPanels.length,
          status: '待处理',
          remark: '',
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          details: orderPanels
        }
      })

      billList.value = workpieceBills
      pagination.value.total = workpieceBills.length
    } else {
      // 真实API模式
      const params = {
        ...searchForm.value,
        page: pagination.value.page,
        pageSize: pagination.value.pageSize
      }
      const response = await apiClient.get('/api/v2/workpiece-bills', { params })

      if (response.data.success) {
        billList.value = response.data.data.list
        pagination.value.total = response.data.data.total
      }
    }
  } catch (error) {
    ElMessage.error('获取工件清单列表失败')
  } finally {
    loading.value = false
  }
}

// 获取订单列表
const fetchOrders = async () => {
  try {
    const response = await apiClient.get('/api/v2/erp-orders', {
      params: { page: 1, pageSize: 1000 }
    })

    if (response.data.success) {
      orderList.value = response.data.data.list || []
    }
  } catch (error) {
    console.error('获取订单列表失败', error)
  }
}

// 订单变化
const handleOrderChange = async (orderId) => {
  const order = orderList.value.find(o => o.orderId === orderId)
  if (order) {
    billForm.value.organization = order.organization
    billForm.value.orderType = order.orderType
    billForm.value.customerName = order.customerName
    billForm.value.orderDate = order.createdAt ? order.createdAt.split('T')[0] : ''
    billForm.value.dueDate = order.deliveryDate
    billForm.value.productName = order.productType
  }
}

// 新增
const handleCreate = () => {
  isEditMode.value = false
  billForm.value = {
    billNo: '',
    orderId: '',
    organization: '',
    orderType: '',
    customerName: '',
    orderDate: '',
    dueDate: '',
    productName: '',
    splitter: '系统',
    splitDate: new Date().toISOString().split('T')[0],
    remark: '',
    details: []
  }
  dialogVisible.value = true
}

// 编辑
const handleEdit = async (row) => {
  try {
    if (isMockMode()) {
      // 模拟数据模式：直接使用row中的数据
      isEditMode.value = true
      currentBill.value = row
      billForm.value = { ...row, details: row.details || [] }
      dialogVisible.value = true
    } else {
      // 真实API模式：从后端获取完整数据（包括表体明细）
      const response = await apiClient.get(`/api/v2/workpiece-bills/${row.billNo}`)
      if (response.data.success) {
        isEditMode.value = true
        currentBill.value = response.data.data
        billForm.value = { ...response.data.data, details: response.data.data.details || [] }
        dialogVisible.value = true
      }
    }
  } catch (error) {
    ElMessage.error('获取工件清单详情失败')
  }
}

// 查看详情
const handleViewDetail = async (row) => {
  try {
    if (isMockMode()) {
      // 模拟数据模式：直接使用row中的数据
      currentBill.value = row
      detailDialogVisible.value = true
    } else {
      // 真实API模式
      const response = await apiClient.get(`/api/v2/workpiece-bills/${row.billNo}`)
      if (response.data.success) {
        currentBill.value = response.data.data
        detailDialogVisible.value = true
      }
    }
  } catch (error) {
    ElMessage.error('获取详情失败')
  }
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除工件清单"${row.billNo}"吗？此操作不可恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const response = await apiClient.delete(`/api/v2/workpiece-bills/${row.billNo}`)
    if (response.data.success) {
      ElMessage.success('删除成功')
      fetchBills()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 添加明细
const handleAddDetail = () => {
  billForm.value.details.push({
    panelNo: '',
    panelName: '',
    panelType: '',
    itemType: '板件',
    length: null,
    width: null,
    thickness: null,
    color: '',
    material: '',
    edgeRequirement: '',
    area: null,
    quantity: 1,
    processRoute: []
  })
}

// 删除明细
const handleRemoveDetail = (index) => {
  billForm.value.details.splice(index, 1)
}

// 计算面积
const calculateArea = (row) => {
  if (row.length && row.width) {
    // 面积 = 长度 × 宽度，转换为平方米
    row.area = (row.length * row.width / 1000000).toFixed(4)
  } else {
    row.area = 0
  }
}

// 分组工件明细
const groupedDetails = computed(() => {
  if (!currentBill.value || !currentBill.value.details) {
    return []
  }

  const groups = {}

  currentBill.value.details.forEach(detail => {
    // 分组键: 部件类型+花色+厚度
    const key = `${detail.panelType}_${detail.color || 'none'}_${detail.thickness || 'none'}`

    if (!groups[key]) {
      groups[key] = {
        panelType: detail.panelType,
        color: detail.color,
        thickness: detail.thickness,
        itemType: detail.itemType,
        items: [],
        count: 0,
        totalArea: 0,
        processRoutes: new Set()
      }
    }

    groups[key].items.push(detail)
    groups[key].count += (detail.quantity || 1)

    // 只计算板件的面积
    if (detail.itemType === '板件' && detail.area) {
      groups[key].totalArea += parseFloat(detail.area) * (detail.quantity || 1)
    }

    // 收集工艺路径
    if (detail.processRoute && detail.processRoute.length > 0) {
      detail.processRoute.forEach(route => groups[key].processRoutes.add(route))
    }
  })

  // 转换为数组,排序并格式化数据
  const groupArray = Object.values(groups).map(group => ({
    ...group,
    processRoutes: Array.from(group.processRoutes),
    totalArea: group.totalArea > 0 ? group.totalArea.toFixed(4) : ''
  }))

  // 按部件类型、花色、厚度排序
  groupArray.sort((a, b) => {
    // 先按部件类型排序
    if (a.panelType !== b.panelType) {
      return a.panelType.localeCompare(b.panelType)
    }
    // 再按花色排序
    if (a.color !== b.color) {
      return (a.color || '').localeCompare(b.color || '')
    }
    // 最后按厚度排序
    return (a.thickness || 0) - (b.thickness || 0)
  })

  return groupArray
})

// 保存
const handleSave = async () => {
  try {
    if (!billForm.value.orderId) {
      ElMessage.warning('请选择订单')
      return
    }

    if (!billForm.value.details || billForm.value.details.length === 0) {
      ElMessage.warning('请添加工件明细')
      return
    }

    let response
    if (isEditMode.value) {
      response = await apiClient.put(`/api/v2/workpiece-bills/${billForm.value.billNo}`, billForm.value)
    } else {
      response = await apiClient.post('/api/v2/workpiece-bills', billForm.value)
    }

    if (response.data.success) {
      ElMessage.success(isEditMode.value ? '更新成功' : '创建成功')
      dialogVisible.value = false
      fetchBills()
    }
  } catch (error) {
    ElMessage.error(isEditMode.value ? '更新失败' : '创建失败')
  }
}

onMounted(() => {
  fetchBills()
  fetchOrders()
})
</script>

<style scoped>
.workpiece-bill-list {
  height: 100%;
}

.search-area {
  background: #fff;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 4px;
}

.table-area {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
}

.table-toolbar {
  margin-bottom: 20px;
}
</style>
