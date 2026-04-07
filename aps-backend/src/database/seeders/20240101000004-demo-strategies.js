module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('strategies', [
      {
        id: 1,
        strategy_id: 'STR001',
        strategy_name: '成本优先',
        description: '优先考虑板材利用率与换模成本,降低生产成本',
        priority_weights: '板材利用率:0.5,换模成本:0.3,交期满足率:0.2',
        constraints: '板材利用率≥85%,产能利用率≤95%',
        enabled: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        strategy_id: 'STR002',
        strategy_name: '交期优先',
        description: '优先保证订单交期,确保按时交付',
        priority_weights: '交期满足率:0.5,板材利用率:0.3,换模成本:0.2',
        constraints: '板材利用率≥80%,交期延迟≤1天',
        enabled: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 3,
        strategy_id: 'STR003',
        strategy_name: '产能均衡',
        description: '平衡各产线负荷,避免产能闲置或超负荷',
        priority_weights: '产能均衡:0.4,板材利用率:0.3,交期满足率:0.3',
        constraints: '产线负荷偏差≤20%',
        enabled: false,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('strategies', null, {});
  }
};
