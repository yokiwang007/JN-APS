const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const Material = sequelize.define('materials', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  material_no: {
    type: DataTypes.STRING(32),
    allowNull: false,
    unique: true,
    comment: '物料号'
  },
  material_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '物料名称'
  },
  material_type: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: '物料类型'
  },
  specification: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '规格型号'
  },
  stock_quantity: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    comment: '库存数量'
  },
  safety_stock: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    comment: '安全库存'
  },
  warehouse: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '存放仓库'
  },
  deleted_at: {
    type: DataTypes.DATE,
    comment: '删除时间'
  }
}, {
  tableName: 'materials',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true,
  indexes: [
    {
      fields: ['material_type'],
      name: 'idx_material_type'
    },
    {
      fields: ['warehouse'],
      name: 'idx_warehouse'
    }
  ],
  comment: '物料表'
});

module.exports = Material;
