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
    comment: '工艺路线号'
  },
  panel_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '适用部件类型'
  },
  process_sequence: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '工序序列'
  },
  standard_time: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '标准工时(分钟)'
  },
  required_equipment: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '所需设备'
  },
  process_requirement: {
    type: DataTypes.STRING(500),
    comment: '工艺要求'
  },
  deleted_at: {
    type: DataTypes.DATE,
    comment: '删除时间'
  }
}, {
  tableName: 'process_routes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true,
  indexes: [
    {
      fields: ['panel_type'],
      name: 'idx_panel_type'
    }
  ],
  comment: '工艺路线表'
});

module.exports = ProcessRoute;
