const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const WorkpieceBillDetail = sequelize.define('workpiece_bill_details', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  bill_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '表头ID'
  },
  order_id: {
    type: DataTypes.STRING(32),
    allowNull: false,
    comment: '订单号'
  },
  panel_no: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '工件号'
  },
  panel_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '工件名称'
  },
  panel_type: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '部件类型'
  },
  item_type: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: '工件类型(板件/五金)'
  },
  length: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: '长度'
  },
  width: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: '宽度'
  },
  thickness: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: true,
    comment: '厚度'
  },
  color: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '花色'
  },
  material: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '材质/规格'
  },
  edge_requirement: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: '封边要求'
  },
  area: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: true,
    comment: '面积'
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    comment: '数量'
  },
  process_route: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '工艺路径(JSON)'
  }
}, {
  tableName: 'workpiece_bill_details',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: false,  // 禁用软删除
  indexes: [
    {
      fields: ['bill_id'],
      name: 'idx_bill_id'
    },
    {
      fields: ['order_id'],
      name: 'idx_order_id'
    },
    {
      fields: ['panel_no'],
      name: 'idx_panel_no'
    }
  ],
  comment: '工件清单表体'
});

module.exports = WorkpieceBillDetail;
