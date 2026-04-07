const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const Schedule = sequelize.define('schedules', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  schedule_id: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: '排程ID'
  },
  batch_no: {
    type: DataTypes.STRING(32),
    allowNull: false,
    comment: '批次号'
  },
  process_name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '工序名称'
  },
  start_time: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: '开始时间'
  },
  end_time: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: '结束时间'
  },
  equipment_name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '设备名称'
  },
  deleted_at: {
    type: DataTypes.DATE,
    comment: '删除时间'
  }
}, {
  tableName: 'schedules',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true,
  indexes: [
    {
      fields: ['batch_no'],
      name: 'idx_batch_no'
    },
    {
      fields: ['start_time'],
      name: 'idx_start_time'
    }
  ],
  comment: '排程表'
});

module.exports = Schedule;
