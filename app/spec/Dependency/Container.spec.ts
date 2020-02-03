import Container from "$stafleu/Dependency/Container";
import RecursiveDependencyInjection from "$stafleu/Exception/RecursiveDependencyInjection";
import TagResolver from "$stafleu/Dependency/TagResolver";
import {Mock} from "ts-mocks"
import MissingTagName from "$stafleu/Exception/MissingTagName";
import Logger from "$stafleu/Logger/Logger";

describe('Container', () => {
    let container: Container,
        fs: (fileName: string) => string,
        require: (module: string) => any;

    function getRandomClassName() {
        return Math.random().toString(36).replace('\.', '');
    }

    beforeEach(() => {
        fs = (fileName: string) => fileName;
        require = () => {};
        container = new Container((fileName) => fs(fileName), (id) => require(id));
    });

    describe('\b.get', () => {
        it('should throw error if service has not been added previously', () => {
            expect(() => container.get('test')).toThrowError(Error);
        });

        it('should resolve service definition when service is retrieved for the first time only', () => {
            let callCount = 0;
            const service = {},
                serviceDefinition = () => {
                    ++callCount;
                    return service;
                };

            container.addService('test', serviceDefinition);

            expect(callCount).toBe(0);
            expect(container.get('test')).toBe(service);
            expect(callCount).toBe(1);
            expect(container.get('test')).toBe(service);
            expect(callCount).toBe(1);
        });
    });

    describe('\b.decorate', () => {
        it('should throw error if the service to be decorated does not yet exist', () => {
            expect(() => container.decorate('test', () => undefined)).toThrowError(Error);
        });

        it('should decorate the service definition JIT and only once', () => {
            const service = {};
            let callCount = 0;

            container.addService('test', () => service);
            container.decorate('test', (decoratedService) => {
                expect(decoratedService).toBe(service);
                ++callCount;
            });

            expect(callCount).toBe(0);
            expect(container.get('test')).toBe(service);
            expect(callCount).toBe(1);
            expect(container.get('test')).toBe(service);
            expect(callCount).toBe(1);
        });
    });

    describe('\b.loadConfigFromFile', () => {
        class TestClass { constructor(public arg0?: any, public arg1?: any) {} }

        it('should throw error if a service is defined without class', () => {
            const fileName = Math.random().toString(36),
                serviceDefinition = {test1: {}};

            fs = (fn) => JSON.stringify(fn === fileName ? serviceDefinition : {});

            expect(() => container.loadConfigFromFile(fileName)).toThrowError(Error);
        });

        it('should create new instances of the class that was required', () => {
            const fileName = Math.random().toString(),
                requiredClass = getRandomClassName(),
                serviceDefinition = {test1: {class: requiredClass}}
            ;

            fs = (fn) => JSON.stringify(fn === fileName ? serviceDefinition : {});
            require = (id) => {
                expect(id).toBe(requiredClass);

                return TestClass;
            };

            container.loadConfigFromFile(fileName);
            const service = container.get('test1');

            expect(service).toBeInstanceOf(TestClass);
        });

        it('should defer the new method to default if default import exists', () => {
            const fileName = Math.random().toString(),
                requiredClass = getRandomClassName(),
                serviceDefinition = {test1: {class: requiredClass}};

            fs = (fn) => JSON.stringify(fn === fileName ? serviceDefinition : {});
            require = (id) => {return id === requiredClass ? {default: TestClass} : {}};

            container.loadConfigFromFile(fileName);
            const service = container.get('test1');

            expect(service).toBeInstanceOf(TestClass);
        });

        it('should pass the values in the arguments configuration to the constructor', () => {
            const fileName = Math.random().toString(),
                requiredClass = getRandomClassName(),
                serviceDefinition = {test1: {class: requiredClass, arguments: [Math.random(), Math.random().toString()]}};

            fs = (fn) => JSON.stringify(fn === fileName ? serviceDefinition : {});
            require = (id) => id === requiredClass ? TestClass : {};

            container.loadConfigFromFile(fileName);
            const test = container.get('test1');

            expect(test.arg0).toBe(serviceDefinition.test1.arguments[0]);
            expect(test.arg1).toBe(serviceDefinition.test1.arguments[1]);
        });

        it('should transform strings in the arguments starting with @ to corresponding services', () => {
            const fileName = Math.random().toString(),
                requiredClass = getRandomClassName(),
                serviceDefinition = {
                    test1: {class: requiredClass, arguments: ['@test2']},
                    test2: {class: requiredClass}
                };

            fs = (fn) => JSON.stringify(fn === fileName ? serviceDefinition : {});
            require = (id) => id === requiredClass ? TestClass : {};

            container.loadConfigFromFile(fileName);
            const test1 = container.get('test1'),
                test2 = container.get('test2');

            expect(test1.arg0).toBe(test2);
            expect(test2.arg0).toBe(undefined);
        });

        it('should throw error when recursive injection detected at get time', () => {
            const fileName = Math.random().toString(),
                requiredClass = getRandomClassName(),
                serviceDefinition = {
                    test1: {class: requiredClass, arguments: ['@test2']},
                    test2: {class: requiredClass, arguments: ['@test1']}
                };

            fs = (fn) => JSON.stringify(fn === fileName ? serviceDefinition : {});
            require = (id) => id === requiredClass ? TestClass : {};

            container.loadConfigFromFile(fileName);
            expect(() => container.get('test1')).toThrowError(RecursiveDependencyInjection);
        });

        it('should resolve dots in the class name as retrieving members of require', () => {
            const fileName = Math.random().toString(),
                requiredClass = getRandomClassName(),
                serviceDefinition = {test1: {class: requiredClass+'.property'}}
            ;

            fs = (fn) => JSON.stringify(fn === fileName ? serviceDefinition : {});
            require = (id) => {
                expect(id).toBe(requiredClass);

                return {property: TestClass};
            };

            container.loadConfigFromFile(fileName);
            const service = container.get('test1');

            expect(service).toBeInstanceOf(TestClass);
        });

        it('should allow for the required class not to be a constructor, but an instance', () => {
            const fileName = Math.random().toString(),
                requiredClass = getRandomClassName(),
                serviceDefinition = {test1: {class: requiredClass+'.prop.instance'}},
                instance = new TestClass()
            ;

            fs = (fn) => JSON.stringify(fn === fileName ? serviceDefinition : {});
            require = (id) => {
                expect(id).toBe(requiredClass);

                return {prop: {instance: instance}};
            };

            container.loadConfigFromFile(fileName);
            const service = container.get('test1');

            expect(service).toBeInstanceOf(TestClass);
            expect(service).toBe(instance);
        });

        it('should allow for the required class not to be a constructor, but a factory', () => {
            const fileName = Math.random().toString(),
                requiredClass = getRandomClassName(),
                serviceDefinition = {test1: {class: requiredClass, arguments: [Math.random(), Math.random()]}};

            fs = (fn) => JSON.stringify(fn === fileName ? serviceDefinition : {});
            require = (id) => {
                expect(id).toBe(requiredClass);

                return (arg0: any, arg1: any) => new TestClass(arg0, arg1);
            };

            container.loadConfigFromFile(fileName);
            const service = container.get('test1');

            expect(service).toBeInstanceOf(TestClass);
            expect(service.arg0).toBe(serviceDefinition.test1.arguments[0]);
            expect(service.arg1).toBe(serviceDefinition.test1.arguments[1]);
        });
    });

    describe('\b.close', () => {
        class TestClass {}

        it('should throw error if the container was already closed', () => {
            expect(container.close()).toBe(container);
            expect(() => container.close()).toThrowError(Error);
        });

        it('should cause errors to be thrown when tagged services are added to the container while closed', () => {
            container.close();
            expect(() => container.addService('test', () => undefined)).toThrowError();
        });

        it('should resolve service tags through the correct TagResolvers', () => {
            let callCount = 0;
            const fileName = Math.random().toString(),
                requiredClass = Math.random().toString(),
                tagName1 = 'testTag1',
                tagName2 = 'testTag2',
                serviceDefinition = {test1: {
                    class: requiredClass,
                    tags: [{name: tagName1}, {name: tagName1, var: 'var'}, {name: tagName2}]
                }},
                tagResolver1 = new Mock<TagResolver>({
                    resolve(cont: Container, sn: string, tag: any): void {
                        expect(container).toBe(container);
                        expect(sn).toBe('test1');
                        if (callCount === 0) {
                            expect(tag).toEqual(serviceDefinition.test1.tags[0]);
                            ++callCount;
                        } else {
                            expect(tag).toEqual(serviceDefinition.test1.tags[1]);
                        }
                    }
                }),
                tagResolver2 = new Mock<TagResolver>({
                    resolve(cont: Container, sn: string, tag: any): void {
                        expect(container).toBe(container);
                        expect(sn).toBe('test1');
                        expect(tag).toEqual(serviceDefinition.test1.tags[2]);
                    }
                });

            fs = (fn) => JSON.stringify(fn === fileName ? serviceDefinition : {});
            require = (id) => id === requiredClass ? TestClass : {};

            container.loadConfigFromFile(fileName);
            container.addTagResolver(tagName1, tagResolver1.Object);
            container.addTagResolver(tagName2, tagResolver2.Object);

            expect(tagResolver1.Object.resolve).toHaveBeenCalledTimes(0);
            expect(tagResolver2.Object.resolve).toHaveBeenCalledTimes(0);
            container.close();
            expect(tagResolver1.Object.resolve).toHaveBeenCalledTimes(2);
            expect(tagResolver2.Object.resolve).toHaveBeenCalledTimes(1);
        });

        it('should throw error if a tag exists without a name', () => {
            const fileName = Math.random().toString(),
                requiredClass = Math.random().toString(),
                serviceDefinition = {test1: {class: requiredClass, tags: [{}]}};

            fs = (fn) => JSON.stringify(fn === fileName ? serviceDefinition : {});
            require = (id) => id === requiredClass ? TestClass : {};

            container.loadConfigFromFile(fileName);

            expect(() => container.close()).toThrowError(MissingTagName);
        });

        it('should log missing tag resolver if logger service is available', () => {
            const fileName = Math.random().toString(),
                requiredClass = Math.random().toString(),
                tagName = Math.random().toString(),
                logger = new Mock<Logger>({
                    debug(message: string): void {
                        expect(message).toContain(tagName);
                    }
                }),
                serviceDefinition = {test1: {class: requiredClass, tags: [{name: tagName}]}};

            fs = (fn) => JSON.stringify(fn === fileName ? serviceDefinition : {});
            require = (id) => id === requiredClass ? TestClass : {};

            container.loadConfigFromFile(fileName);
            container.addService('logger', () => logger.Object);
            container.close();

            expect(logger.Object.debug).toHaveBeenCalledTimes(1);
        });
    });
});
