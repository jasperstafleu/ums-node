import {Pool, QueryResult} from "pg";
import Block from "$stafleu/Component/Block";
import QueryExecutor from "$stafleu/Database/QueryExecutor";

export default class PgQueryExecutor implements QueryExecutor
{
    constructor(protected pool: Pool)
    {
    }

    query<T>(type: {new (...args: any[]): T}, query: string, ...boundParameters: any[]): T[]
    {
        const result = Block.await<QueryResult>(this.pool.query({
            text: query,
            values: boundParameters
        }));

        if (result.rowCount === 0) {
            return [];
        }

        const keys = Object.keys(result.rows[0]);
        let results: T[] = [], obj: T;
        for (let it = 0; it < result.rowCount; ++it) {
            obj = new type();
            for (let kIt = keys.length - 1; kIt >= 0; --kIt) {
                (obj as any)[keys[kIt]] = result.rows[it][keys[kIt]];
            }
            results.push(obj);
        }

        return results;
    }
}
