<template>
  <div class="work-calendar">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>工作日历管理</span>
          <el-button-group>
            <el-button @click="prevYear">
              <el-icon><ArrowLeft /></el-icon>
            </el-button>
            <el-button>{{ currentYear }}年</el-button>
            <el-button @click="nextYear">
              <el-icon><ArrowRight /></el-icon>
            </el-button>
          </el-button-group>
        </div>
      </template>
      
      <el-calendar v-model="selectedDate">
        <template #date-cell="{ data }">
          <div class="calendar-cell" :class="getDayClass(data.day)">
            <div class="day-number">{{ data.day.split('-')[2] }}</div>
            <div v-if="isHoliday(data.day)" class="day-type holiday">休</div>
            <div v-else-if="isWorkday(data.day)" class="day-type workday">工</div>
          </div>
        </template>
      </el-calendar>
    </el-card>
    
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <span>节假日设置</span>
          </template>
          
          <el-form label-width="100px">
            <el-form-item label="选择日期">
              <el-date-picker
                v-model="holidayDate"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
              />
            </el-form-item>
            
            <el-form-item label="节日名称">
              <el-input v-model="holidayName" placeholder="如: 春节、国庆节" />
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="addHoliday">添加节假日</el-button>
            </el-form-item>
          </el-form>
          
          <el-divider />
          
          <el-table :data="holidays" stripe max-height="300">
            <el-table-column prop="date" label="日期" width="120" />
            <el-table-column prop="name" label="节日名称" />
            <el-table-column label="操作" width="100">
              <template #default="{ row }">
                <el-button type="danger" link @click="removeHoliday(row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <span>班次配置</span>
          </template>
          
          <el-table :data="shifts" stripe>
            <el-table-column prop="name" label="班次名称" width="120" />
            <el-table-column prop="time" label="时间段" width="180" />
            <el-table-column prop="workers" label="人数" width="80" />
            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <el-button type="primary" link @click="editShift(row)">编辑</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'

const currentYear = ref(2026)
const selectedDate = ref(new Date())
const holidayDate = ref(null)
const holidayName = ref('')

const holidays = ref([
  { date: '2026-01-01', name: '元旦' },
  { date: '2026-02-10', name: '春节' },
  { date: '2026-05-01', name: '劳动节' },
  { date: '2026-10-01', name: '国庆节' }
])

const shifts = ref([
  { name: '白班', time: '08:00 - 17:00', workers: 20 },
  { name: '晚班', time: '17:00 - 02:00', workers: 15 },
  { name: '夜班', time: '02:00 - 08:00', workers: 10 }
])

// 获取日期类型
const getDayClass = (day) => {
  if (isHoliday(day)) return 'holiday-cell'
  if (isWorkday(day)) return 'workday-cell'
  return ''
}

// 判断是否节假日
const isHoliday = (day) => {
  return holidays.value.some(h => h.date === day)
}

// 判断是否工作日
const isWorkday = (day) => {
  const date = new Date(day)
  const dayOfWeek = date.getDay()
  return dayOfWeek !== 0 && dayOfWeek !== 6 && !isHoliday(day)
}

// 上一年
const prevYear = () => {
  currentYear.value--
}

// 下一年
const nextYear = () => {
  currentYear.value++
}

// 添加节假日
const addHoliday = () => {
  if (!holidayDate.value || !holidayName.value) {
    ElMessage.warning('请选择日期并输入节日名称')
    return
  }
  
  const dateStr = holidayDate.value.toISOString().split('T')[0]
  holidays.value.push({
    date: dateStr,
    name: holidayName.value
  })
  
  holidayDate.value = null
  holidayName.value = ''
  ElMessage.success('添加成功')
}

// 删除节假日
const removeHoliday = (holiday) => {
  const index = holidays.value.indexOf(holiday)
  holidays.value.splice(index, 1)
  ElMessage.success('删除成功')
}

// 编辑班次
const editShift = (shift) => {
  ElMessage.info('班次编辑功能开发中')
}
</script>

<style scoped>
.work-calendar {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.calendar-cell {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.day-number {
  font-size: 14px;
}

.day-type {
  font-size: 10px;
  margin-top: 2px;
  padding: 1px 4px;
  border-radius: 2px;
}

.holiday {
  background: #fef0f0;
  color: #f56c6c;
}

.workday {
  background: #f0f9ff;
  color: #409eff;
}

.holiday-cell {
  background: #fef0f0;
}

.workday-cell {
  background: #f0f9ff;
}
</style>
