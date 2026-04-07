/**
 * 将模拟数据插入到数据库
 * 提取前10张订单及其关联的工件清单
 */

const mysql = require('../aps-backend/node_modules/mysql2/promise');

// 数据库配置
const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'jienor0803',
  database: 'aps_db'
};

// 辅助函数
const weightedRandom = (weights) => {
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let random = Math.random() * totalWeight;
  for (let i = 0; i < weights.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return i;
    }
  }
  return weights.length - 1;
};

const generateRandomDate = (startDays, endDays) => {
  const now = new Date();
  const span = endDays - startDays;
  const days = startDays + Math.floor(Math.random() * (span <= 0 ? 1 : span));
  const date = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  return date.toISOString().split('T')[0];
};

const generatePanelNo = (orderNo, index) => {
  return `${orderNo}-P${String(index).padStart(3, '0')}`;
};

const generatePanelName = (panelType, index, productType) => {
  const positionNames = ['左', '右', '顶', '底', '中', '前', '后'];
  const position = positionNames[index % positionNames.length];

  switch (panelType) {
    case '柜体板':
      if (productType === '衣柜') {
        const wardrobeNames = ['左侧板', '右侧板', '顶板', '底板', '层板', '背板', '中侧板'];
        return wardrobeNames[index % wardrobeNames.length];
      } else if (productType === '橱柜') {
        const cabinetNames = ['左侧板', '右侧板', '台面板', '底板', '层板', '背板', '踢脚板'];
        return cabinetNames[index % cabinetNames.length];
      } else {
        return `${position}侧板`;
      }
    case '门板':
      if (productType === '衣柜') {
        return `门板${Math.floor(index / 2) + 1}-${index % 2 === 0 ? '左' : '右'}`;
      } else {
        return `门板${index + 1}`;
      }
    case '背板':
      return '背板';
    case '装饰条':
      const trimNames = ['顶线', '脚线', '侧线', '装饰条'];
      return trimNames[index % trimNames.length];
    case '抽面':
      return `抽面${index + 1}`;
    default:
      return `${panelType}${index + 1}`;
  }
};

const getProcessRoute = (panelType) => {
  const routes = {
    '柜体板': ['开料', '封边', '钻孔', '分拣'],
    '门板': ['开料', '封边', '钻孔', '分拣'],
    '背板': ['开料', '封边', '分拣'],
    '装饰条': ['开料', '封边', '分拣'],
    '抽面': ['开料', '封边', '钻孔', '分拣']
  };
  return routes[panelType] || ['开料', '分拣'];
};

// 生成订单数据
const generateOrders = (count = 10) => {
  const orders = [];
  const productTypes = ['衣柜', '橱柜', '电视柜', '书柜', '鞋柜'];
  const productWeights = [0.4, 0.3, 0.2, 0.05, 0.05];
  const statuses = ['待审核', '技术审核中', '齐套检查中', '待排产', '已排产', '生产中', '已完成', '已取消'];
  const statusWeights = [0.5, 0.05, 0.05, 0.2, 0.1, 0.05, 0.03, 0.02];
  const priorities = ['普通', '紧急', '特急'];
  const priorityWeights = [0.7, 0.25, 0.05];
  const orderTypes = ['标准订单', '加急订单', '补件订单'];
  const orderTypeWeights = [0.7, 0.2, 0.1];
  const organizations = ['杰诺销售公司', '杰诺智造中心'];
  const organizationWeights = [0.6, 0.4];
  const documentTypes = ['零售订单', '工程订单', '电商订单'];
  const documentTypeWeights = [0.5, 0.3, 0.2];
  const salesmen = ['张伟', '王芳', '李娜', '赵敏', '刘静', '陈强', '杨磊', '黄艳'];
  const salesmanWeights = [0.15, 0.15, 0.15, 0.15, 0.1, 0.1, 0.1, 0.1];
  const currentUser = '管理员';

  for (let i = 1; i <= count; i++) {
    const productType = productTypes[weightedRandom(productWeights)];
    const status = statuses[weightedRandom(statusWeights)];
    const priority = priorities[weightedRandom(priorityWeights)];
    const orderType = orderTypes[weightedRandom(orderTypeWeights)];
    const organization = organizations[weightedRandom(organizationWeights)];
    const documentType = documentTypes[weightedRandom(documentTypeWeights)];
    const salesman = salesmen[weightedRandom(salesmanWeights)];

    const orderDate = generateRandomDate(-30, 0);
    const deliveryDate = generateRandomDate(7, 60);

    const panelCount = Math.floor(Math.random() * 30) + 10;

    const order = {
      orderNo: `OD${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(i).padStart(3, '0')}`,
      customerName: ['广州刘霞', '深圳张明', '东莞李华', '佛山王强', '珠海赵伟'][Math.floor(Math.random() * 5)],
      productType,
      orderType,
      organization,
      documentType,
      salesman,
      creator: currentUser,
      orderDate,
      deliveryDate,
      status,
      priority,
      panelCount,
      remark: ''
    };

    orders.push(order);
  }

  return orders;
};

