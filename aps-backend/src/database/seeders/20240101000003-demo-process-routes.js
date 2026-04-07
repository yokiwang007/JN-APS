module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('process_routes', [
      {
        id: 1,
        route_id: 'PR001',
        panel_type: '柜体板',
        process_sequence: '开料,封边,钻孔,质检',
        standard_time: 15,
        required_equipment: '电子锯,封边机,六面钻',
        process_requirement: '需要五轴加工中心',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        route_id: 'PR002',
        panel_type: '门板',
        process_sequence: '开料,铣型,封边,质检',
        standard_time: 20,
        required_equipment: '电子锯,铣型机,封边机',
        process_requirement: '需要拉米诺连接',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 3,
        route_id: 'PR003',
        panel_type: '背板',
        process_sequence: '开料,封边,质检',
        standard_time: 10,
        required_equipment: '电子锯,封边机',
        process_requirement: '',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 4,
        route_id: 'PR004',
        panel_type: '装饰条',
        process_sequence: '开料,镂铣,质检',
        standard_time: 25,
        required_equipment: '电子锯,镂铣机',
        process_requirement: '需要异形加工',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('process_routes', null, {});
  }
};
