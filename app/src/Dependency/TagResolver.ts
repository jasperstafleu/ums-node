import Container from "./Container";

export default interface TagResolver
{
    resolve(container: Container, serviceName: string, tag: any): void;
}
