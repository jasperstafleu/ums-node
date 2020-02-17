import ObjectRepository from "$stafleu/Database/ObjectRepository";
import QueryExecutor from "$stafleu/Database/QueryExecutor";

export default class EntityRepository<T> implements ObjectRepository
{
    constructor(protected type: {new (...args: any[]): T}, protected tableName: string, protected executor: QueryExecutor)
    {
    }

    find(id: number | string): T|null
    {
        return this.executor.query(this.type, `SELECT * FROM ${this.tableName} WHERE id=$1`, id)[0] || null;
    }

    findAll(): T[]
    {
        return this.executor.query(this.type, `SELECT * FROM ${this.tableName}`);
    }
}
