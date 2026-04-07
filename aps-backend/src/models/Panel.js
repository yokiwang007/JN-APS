const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const Panel = sequelize.define('panels', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  panel_no: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: '板件号'
  },
  order_no: {
    type: DataTypes.STRING(32),
    allowNull: false,
    comment: '所属订单号'
  },
  batch_no: {
    type: DataTypes.STRING(32),
    comment: '所属批次号'
  },
  panel_type: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: '部件类型'
  },
  length: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '长度(毫米)'
  },
  width: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '宽度(毫米)'
  },
  thickness: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '厚度(毫米)'
  },
  color: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '花色'
  },
  material: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '材质'
  },
  edge_requirement: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '封边要求'
  },
  process_route: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '工艺路径'
  },
  deleted_at: {
    type: DataTypes.DATE,
    comment: '删除时间'
  }
}, {
  tableName: 'panels',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true,
  indexes: [
    {
      fields: ['order_no'],
      name: 'idx_order_no'
    },
    {
      fields: ['batch_no'],
      name: 'idx_batch_no'
    },
    {
      fields: ['color'],
      name: 'idx_color'
    },
    {
      fields: ['thickness'],
      name: 'idx_thickness'
    }
  ],
  comment: '板件表'
});

module.exports = Panel;
