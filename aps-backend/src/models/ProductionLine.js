const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const ProductionLine = sequelize.define('production_lines', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  line_id: {
    type: DataTypes.STRING(32),
    allowNull: false,
    unique: true,
    comment: '产线号'
  },
  line_name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '产线名称'
  },
  line_type: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: '产线类型'
  },
  standard_capacity: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '标准日产能'
  },
  standard_capacity_area: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: '标准产能面积(㎡)'
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: '正常',
    comment: '当前状态'
  },
  workshop: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '所属车间'
  },
  main_equipment: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '主要设备'
  },
  deleted_at: {
    type: DataTypes.DATE,
    comment: '删除时间'
  }
}, {
  tableName: 'production_lines',
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
      fields: ['line_type'],
      name: 'idx_line_type'
    }
  ],
  comment: '产线表'
});

module.exports = ProductionLine;
