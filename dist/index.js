"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const FilterItem_1 = require("./classes/FilterItem");
const OrderItem_1 = require("./classes/OrderItem");
class APIBuilder {
    constructor(options) {
        this.$filters = [];
        this.$or = [];
        this.$order = [];
        this.$join = [];
        this.$endpoint = options.endpoint || this.$endpoint;
        this.$filters = options.filters || this.$filters;
        this.$or = options.or || this.$or;
        this.$order = options.order || this.$order;
        this.$limit = options.limit || this.$limit;
        this.$offset = options.offset || this.$offset;
        this.$join = options.join || this.$join;
    }
    static useAxios(axiosInstance) {
        this.axios = axiosInstance;
    }
    static store(name, options) {
        return new APIBuilder(Object.assign(Object.assign({}, options), { endpoint: `/${name}` }));
    }
    join(tableName) {
        if (Array.isArray(tableName)) {
            this.$join = [
                ...this.$join,
                ...tableName,
            ];
        }
        else {
            this.$join.push(tableName);
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
                ...field.map((item) => new OrderItem_1.default(item.field, item.direction)),
            ];
        }
        else {
            this.$order.push(new OrderItem_1.default(field, direction));
        }
        return this;
    }
    filter(param1, param2 = undefined, param3 = undefined, or = false) {
        let field;
        let op;
        let value;
        if (param3 !== undefined && param2 !== undefined) {
            field = param1;
            op = param2;
            value = param3;
        }
        else if (param3 === undefined && param2 !== undefined) {
            if (param1.includes('||')) {
                [field, op] = param1.split('||');
                value = param2;
            }
            else {
                field = param1;
                op = '$eq';
                value = param2;
            }
        }
        else {
            [field, op, value] = param1.split('||');
        }
        this[or ? '$or' : '$filters'].push(new FilterItem_1.default(field, op, value));
        return this;
    }
    page(page, perPage = 10) {
        const limit = perPage;
        const offset = (page - 1) * limit;
        this.limit(offset, limit);
        return this;
    }
    limit(param1, param2 = undefined) {
        if (param2 === undefined) {
            this.$limit = param1;
        }
        else {
            this.$offset = param1;
            this.$limit = param2;
        }
        return this;
    }
    offset(num) {
        this.$offset = num;
        return this;
    }
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
    createOne(instance, { keepOption }) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield APIBuilder.axios.post(this.buildUrl(), instance);
            if (!keepOption) {
                this.reset();
            }
            return result;
        });
    }
    createMany(instances, { keepOption }) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield APIBuilder.axios.post(this.buildUrl(), instances);
            if (!keepOption) {
                this.reset();
            }
            return result;
        });
    }
    getOne(id, { keepOption }) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield APIBuilder.axios.get(this.buildUrl(id));
            if (!keepOption) {
                this.reset();
            }
            return result;
        });
    }
    getMany({ keepOption }) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield APIBuilder.axios.get(this.buildUrl());
            if (!keepOption) {
                this.reset();
            }
            return result;
        });
    }
    updateOne(id, instance, { keepOption }) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield APIBuilder.axios.patch(this.buildUrl(id), instance);
            if (!keepOption) {
                this.reset();
            }
            return result;
        });
    }
    updateMany(instances, { keepOption }) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield APIBuilder.axios.patch(this.buildUrl(), instances);
            if (!keepOption) {
                this.reset();
            }
            return result;
        });
    }
    deleteOne(id, { keepOption }) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield APIBuilder.axios.delete(this.buildUrl(id));
            if (!keepOption) {
                this.reset();
            }
            return result;
        });
    }
}
exports.default = APIBuilder;
APIBuilder.axios = axios_1.default;
//# sourceMappingURL=index.js.map