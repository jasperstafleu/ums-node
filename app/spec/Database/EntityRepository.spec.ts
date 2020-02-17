import QueryExecutor from "$stafleu/Database/QueryExecutor";
import {Mock} from "ts-mocks";
import EntityRepository from "$stafleu/Database/EntityRepository";

describe('EntityRepository', () => {
    class Entity {}

    let tableName: string,
        executor: Mock<QueryExecutor>,
        repository: EntityRepository<Entity>;

    beforeEach(() => {
        tableName = Math.random().toString(36);
        executor = new Mock<QueryExecutor>();
        repository = new EntityRepository(Entity, tableName, executor.Object);
    });

    describe('\b.find', () => {
        it('should execute a simple query with parameterized arguments', () => {
            const id = Math.random(),
                expectedResult = new Entity;

            executor.extend({
                query<T>(type: { new(...args: any[]): T }, query: string, ...args: any[]) {
                    expect(type).toEqual(Entity);
                    expect(query).toEqual(`SELECT * FROM ${tableName} WHERE id=$1`);
                    expect(args).toEqual([id]);

                    return ([expectedResult] as T[]);
                }
            });

            const result = repository.find(id);

            expect(result).toEqual(expectedResult);
        });

        it('should return null if query returns no values', () => {
            const id = Math.random();

            executor.extend({
                query<T>(type: { new(...args: any[]): T }, query: string, ...args: any[]) {
                    expect(type).toEqual(Entity);
                    expect(query).toEqual(`SELECT * FROM ${tableName} WHERE id=$1`);
                    expect(args).toEqual([id]);

                    return [];
                }
            });

            const result = repository.find(id);

            expect(result).toBeNull();
        });
    });

    describe('\b.findAll', () => {
        it('should execute a simple query', () => {
            const expectedResult = [new Entity, new Entity];

            executor.extend({
                query<T>(type: { new(...args: any[]): T }, query: string, ...args: any[]) {
                    expect(type).toEqual(Entity);
                    expect(query).toEqual(`SELECT * FROM ${tableName}`);
                    expect(args).toEqual([]);

                    return (expectedResult as T[]);
                }
            });

            const result = repository.findAll();

            expect(result).toEqual(expectedResult);
        });
    });
});
