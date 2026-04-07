const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const SysWorkCenter = sequelize.define('sys_work_center', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  line_id: {
    type: DataTypes.STRING(32),
    allowNull: false,
    unique: true,
    comment: '产线ID'
  },
  line_name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '产线名称(柜体A线、门板线、吸塑线等)'
  },
  line_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '产线类型(开料线、封边线、钻孔线等)'
  },
  daily_capacity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '日产能(部件件数)'
  },
  daily_capacity_area: {
    type: DataTypes.DECIMAL(10, 2),
    comment: '日产能(平方米)'
  },
  work_center_ids: {
    type: DataTypes.STRING(200),
    comment: '关联的设备工作中心ID列表(逗号分隔)'
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: '正常',
    comment: '状态(正常、维护、停用)'
  }
}, {
  tableName: 'sys_work_center',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
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
  comment: '工作中心/虚拟产线表'
});

module.exports = SysWorkCenter;
