import axios from 'axios';
import FilterItem from './classes/FilterItem';
import OrderItem from './classes/OrderItem';

export default class APIBuilder {
  static axios = axios;

  static useAxios(axiosInstance) {
    this.axios = axiosInstance;
  }

  /**
   * @var {String}
   */
  $endpoint;

  /**
   * @var {FilterItem[]} format: {field: string, op: string, value: string}
   */
  $filters = [];

  /**
   * @var {FilterItem[]} format: {field: string, op: string, value: string}
   */
  $or = [];

  /**
   * @var {OrderItem[]}
   */
  $order = [];

  /**
   * @var {String[]}
   */
  $join = [];

  /**
   * @var {Number}
   */
  $limit;

  /**
   * @var {Number}
   */
  $offset;

  /**
   *
   * @param {String} endpoint
   * @param {Object[]} filters
   * @param {Object[]} or
   * @param {Object[]} order
   * @param {String[]} join
   * @param {Number} limit
   * @param {Number} offset
   */
  constructor(
    {
      endpoint,
      filters,
      or,
      order,
      limit,
      offset,
      join,
    },
  ) {
    this.$endpoint = endpoint || this.$endpoint;
    this.$filters = filters || this.$filters;
    this.$or = or || this.$or;
    this.$order = order || this.$order;
    this.$limit = limit || this.$limit;
    this.$offset = offset || this.$offset;
    this.$join = join || this.$join;
  }

  /**
   * @param {String} name
   * @param options
   * @return {APIBuilder}
   */
  static store(name, options = {}) {
    return new APIBuilder({
      endpoint: `/${name}`,
      ...options,
    });
  }

  /**
   *
   * @param {String | String[]} tableName
   * @param {boolean} or
   * @return {APIBuilder}
   */
  join(tableName, or = false) {
    if (Array.isArray(tableName)) {
      this[or ? '$or' : '$join'] = [
        ...this[or ? '$or' : '$join'],
        ...tableName,
      ];
    } else {
      this[or ? '$or' : '$join'].push(tableName);
    }
    return this;
  }

  /**
   *
   * @param {String | OrderItem[]} field
   * @param {String} direction
   * @return {APIBuilder}
   */
  order(field, direction = 'ASC') {
    if (Array.isArray(field)) {
      this.$order = [
        ...this.$order,
        ...field.map((item) => new OrderItem(...item)),
      ];
    } else {
      this.$order.push(new OrderItem(field, direction));
    }
    return this;
  }

  /**
   *
   * @param {String} param1
   * @param {String} param2
   * @param {String} param3
   * @param {boolean} or
   * @return {APIBuilder}
   */
  filter(param1, param2 = undefined, param3 = undefined, or = false) {
    let field;
    let op;
    let value;

    if (param3 !== undefined && param2 !== undefined) {
      field = param1;
      op = param2;
      value = param3;
    } else if (param3 === undefined && param2 !== undefined) {
      if (param1.includes('||')) {
        [field, op] = param1.split('||');
        value = param2;
      } else {
        field = param1;
        op = '$eq';
        value = param2;
      }
    } else {
      [field, op, value] = param1.split('||');
    }

    this[or ? '$or' : '$filters'].push(new FilterItem(field, op, value));
    return this;
  }

  /**
   *
   * @param {number} page
   * @param {number} perPage
   * @return {APIBuilder}
   */
  page(page, perPage = 10) {
    const limit = perPage;
    const offset = (page - 1) * limit;
    this.limit(offset, limit);
    return this;
  }

  /**
   *
   * @param {number} param1
   * @param {number} param2
   * @return {APIBuilder}
   */
  limit(param1, param2 = undefined) {
    if (param2 === undefined) {
      this.$limit = param1;
    } else {
      this.$offset = param1;
      this.$limit = param2;
    }
    return this;
  }

  /**
   *
   * @param {number} num
   * @return {APIBuilder}
   */
  offset(num) {
    this.$offset = num;
    return this;
  }

  /**
   * @return {String}
   */
  buildUrl(id) {
    const params = [
      ...this.$filters.map((filter) => `filter=${filter.field}||${filter.op}||${filter.value}`),
      ...this.$or.map((filter) => `or=${filter.field}||${filter.op}||${filter.value}`),
      ...this.$order.map((order) => `sort=${order.field},${order.direction}`),
      ...this.$join.map((table) => `join=${table}`),
    ];

    if (this.$limit !== undefined) {
      params.push(`limit=${this.$limit}`);
    }

    if (this.$offset !== undefined) {
      params.push(`offset=${this.$offset}`);
    }

    let url = this.$endpoint;

    if (id !== undefined) {
      url += `/${id}`;
    }

    return `${url}?${params.join('&')}`;
  }

  reset() {
    this.$filters = [];
    this.$or = [];
    this.$order = [];
    this.$limit = undefined;
    this.$offset = undefined;
    this.$join = [];
  }

  /**
   *
   * @param {object} instance
   * @param {boolean} keepOption
   * @return {Promise<object>}
   */
  async createOne(instance, { keepOption } = {}) {
    const result = await APIBuilder.axios.post(this.buildUrl(), instance);
    if (!keepOption) {
      this.reset();
    }
    return result;
  }

  /**
   *
   * @param {object[]} instances
   * @param {boolean} keepOption
   * @return {Promise<object[]>}
   */
  async createMany(instances, { keepOption }) {
    const result = await APIBuilder.axios.post(this.buildUrl(), instances);
    if (!keepOption) {
      this.reset();
    }
    return result;
  }

  /**
   * @param {number} id
   * @param {boolean} keepOption
   * @return {Promise<object>}
   */
  async getOne(id, { keepOption } = {}) {
    const result = await APIBuilder.axios.get(this.buildUrl(id));
    if (!keepOption) {
      this.reset();
    }
    return result;
  }

  /**
   * @param {boolean} keepOption
   * @param {boolean} count
   * @return {Promise<object[]>}
   */
  async getMany({ keepOption } = {}) {
    const result = await APIBuilder.axios.get(this.buildUrl());
    if (!keepOption) {
      this.reset();
    }
    return result;
  }

  /**
   * @param {number} id
   * @param {boolean} keepOption
   * @param {object} instance
   * @return {Promise<object>}
   */
  async updateOne(id, instance, { keepOption }) {
    const result = await APIBuilder.axios.patch(this.buildUrl(id), instance);
    if (!keepOption) {
      this.reset();
    }
    return result;
  }

  /**
   * @param {object[]} instances
   * @param {boolean} keepOption
   * @return {Promise<object[]>}
   */
  async updateMany(instances, { keepOption }) {
    const result = await APIBuilder.axios.patch(this.buildUrl(), instances);
    if (!keepOption) {
      this.reset();
    }
    return result;
  }

  /**
   * @param {number} id
   * @param {boolean} keepOption
   * @return {Promise<any>}
   */
  async deleteOne(id, { keepOption }) {
    const result = await APIBuilder.axios.delete(this.buildUrl(id));
    if (!keepOption) {
      this.reset();
    }
    return result;
  }
}
