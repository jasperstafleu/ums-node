export default interface Engine
{
    supports(name: string): boolean;
    render(name: string, parameters: {[key: string]: any}): string;
}
