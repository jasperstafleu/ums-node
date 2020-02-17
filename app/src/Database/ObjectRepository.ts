export default interface ObjectRepository
{
    find(id: number|string): any;
    findAll(): any[];
}
