const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const MesFulfillmentDetail = sequelize.define('mes_fulfillment_detail', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  slot_id: {
    type: DataTypes.STRING(32),
    allowNull: false,
    comment: '货位ID'
  },
  production_order_id: {
    type: DataTypes.STRING(32),
    allowNull: false,
    comment: '生产子订单ID'
  },
  completed_parts: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '已完成部件数'
  },
  completion_date: {
    type: DataTypes.DATE,
    comment: '完成日期'
  }
}, {
  tableName: 'mes_fulfillment_detail',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['slot_id'],
      name: 'idx_slot_id'
    },
    {
      fields: ['production_order_id'],
      name: 'idx_production_order_id'
    }
  ],
  comment: '齐套明细表'
});

module.exports = MesFulfillmentDetail;
