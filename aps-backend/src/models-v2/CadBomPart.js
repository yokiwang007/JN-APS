const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const CadBomPart = sequelize.define('cad_bom_part', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  part_id: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: '零件ID'
  },
  order_id: {
    type: DataTypes.STRING(32),
    allowNull: false,
    comment: '所属销售订单'
  },
  part_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '零件类型(柜体板、门板、背板、五金件等)'
  },
  length: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '长度'
  },
  width: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '宽度'
  },
  thickness: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '厚度'
  },
  material: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '材质(颗粒板、多层板、密度板等)'
  },
  color: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '花色(子午灰、白橡木、樱桃木等)'
  },
  edge_banding: {
    type: DataTypes.STRING(100),
    comment: '封边模式'
  },
  barcode: {
    type: DataTypes.STRING(100),
    comment: '条码号'
  },
  area: {
    type: DataTypes.DECIMAL(10, 4),
    comment: '面积'
  },
  process_route: {
    type: DataTypes.STRING(100),
    comment: '工艺路线(自动匹配)'
  }
}, {
  tableName: 'cad_bom_part',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  paranoid: true,
  indexes: [
    {
      fields: ['order_id'],
      name: 'idx_order_id'
    },
    {
      fields: ['process_route'],
      name: 'idx_process_route'
    },
    {
      fields: ['material'],
      name: 'idx_material'
    },
    {
      fields: ['color'],
      name: 'idx_color'
    }
  ],
  comment: '底层零件明细表'
});

module.exports = CadBomPart;
