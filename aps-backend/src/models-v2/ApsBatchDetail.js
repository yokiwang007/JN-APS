const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const ApsBatchDetail = sequelize.define('aps_batch_detail', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  batch_id: {
    type: DataTypes.STRING(32),
    allowNull: false,
    comment: '批次ID'
  },
  production_order_id: {
    type: DataTypes.STRING(32),
    allowNull: false,
    comment: '生产子订单ID'
  },
  part_id: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '零件ID'
  }
}, {
  tableName: 'aps_batch_detail',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['batch_id'],
      name: 'idx_batch_id'
    },
    {
      fields: ['production_order_id'],
      name: 'idx_production_order_id'
    },
    {
      fields: ['part_id'],
      name: 'idx_part_id'
    }
  ],
  comment: '批次明细映射表'
});

module.exports = ApsBatchDetail;
