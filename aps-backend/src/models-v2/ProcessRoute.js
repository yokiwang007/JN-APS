const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const ProcessRoute = sequelize.define('process_routes', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  route_id: {
    type: DataTypes.STRING(32),
    allowNull: false,
    unique: true,
    comment: '路线编号'
  },
  route_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '工艺路线名称'
  },
  panel_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '适用部件类型'
  },
  process_sequence: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '工序序列(JSON)'
  },
  standard_time: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '标准工时(分钟)'
  },
  production_cycle: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '生产周期(天)'
  },
  delivery_commitment: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '对外承诺交期(天)'
  },
  required_equipment: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '所需设备(JSON)'
  },
  process_requirement: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '工艺要求'
  }
}, {
  tableName: 'process_routes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true,
  deletedAt: 'deleted_at',
  indexes: [
    {
      fields: ['route_id'],
      name: 'idx_route_id'
    },
    {
      fields: ['panel_type'],
      name: 'idx_panel_type'
    }
  ],
  comment: '工艺路线表'
});

module.exports = ProcessRoute;
