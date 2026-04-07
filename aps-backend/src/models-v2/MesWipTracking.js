const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const MesWipTracking = sequelize.define('mes_wip_tracking', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  tracking_id: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: '追踪ID,唯一标识'
  },
  part_id: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '零件ID'
  },
  batch_id: {
    type: DataTypes.STRING(32),
    comment: '所属批次'
  },
  current_process: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '当前工序(已开料/已封边/已打孔/已完成)'
  },
  operation_time: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: '操作时间'
  },
  operator: {
    type: DataTypes.STRING(50),
    comment: '操作人'
  },
  equipment_id: {
    type: DataTypes.STRING(50),
    comment: '设备ID'
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: '进行中',
    comment: '状态(进行中/已完成/异常)'
  }
}, {
  tableName: 'mes_wip_tracking',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  paranoid: true,
  indexes: [
    {
      fields: ['part_id'],
      name: 'idx_part_id'
    },
    {
      fields: ['batch_id'],
      name: 'idx_batch_id'
    },
    {
      fields: ['current_process'],
      name: 'idx_current_process'
    },
    {
      fields: ['status'],
      name: 'idx_status'
    }
  ],
  comment: '在制品工序扫码表'
});

module.exports = MesWipTracking;
