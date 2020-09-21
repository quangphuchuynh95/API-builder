import { AxiosResponse } from 'axios';
import { AxiosInstance } from "axios";
import FilterItem from './classes/FilterItem';
import OrderItem from './classes/OrderItem';
export interface APIBuilderOptions {
    endpoint?: string;
    filters?: FilterItem[];
    or?: FilterItem[];
    order?: OrderItem[];
    limit?: number;
    offset?: number;
    join?: string[];
}
export interface AfterCallAPIOptions {
    reset?: boolean;
}
export default class APIBuilder {
    static axios: AxiosInstance;
    static useAxios(axiosInstance: AxiosInstance): void;
    $endpoint: string;
    $filters: FilterItem[];
    $or: FilterItem[];
    $order: OrderItem[];
    $join: string[];
    $limit: number;
    $offset: number;
    $otherParams: [string, string][];
    constructor(options: APIBuilderOptions);
    static store(name: string, options?: APIBuilderOptions): APIBuilder;
    clone(): APIBuilder;
    appendParam(param: any, value: any): void;
    join(tableName: string | string[]): this;
    order(field: string | OrderItem[], direction?: 'ASC' | 'DESC'): this;
    filter(param1: string, param2?: string, param3?: string, or?: boolean): this;
    page(page: number, perPage?: number): this;
    nextPage(): this;
    limit(param1: number, param2?: number): this;
    offset(num: number): this;
    buildUrl(id?: any): string;
    reset(): void;
    resetFilter(): this;
    createOne(instance: any, option?: AfterCallAPIOptions): Promise<AxiosResponse<any>>;
    createMany(instances: any, option?: AfterCallAPIOptions): Promise<AxiosResponse<any>>;
    getOne(id: any, option?: AfterCallAPIOptions): Promise<AxiosResponse<any>>;
    getMany(option?: AfterCallAPIOptions): Promise<[object[], number, boolean, AxiosResponse]>;
    updateOne(id: any, instance: any, option?: AfterCallAPIOptions): Promise<AxiosResponse<any>>;
    updateMany(instances: any, option?: AfterCallAPIOptions): Promise<AxiosResponse<any>>;
    deleteOne(id: any, option?: AfterCallAPIOptions): Promise<AxiosResponse<any>>;
}
