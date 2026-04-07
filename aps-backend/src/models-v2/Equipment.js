const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const Equipment = sequelize.define('equipments', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  equipment_id: {
    type: DataTypes.STRING(32),
    allowNull: false,
    unique: true,
    comment: '设备编号'
  },
  equipment_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '设备名称'
  },
  type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '设备类型'
  },
  precision_level: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 3,
    comment: '精度等级(1-5)'
  },
  supported_processes: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: '支持工艺(JSON)'
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: '正常',
    comment: '状态'
  },
  load_rate: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    comment: '当前负荷(%)'
  }
}, {
  tableName: 'equipments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true,
  deletedAt: 'deleted_at',
  indexes: [
    {
      fields: ['equipment_id'],
      name: 'idx_equipment_id'
    },
    {
      fields: ['type'],
      name: 'idx_type'
    }
  ],
  comment: '设备列表表'
});

module.exports = Equipment;
