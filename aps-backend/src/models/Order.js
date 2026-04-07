const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const Order = sequelize.define('orders', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  order_no: {
    type: DataTypes.STRING(32),
    allowNull: false,
    unique: true,
    comment: '订单号'
  },
  customer_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '客户名称'
  },
  product_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '产品类型'
  },
  delivery_date: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: '交货期'
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: '待审核',
    comment: '订单状态'
  },
  priority: {
    type: DataTypes.STRING(10),
    allowNull: false,
    defaultValue: '普通',
    comment: '优先级'
  },
  special_process: {
    type: DataTypes.STRING(500),
    comment: '特殊工艺'
  },
  remark: {
    type: DataTypes.STRING(500),
    comment: '备注'
  },
  deleted_at: {
    type: DataTypes.DATE,
    comment: '删除时间'
  }
}, {
  tableName: 'orders',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true,
  indexes: [
    {
      fields: ['status'],
      name: 'idx_status'
    },
    {
      fields: ['delivery_date'],
      name: 'idx_delivery_date'
    },
    {
      fields: ['priority'],
      name: 'idx_priority'
    }
  ],
  comment: '订单表'
});

module.exports = Order;
