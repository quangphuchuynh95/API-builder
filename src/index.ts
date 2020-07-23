import axios from 'axios';
import { AxiosInstance } from "axios";
import FilterItem from './classes/FilterItem';
import OrderItem from './classes/OrderItem';

export interface APIBuilderOptions {
  endpoint: string
  filters: FilterItem[]
  or: FilterItem[]
  order: OrderItem[]
  limit: number
  offset: number
  join: string[]
}

export interface AfterCallAPIOptions {
  keepOption?: boolean;
}

export default class APIBuilder {
  static axios: AxiosInstance = axios;

  static useAxios(axiosInstance: AxiosInstance) {
    this.axios = axiosInstance;
  }

  $endpoint: string;
  $filters: FilterItem[] = [];
  $or: FilterItem[] = [];
  $order: OrderItem[] = [];
  $join: string[] = [];
  $limit: number;
  $offset: number;

  constructor(options: APIBuilderOptions) {
    this.$endpoint = options.endpoint || this.$endpoint;
    this.$filters = options.filters || this.$filters;
    this.$or = options.or || this.$or;
    this.$order = options.order || this.$order;
    this.$limit = options.limit || this.$limit;
    this.$offset = options.offset || this.$offset;
    this.$join = options.join || this.$join;
  }

  static store(name: string, options: APIBuilderOptions): APIBuilder {
    return new APIBuilder({
      ...options,
      endpoint: `/${name}`,
    });
  }

  join(tableName: string | string[]): this {
    if (Array.isArray(tableName)) {
      this.$join = [
        ...this.$join,
        ...tableName,
      ]
    } else {
      this.$join.push(tableName);
    }
    return this;
  }

  order(field: string | OrderItem[], direction: 'ASC' | 'DESC' = 'ASC'): this {
    if (Array.isArray(field)) {
      this.$order = [
        ...this.$order,
        ...field.map((item) => new OrderItem(item.field, item.direction)),
      ];
    } else {
      this.$order.push(new OrderItem(field, direction));
    }
    return this;
  }

  filter(param1: string, param2: string = undefined, param3: string = undefined, or = false): this {
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

  page(page: number, perPage: number = 10): this {
    const limit = perPage;
    const offset = (page - 1) * limit;
    this.limit(offset, limit);
    return this;
  }

  limit(param1: number, param2: number = undefined): this {
    if (param2 === undefined) {
      this.$limit = param1;
    } else {
      this.$offset = param1;
      this.$limit = param2;
    }
    return this;
  }

  offset(num: number): this {
    this.$offset = num;
    return this;
  }

  buildUrl(id?): string {
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

  async createOne(instance, option: AfterCallAPIOptions = {}) {
    const result = await APIBuilder.axios.post(this.buildUrl(), instance);
    if (!option.keepOption) {
      this.reset();
    }
    return result;
  }

  async createMany(instances, option: AfterCallAPIOptions = {}) {
    const result = await APIBuilder.axios.post(this.buildUrl(), instances);
    if (!option.keepOption) {
      this.reset();
    }
    return result;
  }

  async getOne(id, option: AfterCallAPIOptions = {}) {
    const result = await APIBuilder.axios.get(this.buildUrl(id));
    if (!option.keepOption) {
      this.reset();
    }
    return result;
  }

  async getMany(option: AfterCallAPIOptions = {}) {
    const result = await APIBuilder.axios.get(this.buildUrl());
    if (!option.keepOption) {
      this.reset();
    }
    return result;
  }

  async updateOne(id, instance, option: AfterCallAPIOptions = {}) {
    const result = await APIBuilder.axios.patch(this.buildUrl(id), instance);
    if (!option.keepOption) {
      this.reset();
    }
    return result;
  }

  async updateMany(instances, option: AfterCallAPIOptions = {}) {
    const result = await APIBuilder.axios.patch(this.buildUrl(), instances);
    if (!option.keepOption) {
      this.reset();
    }
    return result;
  }

  async deleteOne(id, option: AfterCallAPIOptions = {}) {
    const result = await APIBuilder.axios.delete(this.buildUrl(id));
    if (!option.keepOption) {
      this.reset();
    }
    return result;
  }
}
