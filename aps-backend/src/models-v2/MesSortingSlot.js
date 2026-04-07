const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const MesSortingSlot = sequelize.define('mes_sorting_slot', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  slot_id: {
    type: DataTypes.STRING(32),
    allowNull: false,
    unique: true,
    comment: '货架槽位ID,唯一标识'
  },
  order_id: {
    type: DataTypes.STRING(32),
    allowNull: false,
    comment: '当前分配的销售订单号'
  },
  total_parts: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '总部件数'
  },
  completed_parts: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '已完成部件数'
  },
  completion_progress: {
    type: DataTypes.STRING(20),
    comment: '齐套进度(如 "98/100")'
  },
  completion_rate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0,
    comment: '齐套率(如 98)'
  },
  estimated_completion_date: {
    type: DataTypes.DATEONLY,
    comment: '预计齐套日期'
  },
  waiting_days: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '等待天数(已完工部件的等待时间)'
  },
  sort_status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: '待齐套',
    comment: '分拣状态(待齐套/部分齐套/已齐套/已发货)'
  }
}, {
  tableName: 'mes_sorting_slot',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  paranoid: true,
  indexes: [
    {
      fields: ['order_id'],
      name: 'idx_order_id'
    },
    {
      fields: ['sort_status'],
      name: 'idx_sort_status'
    }
  ],
  comment: '齐套分拣货位表'
});

module.exports = MesSortingSlot;
