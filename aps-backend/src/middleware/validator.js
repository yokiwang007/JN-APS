/**
 * 参数校验中间件
 */

const { validationErrorResponse } = require('../utils/response');

/**
 * 参数校验中间件
 * @param {Object} schema - 校验规则
 * @returns {Function} 中间件函数
 */
function validator(schema) {
  return (req, res, next) => {
    const errors = [];

    // 校验请求体
    if (schema.body) {
      const bodyErrors = validateObject(req.body, schema.body);
      errors.push(...bodyErrors);
    }

    // 校验查询参数
    if (schema.query) {
      const queryErrors = validateObject(req.query, schema.query);
      errors.push(...queryErrors);
    }

    // 校验路径参数
    if (schema.params) {
      const paramsErrors = validateObject(req.params, schema.params);
      errors.push(...paramsErrors);
    }

    if (errors.length > 0) {
      return res.status(400).json(validationErrorResponse(errors.join(', ')));
    }

    next();
  };
}

/**
 * 校验对象
 * @param {Object} data - 待校验的数据
 * @param {Object} rules - 校验规则
 * @returns {Array} 错误信息数组
 */
function validateObject(data, rules) {
  const errors = [];

  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field];

    // 必填校验
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field}不能为空`);
      continue;
    }

    // 如果值不存在且不是必填,跳过其他校验
    if (value === undefined || value === null || value === '') {
      continue;
    }

    // 类型校验
    if (rule.type) {
      if (rule.type === 'string' && typeof value !== 'string') {
        errors.push(`${field}必须是字符串`);
      } else if (rule.type === 'number' && typeof value !== 'number') {
        errors.push(`${field}必须是数字`);
      } else if (rule.type === 'boolean' && typeof value !== 'boolean') {
        errors.push(`${field}必须是布尔值`);
      } else if (rule.type === 'array' && !Array.isArray(value)) {
        errors.push(`${field}必须是数组`);
      }
    }

    // 最小值校验
    if (rule.min !== undefined && value < rule.min) {
      errors.push(`${field}不能小于${rule.min}`);
    }

    // 最大值校验
    if (rule.max !== undefined && value > rule.max) {
      errors.push(`${field}不能大于${rule.max}`);
    }

    // 最小长度校验
    if (rule.minLength !== undefined && value.length < rule.minLength) {
      errors.push(`${field}长度不能小于${rule.minLength}`);
    }

    // 最大长度校验
    if (rule.maxLength !== undefined && value.length > rule.maxLength) {
      errors.push(`${field}长度不能大于${rule.maxLength}`);
    }

    // 正则校验
    if (rule.pattern && !rule.pattern.test(value)) {
      errors.push(`${field}格式不正确`);
    }

    // 枚举值校验
    if (rule.enum && !rule.enum.includes(value)) {
      errors.push(`${field}必须是以下值之一:${rule.enum.join(', ')}`);
    }

    // 自定义校验
    if (rule.validator && typeof rule.validator === 'function') {
      const result = rule.validator(value);
      if (result !== true) {
        errors.push(result || `${field}校验失败`);
      }
    }
  }

  return errors;
}

module.exports = { validator };
