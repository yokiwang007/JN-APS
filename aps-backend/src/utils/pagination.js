/**
 * 分页工具函数
 */

/**
 * 计算分页参数
 * @param {number} page - 当前页码
 * @param {number} pageSize - 每页数量
 * @param {number} total - 总记录数
 * @returns {Object} 分页信息
 */
function calculatePagination(page = 1, pageSize = 20, total = 0) {
  const currentPage = Math.max(1, parseInt(page));
  const currentPageSize = Math.max(1, parseInt(pageSize));
  const totalPages = Math.ceil(total / currentPageSize);
  const offset = (currentPage - 1) * currentPageSize;

  return {
    page: currentPage,
    pageSize: currentPageSize,
    total,
    totalPages,
    offset,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1
  };
}

/**
 * 格式化分页响应
 * @param {Array} list - 数据列表
 * @param {number} total - 总记录数
 * @param {number} page - 当前页码
 * @param {number} pageSize - 每页数量
 * @returns {Object} 分页响应数据
 */
function formatPaginatedResponse(list, total, page, pageSize) {
  const pagination = calculatePagination(page, pageSize, total);

  return {
    ...pagination,
    list
  };
}

module.exports = {
  calculatePagination,
  formatPaginatedResponse
};
