const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const ApsProductionOrder = sequelize.define('aps_production_order', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  production_order_id: {
    type: DataTypes.STRING(32),
    allowNull: false,
    unique: true,
    comment: '子订单ID'
  },
  order_id: {
    type: DataTypes.STRING(32),
    allowNull: false,
    comment: '所属销售订单'
  },
  process_route: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '工艺路线(标准柜体线/异形门板线/吸塑线等)'
  },
  total_part_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '总件数'
  },
  material: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '材质'
  },
  thickness: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '厚度'
  },
  color: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '花色'
  },
  edge_banding: {
    type: DataTypes.STRING(100),
    comment: '封边模式'
  },
  planned_date: {
    type: DataTypes.DATEONLY,
    comment: '计划生产日期(粗排程后填充)'
  },
  line_id: {
    type: DataTypes.STRING(32),
    comment: '分配产线(工作中心,粗排程后填充)'
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: '待排程',
    comment: '状态(待排程、已排程、已合并、生产中、已完成)'
  }
}, {
  tableName: 'aps_production_order',
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
      fields: ['planned_date'],
      name: 'idx_planned_date'
    },
    {
      fields: ['line_id'],
      name: 'idx_line_id'
    },
    {
      fields: ['process_route'],
      name: 'idx_process_route'
    }
  ],
  comment: '生产子订单表'
});

module.exports = ApsProductionOrder;
