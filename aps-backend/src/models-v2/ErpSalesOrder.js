const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const ErpSalesOrder = sequelize.define('erp_sales_order', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  order_id: {
    type: DataTypes.STRING(32),
    allowNull: false,
    unique: true,
    comment: '订单号'
  },
  organization: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '组织'
  },
  document_type: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '单据类型'
  },
  order_type: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '订单类型'
  },
  salesman: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '销售员'
  },
  creator: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '创建人'
  },
  customer_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '客户名称'
  },
  due_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: '承诺交期'
  },
  product_type: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '产品名称'
  },
  special_process: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: '特殊工艺'
  },
  remark: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '备注'
  },
  total_amount: {
    type: DataTypes.DECIMAL(15, 2),
    comment: '订单总金额'
  },
  priority: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 3,
    comment: '优先级(1-5,数字越大优先级越高)'
  },
  fulfillment_rule: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'full',
    comment: '齐套规则:full(全齐套)/partial(可分批发货)'
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: '待拆解',
    comment: '订单状态(待拆解、已排程、生产中、已完成)'
  }
}, {
  tableName: 'erp_sales_order',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  paranoid: true,
  indexes: [
    {
      fields: ['status'],
      name: 'idx_status'
    },
    {
      fields: ['due_date'],
      name: 'idx_due_date'
    },
    {
      fields: ['priority'],
      name: 'idx_priority'
    }
  ],
  comment: '销售订单主表'
});

module.exports = ErpSalesOrder;
