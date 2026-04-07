const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const Strategy = sequelize.define('strategies', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  strategy_id: {
    type: DataTypes.STRING(32),
    allowNull: false,
    unique: true,
    comment: '策略编号'
  },
  strategy_name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '策略名称'
  },
  description: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: '策略描述'
  },
  priority_weights: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: '优先级权重'
  },
  constraints: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: '约束条件'
  },
  enabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: '是否启用'
  },
  deleted_at: {
    type: DataTypes.DATE,
    comment: '删除时间'
  }
}, {
  tableName: 'strategies',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true,
  indexes: [
    {
      fields: ['enabled'],
      name: 'idx_enabled'
    }
  ],
  comment: '策略表'
});

module.exports = Strategy;
