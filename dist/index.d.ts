import FilterItem from './classes/FilterItem';
import OrderItem from './classes/OrderItem';
export interface APIBuilderOptions {
    endpoint: string;
    filters: FilterItem[];
    or: FilterItem[];
    order: OrderItem[];
    limit: number;
    offset: number;
    join: string[];
}
export default class APIBuilder {
    static axios: import("axios").AxiosStatic;
    static useAxios(axiosInstance: any): void;
    $endpoint: string;
    $filters: FilterItem[];
    $or: FilterItem[];
    $order: OrderItem[];
    $join: string[];
    $limit: number;
    $offset: number;
    constructor(options: APIBuilderOptions);
    static store(name: string, options: APIBuilderOptions): APIBuilder;
    join(tableName: string | string[]): this;
    /**
     *
     * @param {String | OrderItem[]} field
     * @param {String} direction
     * @return {APIBuilder}
     */
    order(field: string | OrderItem[], direction?: string): this;
    filter(param1: string, param2?: string, param3?: string, or?: boolean): this;
    page(page: number, perPage?: number): this;
    limit(param1: number, param2?: number): this;
    offset(num: number): this;
    buildUrl(id?: any): string;
    reset(): void;
    createOne(instance: any, { keepOption }: {
        keepOption: any;
    }): Promise<import("axios").AxiosResponse<any>>;
    createMany(instances: any, { keepOption }: {
        keepOption: any;
    }): Promise<import("axios").AxiosResponse<any>>;
    getOne(id: any, { keepOption }: {
        keepOption: any;
    }): Promise<import("axios").AxiosResponse<any>>;
    getMany({ keepOption }: {
        keepOption: any;
    }): Promise<import("axios").AxiosResponse<any>>;
    updateOne(id: any, instance: any, { keepOption }: {
        keepOption: any;
    }): Promise<import("axios").AxiosResponse<any>>;
    updateMany(instances: any, { keepOption }: {
        keepOption: any;
    }): Promise<import("axios").AxiosResponse<any>>;
    deleteOne(id: any, { keepOption }: {
        keepOption: any;
    }): Promise<import("axios").AxiosResponse<any>>;
}
