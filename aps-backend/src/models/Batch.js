const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const Batch = sequelize.define('batches', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  batch_no: {
    type: DataTypes.STRING(32),
    allowNull: false,
    unique: true,
    comment: '批次号'
  },
  color: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '板材花色'
  },
  thickness: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '板材厚度(毫米)'
  },
  material: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '板材材质'
  },
  plan_start_date: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: '计划生产日期'
  },
  plan_end_date: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: '计划完成日期'
  },
  production_line: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '所属产线'
  },
  utilization_rate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    comment: '板材利用率(%)'
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: '待下发',
    comment: '批次状态'
  },
  panel_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '板件数量'
  },
  optimize_image_path: {
    type: DataTypes.STRING(255),
    comment: '优化开料图路径'
  },
  deleted_at: {
    type: DataTypes.DATE,
    comment: '删除时间'
  }
}, {
  tableName: 'batches',
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
      fields: ['production_line'],
      name: 'idx_production_line'
    },
    {
      fields: ['plan_start_date'],
      name: 'idx_plan_start_date'
    }
  ],
  comment: '批次表'
});

module.exports = Batch;
