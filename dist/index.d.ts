import { AxiosResponse } from 'axios';
import { AxiosInstance } from "axios";
import FilterItem from './classes/FilterItem';
import OrderItem from './classes/OrderItem';
export declare type ID = string | number;
export interface ResponseGetMany<T> {
    rows: T[];
    count: number;
}
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
export default class APIBuilder<T> {
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
    static store<TE>(name: string, options?: APIBuilderOptions): APIBuilder<TE>;
    clone(): APIBuilder<T>;
    appendParam(param: any, value: any): this;
    join(tableName: string | string[]): this;
    order(field: string | OrderItem[], direction?: 'ASC' | 'DESC'): this;
    filter(param1: string, param2?: string, param3?: string, or?: boolean): this;
    page(page: number, perPage?: number): this;
    nextPage(): this;
    limit(param1: number, param2?: number): this;
    offset(num: number): this;
    buildUrl(id?: ID): string;
    reset(): void;
    resetFilter(): this;
    createOne(instance: any, option?: AfterCallAPIOptions): Promise<AxiosResponse<T>>;
    createMany(instances: any, option?: AfterCallAPIOptions): Promise<AxiosResponse<T>>;
    getOne(id: ID, option?: AfterCallAPIOptions): Promise<AxiosResponse<T>>;
    getMany(option?: AfterCallAPIOptions): Promise<[T[], number, boolean, AxiosResponse<ResponseGetMany<T>>]>;
    updateOne(id: ID, instance: Partial<T>, option?: AfterCallAPIOptions): Promise<AxiosResponse<T>>;
    updateMany(instances: Partial<T>[], option?: AfterCallAPIOptions): Promise<AxiosResponse<T[]>>;
    deleteOne(id: ID, option?: AfterCallAPIOptions): Promise<AxiosResponse<T>>;
}