// 生成工件数据
const generatePanels = (orders) => {
  const panels = [];
  const panelTypes = ['柜体板', '门板', '背板', '装饰条', '抽面'];
  const panelWeights = [0.4, 0.35, 0.15, 0.05, 0.05];
  const thicknesses = ['18', '9', '25'];
  const thicknessWeights = [0.6, 0.25, 0.15];
  const colors = ['子午灰', '黑胡桃', '羊绒灰', '白橡木', '胡桃木', '深空灰'];
  const colorWeights = [0.3, 0.25, 0.2, 0.1, 0.1, 0.05];
  const materials = ['颗粒板', '多层板'];
  const materialWeights = [0.7, 0.3];

  const hardwareTypes = ['铰链', '滑轨', '拉手', '层板托', '衣通', '裤架', '阻尼器', '防撞粒'];
  const hardwareWeights = [0.25, 0.2, 0.15, 0.1, 0.1, 0.08, 0.07, 0.05];

  orders.forEach(order => {
    const panelCount = Math.floor(order.panelCount * 0.8);
    for (let i = 1; i <= panelCount; i++) {
      const panelType = panelTypes[weightedRandom(panelWeights)];
      const thickness = thicknesses[weightedRandom(thicknessWeights)];
      const color = colors[weightedRandom(colorWeights)];
      const material = materials[weightedRandom(materialWeights)];

      let length, width;
      if (order.productType === '衣柜') {
        length = Math.floor(Math.random() * 800) + 400;
        width = Math.floor(Math.random() * 600) + 300;
      } else if (order.productType === '橱柜') {
        length = Math.floor(Math.random() * 600) + 400;
        width = Math.floor(Math.random() * 500) + 300;
      } else {
        length = Math.floor(Math.random() * 500) + 300;
        width = Math.floor(Math.random() * 400) + 200;
      }

      const area = ((length * width) / 1000000).toFixed(4);

      const panel = {
        panelNo: generatePanelNo(order.orderNo, i),
        orderNo: order.orderNo,
        panelType,
        panelName: generatePanelName(panelType, i - 1, order.productType),
        length,
        width,
        thickness: parseInt(thickness),
        color,
        material,
        edgeRequirement: ['四边封直边', '两边封直边', '四边封异形边'][Math.floor(Math.random() * 3)],
        processRoute: getProcessRoute(panelType),
        area,
        itemType: '板件'
      };
      panels.push(panel);
    }

    const hardwareCount = order.panelCount - panelCount;
    for (let i = panelCount + 1; i <= order.panelCount; i++) {
      const hardwareType = hardwareTypes[weightedRandom(hardwareWeights)];
      
      let specification = '';
      let quantity = 1;
      
      switch (hardwareType) {
        case '铰链':
          specification = ['全盖液压缓冲', '半盖液压缓冲', '直臂液压缓冲'][Math.floor(Math.random() * 3)];
          quantity = Math.floor(Math.random() * 8) + 4;
          break;
        case '滑轨':
          specification = ['三节静音滑轨', '两节滑轨', '隐藏式滑轨'][Math.floor(Math.random() * 3)];
          quantity = Math.floor(Math.random() * 6) + 2;
          break;
        case '拉手':
          specification = ['铝合金隐形拉手', '不锈钢拉手', '一字拉手'][Math.floor(Math.random() * 3)];
          quantity = Math.floor(Math.random() * 6) + 2;
          break;
        case '层板托':
          specification = ['塑料层板托', '金属层板托'][Math.floor(Math.random() * 2)];
          quantity = Math.floor(Math.random() * 8) + 4;
          break;
        case '衣通':
          specification = ['铝合金衣通', '不锈钢衣通'][Math.floor(Math.random() * 2)];
          quantity = 1;
          break;
        case '裤架':
          specification = '标准裤架';
          quantity = 1;
          break;
        case '阻尼器':
          specification = '液压阻尼器';
          quantity = Math.floor(Math.random() * 4) + 2;
          break;
        case '防撞粒':
          specification = '硅胶防撞粒';
          quantity = Math.floor(Math.random() * 10) + 5;
          break;
      }

      const hardware = {
        panelNo: generatePanelNo(order.orderNo, i),
        orderNo: order.orderNo,
        panelType: hardwareType,
        panelName: `${hardwareType}(${specification})`,
        length: null,
        width: null,
        thickness: null,
        color: null,
        material: specification,
        edgeRequirement: null,
        processRoute: ['质检'],
        area: null,
        itemType: '五金件',
        quantity,
        specification
      };
      panels.push(hardware);
    }
  });

  return panels;
};

