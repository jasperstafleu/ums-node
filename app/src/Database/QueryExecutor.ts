export default interface QueryExecutor
{
    query<T>(type: {new (...args: any[]): T}, query: string, ...boundParameters: any[]): T[];
}
