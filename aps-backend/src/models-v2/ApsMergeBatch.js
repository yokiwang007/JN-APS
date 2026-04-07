const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const ApsMergeBatch = sequelize.define('aps_merge_batch', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  batch_id: {
    type: DataTypes.STRING(32),
    allowNull: false,
    unique: true,
    comment: '批次号,唯一标识(如 B20260415-LINE001-001)'
  },
  line_id: {
    type: DataTypes.STRING(32),
    allowNull: false,
    comment: '生产产线'
  },
  production_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: '计划生产日期'
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
  total_part_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '批次总部件数'
  },
  merge_rule: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '使用的合并规则(板材利用率优先/设备利用率优先)'
  },
  utilization_rate: {
    type: DataTypes.DECIMAL(5, 2),
    comment: '板材利用率(开料优化后填充)'
  },
  optimize_status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: '待优化',
    comment: '优化状态(待优化/已优化)'
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: '待排程',
    comment: '状态(待排程、已排程、生产中、已完成)'
  }
}, {
  tableName: 'aps_merge_batch',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  paranoid: true,
  indexes: [
    {
      fields: ['line_id'],
      name: 'idx_line_id'
    },
    {
      fields: ['production_date'],
      name: 'idx_production_date'
    },
    {
      fields: ['status'],
      name: 'idx_status'
    },
    {
      fields: ['optimize_status'],
      name: 'idx_optimize_status'
    }
  ],
  comment: '生产批次主表'
});

module.exports = ApsMergeBatch;
