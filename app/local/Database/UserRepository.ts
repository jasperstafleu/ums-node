import ObjectRepository from "$stafleu/Database/ObjectRepository";
import User from "$stafleu_local/Models/User";
import {Pool, PoolConfig} from "pg";

export default class UserRepository implements ObjectRepository
{
    find(id: number | string): User
    {
        return new User('Test');
    }

    findAll(): User[]
    {
        const poolConfig: PoolConfig = {
            user: process.env.POSTGRES_USER,
            host: process.env.POSTGRES_HOST,
            database: process.env.POSTGRES_DB,
            password: process.env.POSTGRES_PASSWORD
        };

        if (process.env.POSTGRES_PORT) {
            poolConfig.port = parseInt(process.env.POSTGRES_PORT);
        }

        const pool = new Pool(poolConfig);
        pool.on('error', (err) => {
            console.error('Unexpected error on idle client', err);
            process.exit(-1)
        });

        let result: User[] = [];//, resolved = false;
        pool.query('SELECT * FROM user').then((bla) => {
            return [new User('test')];
            // resolved = true;
            // result = ;
        });

        return result;
    }
}
