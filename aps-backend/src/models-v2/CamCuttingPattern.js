const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const CamCuttingPattern = sequelize.define('cam_cutting_pattern', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  pattern_id: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: '图纸ID,唯一标识'
  },
  batch_id: {
    type: DataTypes.STRING(32),
    allowNull: false,
    comment: '关联批次号'
  },
  required_board_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '所需原大板数量'
  },
  board_specification: {
    type: DataTypes.STRING(50),
    comment: '大板规格(如 1220x2440mm 18mm)'
  },
  utilization_rate: {
    type: DataTypes.DECIMAL(5, 2),
    comment: '预计利用率(如 92.5)'
  },
  waste_rate: {
    type: DataTypes.DECIMAL(5, 2),
    comment: '废料率'
  },
  image_path: {
    type: DataTypes.STRING(255),
    comment: '优化图路径(存储排版图文件)'
  }
}, {
  tableName: 'cam_cutting_pattern',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  paranoid: true,
  indexes: [
    {
      fields: ['batch_id'],
      name: 'idx_batch_id'
    }
  ],
  comment: '排版图表'
});

module.exports = CamCuttingPattern;
