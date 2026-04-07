const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const BatchOrder = sequelize.define('batch_orders', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  batch_no: {
    type: DataTypes.STRING(32),
    allowNull: false,
    comment: '批次号'
  },
  order_no: {
    type: DataTypes.STRING(32),
    allowNull: false,
    comment: '订单号'
  }
}, {
  tableName: 'batch_orders',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['batch_no', 'order_no'],
      name: 'uk_batch_order'
    },
    {
      fields: ['batch_no'],
      name: 'idx_batch_no'
    },
    {
      fields: ['order_no'],
      name: 'idx_order_no'
    }
  ],
  comment: '批次订单关联表'
});

module.exports = BatchOrder;
