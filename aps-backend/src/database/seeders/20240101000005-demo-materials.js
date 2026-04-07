module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('materials', [
      {
        id: 1,
        material_no: 'MAT001',
        material_name: '18mm子午灰颗粒板',
        material_type: '板材',
        specification: '2440×1220×18mm',
        stock_quantity: 200.00,
        safety_stock: 50.00,
        warehouse: '原料仓',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        material_no: 'MAT002',
        material_name: '18mm黑胡桃颗粒板',
        material_type: '板材',
        specification: '2440×1220×18mm',
        stock_quantity: 150.00,
        safety_stock: 40.00,
        warehouse: '原料仓',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 3,
        material_no: 'MAT003',
        material_name: '9mm背板',
        material_type: '板材',
        specification: '2440×1220×9mm',
        stock_quantity: 300.00,
        safety_stock: 80.00,
        warehouse: '原料仓',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 4,
        material_no: 'MAT004',
        material_name: '1mm子午灰ABS封边带',
        material_type: '封边带',
        specification: '22×1mm',
        stock_quantity: 5000.00,
        safety_stock: 1000.00,
        warehouse: '辅料仓',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 5,
        material_no: 'MAT005',
        material_name: '三合一连接件',
        material_type: '五金',
        specification: 'Φ8×50mm',
        stock_quantity: 10000.00,
        safety_stock: 2000.00,
        warehouse: '五金仓',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('materials', null, {});
  }
};