// 主函数
async function main() {
  let connection;
  
  try {
    console.log('连接数据库...');
    connection = await mysql.createConnection(dbConfig);
    console.log('数据库连接成功');

    // 生成模拟数据
    console.log('\n生成模拟数据...');
    const orders = generateOrders(10);
    const panels = generatePanels(orders);
    console.log(`生成了 ${orders.length} 张订单`);
    console.log(`生成了 ${panels.length} 个工件`);

    // 插入订单
    console.log('\n插入订单数据...');
    for (const order of orders) {
      await connection.execute(`
        INSERT INTO erp_sales_order (
          order_id, customer_name, product_type, order_type, organization,
          document_type, salesman, creator, due_date,
          status, priority, remark, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        order.orderNo, order.customerName, order.productType, order.orderType, order.organization,
        order.documentType, order.salesman, order.creator, order.deliveryDate,
        order.status, order.priority === '普通' ? 3 : order.priority === '紧急' ? 2 : 1, order.remark
      ]);
    }
    console.log(`成功插入 ${orders.length} 张订单`);

    // 插入工件清单
    console.log('\n插入工件清单数据...');
    let billCount = 0;
    let detailCount = 0;
    
    for (const order of orders) {
      const orderPanels = panels.filter(p => p.orderNo === order.orderNo);
      
      // 生成工件清单编号
      const billNo = `WB${order.orderNo.slice(-6)}`;
      
      // 插入工件清单表头
      const [result] = await connection.execute(`
        INSERT INTO workpiece_bills (
          bill_no, order_id, organization, order_type, customer_name,
          order_date, due_date, product_name, splitter, split_date,
          workpiece_count, status, remark, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        billNo, order.orderNo, order.organization, order.orderType, order.customerName,
        order.orderDate, order.deliveryDate, order.productType, '系统', order.orderDate,
        orderPanels.length, '待处理', ''
      ]);
      
      const billId = result.insertId;
      billCount++;

      // 插入工件清单明细
      for (const panel of orderPanels) {
        await connection.execute(`
          INSERT INTO workpiece_bill_details (
            bill_id, order_id, panel_no, panel_name, panel_type, item_type,
            length, width, thickness, color, material,
            edge_requirement, area, quantity, process_route,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [
          billId, order.orderNo, panel.panelNo, panel.panelName, panel.panelType, panel.itemType,
          panel.length, panel.width, panel.thickness, panel.color, panel.material,
          panel.edgeRequirement, panel.area, panel.quantity || 1, JSON.stringify(panel.processRoute)
        ]);
        detailCount++;
      }
    }
    
    console.log(`成功插入 ${billCount} 张工件清单`);
    console.log(`成功插入 ${detailCount} 条工件清单明细`);

    // 验证数据
    console.log('\n验证数据...');
    const [orderResult] = await connection.execute('SELECT COUNT(*) as count FROM erp_sales_order');
    const [billResult] = await connection.execute('SELECT COUNT(*) as count FROM workpiece_bills');
    const [detailResult] = await connection.execute('SELECT COUNT(*) as count FROM workpiece_bill_details');
    
    console.log(`销售订单表: ${orderResult[0].count} 条`);
    console.log(`工件清单表头: ${billResult[0].count} 条`);
    console.log(`工件清单明细: ${detailResult[0].count} 条`);

    console.log('\n数据插入完成！');

  } catch (error) {
    console.error('错误:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

main();
