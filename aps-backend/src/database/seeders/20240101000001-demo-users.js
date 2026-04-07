const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedPassword = await bcrypt.hash('admin123', 10);

    await queryInterface.bulkInsert('users', [
      {
        id: 1,
        user_id: 'USR001',
        username: 'admin',
        password: hashedPassword,
        real_name: '系统管理员',
        role: 'ADMIN',
        status: '正常',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        user_id: 'USR002',
        username: 'planner',
        password: hashedPassword,
        real_name: '计划员',
        role: 'PLANNER',
        status: '正常',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', null, {});
  }
};
