export default interface SessionBag
{
    getId(): string;
    setId(id: string): void;
    exists(): boolean;
    reset(): void;

    set(key: string, value: any): this;
    get(key: string): any;
    remove(key: string): void;
}
