const User = require('./User');
const Order = require('./Order');
const Panel = require('./Panel');
const Batch = require('./Batch');
const BatchOrder = require('./BatchOrder');
const Schedule = require('./Schedule');
const ProductionLine = require('./ProductionLine');
const ProcessRoute = require('./ProcessRoute');
const Strategy = require('./Strategy');
const Material = require('./Material');

// 定义关联关系

// Order 和 Panel (一对多)
Order.hasMany(Panel, {
  foreignKey: 'order_no',
  sourceKey: 'order_no',
  as: 'panels'
});

Panel.belongsTo(Order, {
  foreignKey: 'order_no',
  targetKey: 'order_no',
  as: 'order'
});

// Batch 和 Panel (一对多)
Batch.hasMany(Panel, {
  foreignKey: 'batch_no',
  sourceKey: 'batch_no',
  as: 'panels'
});

Panel.belongsTo(Batch, {
  foreignKey: 'batch_no',
  targetKey: 'batch_no',
  as: 'batch'
});

// Batch 和 Order (多对多,通过BatchOrder)
Batch.belongsToMany(Order, {
  through: BatchOrder,
  foreignKey: 'batch_no',
  otherKey: 'order_no',
  as: 'orders'
});

Order.belongsToMany(Batch, {
  through: BatchOrder,
  foreignKey: 'order_no',
  otherKey: 'batch_no',
  as: 'batches'
});

// Batch 和 BatchOrder (一对多)
Batch.hasMany(BatchOrder, {
  foreignKey: 'batch_no',
  sourceKey: 'batch_no',
  as: 'batchOrders'
});

BatchOrder.belongsTo(Batch, {
  foreignKey: 'batch_no',
  targetKey: 'batch_no',
  as: 'batch'
});

// Order 和 BatchOrder (一对多)
Order.hasMany(BatchOrder, {
  foreignKey: 'order_no',
  sourceKey: 'order_no',
  as: 'batchOrders'
});

BatchOrder.belongsTo(Order, {
  foreignKey: 'order_no',
  targetKey: 'order_no',
  as: 'order'
});

// Batch 和 Schedule (一对多)
Batch.hasMany(Schedule, {
  foreignKey: 'batch_no',
  sourceKey: 'batch_no',
  as: 'schedules'
});

Schedule.belongsTo(Batch, {
  foreignKey: 'batch_no',
  targetKey: 'batch_no',
  as: 'batch'
});

module.exports = {
  User,
  Order,
  Panel,
  Batch,
  BatchOrder,
  Schedule,
  ProductionLine,
  ProcessRoute,
  Strategy,
  Material
};
