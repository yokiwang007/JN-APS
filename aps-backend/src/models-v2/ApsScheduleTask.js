const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const ApsScheduleTask = sequelize.define('aps_schedule_task', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  task_id: {
    type: DataTypes.STRING(32),
    allowNull: false,
    unique: true,
    comment: '任务ID'
  },
  production_order_id: {
    type: DataTypes.STRING(32),
    allowNull: false,
    comment: '关联生产子订单ID'
  },
  planned_start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: '计划开工日期'
  },
  planned_end_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: '计划完工日期'
  },
  line_id: {
    type: DataTypes.STRING(32),
    allowNull: false,
    comment: '分配的产线编码'
  },
  priority: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '优先级(继承自销售订单或根据规则调整)'
  },
  schedule_status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: '已排定',
    comment: '排产状态(已排定/已揉单)'
  }
}, {
  tableName: 'aps_schedule_task',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  paranoid: true,
  indexes: [
    {
      fields: ['production_order_id'],
      name: 'idx_production_order_id'
    },
    {
      fields: ['line_id'],
      name: 'idx_line_id'
    },
    {
      fields: ['planned_start_date'],
      name: 'idx_planned_start_date'
    },
    {
      fields: ['schedule_status'],
      name: 'idx_schedule_status'
    }
  ],
  comment: '排程任务表'
});

module.exports = ApsScheduleTask;
