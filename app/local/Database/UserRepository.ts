import ObjectRepository from "$stafleu/Database/ObjectRepository";
import User from "$stafleu_local/Models/User";
import QueryExecutor from "$stafleu/Database/QueryExecutor";

// TODO: Generalize to EntityRepository
export default class UserRepository implements ObjectRepository
{
    constructor(protected executor: QueryExecutor)
    {
    }

    find(id: number | string): User|null
    {
        return this.executor.query(User, 'SELECT * FROM users WHERE id=$1', id)[0] || null;
    }

    findAll(): User[]
    {
        return this.executor.query(User, 'SELECT * FROM users');
    }
}
