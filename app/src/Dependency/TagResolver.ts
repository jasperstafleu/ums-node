import Container from "$stafleu/Dependency/Container";

export default interface TagResolver
{
    resolve(container: Container, serviceName: string, tag: {[key: string]: any}): void;
}
