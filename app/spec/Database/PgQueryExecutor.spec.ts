import {Pool, QueryResult} from "pg";
import {Mock} from "ts-mocks";
import PgQueryExecutor from "$stafleu/Database/PgQueryExecutor";

describe('PgQueryExecutor', () => {
    let pool: Mock<Pool>,
        executor: PgQueryExecutor;

    class Entity { field: string|undefined; }

    beforeEach(() => {
        pool = new Mock<Pool>();
        executor = new PgQueryExecutor(pool.Object);
    });

    describe('\b.query', () => {
        it('should throw if the query throws (without changes)', () => {
            const e = new Error('Some error');

            pool.extend({
                query() { throw e; }
            });

            expect(() => executor.query(Entity, '')).toThrow(e);
        });

        it('should return empty array if the query returns no results', () => {
            const qr = new Mock<QueryResult>({rowCount: 0}),
                query = Math.random().toString(36);

            pool.extend({
                query(argList: any) {
                    expect(argList.text).toBe(query);
                    expect(argList.values).toEqual([]);

                    return Promise.resolve(qr.Object);
                }
            });

            const result = executor.query(Entity, query);

            expect(result).toEqual([]);
        });

        it('should pass the rest of the arguments as bound query params', () => {
            const param1 = Math.random(),
                param2 = Math.random(),
                qr = new Mock<QueryResult>({rowCount: 0}),
                query = Math.random().toString(36);

            pool.extend({
                query(argList: any) {
                    expect(argList.text).toBe(query);
                    expect(argList.values).toEqual([param1, param2]);

                    return Promise.resolve(qr.Object);
                }
            });

            const result = executor.query(Entity, query, param1, param2);

            expect(result).toEqual([]);
        });

        it('should return hydrated objects if the query returns results', () => {
            const fieldValue = Math.random().toString(36),
                qr = new Mock<QueryResult>({rowCount: 1, rows: [{field: fieldValue}]}),
                query = Math.random().toString(36);

            pool.extend({query(){ return Promise.resolve(qr.Object); }});

            const result = executor.query(Entity, query);

            expect(result.length).toBe(1);
            expect(result[0]).toBeInstanceOf(Entity);
            expect(result[0].field).toBe(fieldValue);
        });

        it('should return multiple objects if the query returns multiple rows', () => {
            const fieldValue = Math.random().toString(36),
                qr = new Mock<QueryResult>({rowCount: 2, rows: [{field: 1+fieldValue}, {field: 2+fieldValue}]}),
                query = Math.random().toString(36);

            pool.extend({query(){ return Promise.resolve(qr.Object); }});

            const result = executor.query(Entity, query);

            expect(result.length).toBe(2);
            expect(result[0]).toBeInstanceOf(Entity);
            expect(result[0].field).toBe(1+fieldValue);
            expect(result[1]).toBeInstanceOf(Entity);
            expect(result[1].field).toBe(2+fieldValue);
        });
    });
});
