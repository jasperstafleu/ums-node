export default interface Engine
{
    render(name: string, parameters: {[key: string]: any}): string;
    supports(name: string): boolean;
}
