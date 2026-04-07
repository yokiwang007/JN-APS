const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const WorkpieceBill = sequelize.define('workpiece_bills', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  bill_no: {
    type: DataTypes.STRING(32),
    allowNull: false,
    unique: true,
    comment: '单据号'
  },
  order_id: {
    type: DataTypes.STRING(32),
    allowNull: false,
    comment: '订单号'
  },
  organization: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '销售组织'
  },
  order_type: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '订单类型'
  },
  customer_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '客户'
  },
  order_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: '订单日期'
  },
  due_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: '承诺交期'
  },
  product_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '产品名称'
  },
  splitter: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '拆单人'
  },
  split_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: '拆单日期'
  },
  workpiece_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '工件数量'
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: '待处理',
    comment: '状态'
  },
  remark: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '备注'
  }
}, {
  tableName: 'workpiece_bills',
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
      fields: ['status'],
      name: 'idx_status'
    },
    {
      fields: ['split_date'],
      name: 'idx_split_date'
    }
  ],
  comment: '工件清单表头'
});

module.exports = WorkpieceBill;
