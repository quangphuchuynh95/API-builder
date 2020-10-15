import axios, {AxiosResponse} from 'axios';
import { AxiosInstance } from "axios";
import FilterItem from './classes/FilterItem';
import OrderItem from './classes/OrderItem';

export type ID = string | number;

export interface ResponseGetMany<T> {
  rows: T[]
  count: number
}

export interface APIBuilderOptions<T> {
  endpoint?: string
  filters?: FilterItem[]
  or?: FilterItem[]
  order?: OrderItem[]
  limit?: number
  offset?: number
  join?: (keyof T)[]
}

export interface AfterCallAPIOptions {
  reset?: boolean;
}

export default class APIBuilder<T> {
  static axios: AxiosInstance = axios;

  static useAxios(axiosInstance: AxiosInstance) {
    this.axios = axiosInstance;
  }

  $endpoint: string;
  $filters: FilterItem[] = [];
  $or: FilterItem[] = [];
  $order: OrderItem[] = [];
  $join: (keyof T)[] = [];
  $limit: number;
  $offset: number;
  $otherParams: [string, string][] = [];

  constructor(options: APIBuilderOptions<T>) {
    this.$endpoint = options.endpoint || this.$endpoint;
    this.$filters = options.filters || this.$filters;
    this.$or = options.or || this.$or;
    this.$order = options.order || this.$order;
    this.$limit = options.limit || this.$limit;
    this.$offset = options.offset || this.$offset;
    this.$join = options.join || this.$join;
  }

  static store<TE>(name: string, options: APIBuilderOptions<TE> = {}): APIBuilder<TE> {
    return new APIBuilder({
      ...options,
      endpoint: `/${name}`,
    });
  }

  clone(): APIBuilder<T> {
    return new APIBuilder({
      endpoint: this.$endpoint,
      filters: this.$filters,
      or: this.$or,
      order: this.$order,
      limit: this.$limit,
      offset: this.$offset,
      join: this.$join,
    });
  }

  appendParam(param, value): this {
    this.$otherParams.push([param, value])
    return this;
  }

  join(tableName: (keyof T) | (keyof T)[]): this {
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

  nextPage(): this {
    const offset = this.offset(this.$offset + this.$limit);
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

  buildUrl(id?: ID): string {
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
    params.push(`count=1`);

    this.$otherParams.forEach((item) => {
      params.push(item.join('='))
    })

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

  resetFilter(): this {
    this.$filters = [];
    return this;
  }

  async createOne(instance, option: AfterCallAPIOptions = {}) {
    const result = await APIBuilder.axios.post<T>(this.buildUrl(), instance);
    if (option.reset) {
      this.reset();
    }
    return result;
  }

  async createMany(instances, option: AfterCallAPIOptions = {}) {
    const result = await APIBuilder.axios.post<T>(this.buildUrl(), instances);
    if (option.reset) {
      this.reset();
    }
    return result;
  }

  async getOne(id: ID, option: AfterCallAPIOptions = {}) {
    const result = await APIBuilder.axios.get<T>(
      this.clone().resetFilter().limit(0,0).buildUrl(id),
    );
    if (option.reset) {
      this.reset();
    }
    return result;
  }

  async getMany(option: AfterCallAPIOptions = {}): Promise<[T[], number, boolean, AxiosResponse<ResponseGetMany<T>>]> {
    const result = await APIBuilder.axios.get<ResponseGetMany<T>>(this.buildUrl());
    const isEndOfPage = result.data.rows.length < this.$limit;
    if (option.reset) {
      this.reset();
    }
    return [
      result.data.rows,
      result.data.count,
      isEndOfPage,
      result,
    ] ;
  }

  async updateOne(id: ID, instance: Partial<T>, option: AfterCallAPIOptions = {}): Promise<AxiosResponse<T>> {
    const result = await APIBuilder.axios.patch<T>(this.buildUrl(id), instance);
    if (option.reset) {
      this.reset();
    }
    return result;
  }

  async updateMany(instances: Partial<T>[], option: AfterCallAPIOptions = {}): Promise<AxiosResponse<T[]>> {
    const result = await APIBuilder.axios.patch<T[]>(this.buildUrl(), instances);
    if (option.reset) {
      this.reset();
    }
    return result;
  }

  async deleteOne(id: ID, option: AfterCallAPIOptions = {}): Promise<AxiosResponse<T>> {
    const result = await APIBuilder.axios.delete<T>(this.buildUrl(id));
    if (option.reset) {
      this.reset();
    }
    return result;
  }
}
