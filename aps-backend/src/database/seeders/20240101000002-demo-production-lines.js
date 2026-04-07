module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('production_lines', [
      {
        id: 1,
        line_id: 'PL001',
        line_name: '电子锯线1',
        line_type: '开料线',
        standard_capacity: 500.00,
        status: '正常',
        workshop: '一车间',
        main_equipment: '电子锯1,电子锯2',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        line_id: 'PL002',
        line_name: '电子锯线2',
        line_type: '开料线',
        standard_capacity: 450.00,
        status: '正常',
        workshop: '一车间',
        main_equipment: '电子锯3,电子锯4',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 3,
        line_id: 'PL003',
        line_name: '封边线A',
        line_type: '封边线',
        standard_capacity: 600.00,
        status: '正常',
        workshop: '二车间',
        main_equipment: '封边机1,封边机2',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 4,
        line_id: 'PL004',
        line_name: '封边线B',
        line_type: '封边线',
        standard_capacity: 550.00,
        status: '正常',
        workshop: '二车间',
        main_equipment: '封边机3,封边机4',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 5,
        line_id: 'PL005',
        line_name: '钻孔线',
        line_type: '钻孔线',
        standard_capacity: 700.00,
        status: '正常',
        workshop: '三车间',
        main_equipment: '六面钻1,六面钻2',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 6,
        line_id: 'PL006',
        line_name: '包装线',
        line_type: '包装线',
        standard_capacity: 800.00,
        status: '正常',
        workshop: '四车间',
        main_equipment: '包装机1,包装机2',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('production_lines', null, {});
  }
};
