import Container from "$stafleu/Dependency/Container";
import {Mock} from "ts-mocks";

describe('Container', () => {
    let container: Container,
        fs: Mock<(filename: string) => string>,
        require: Mock<NodeRequire>;

    beforeEach(() => {
        fs = new Mock<(filename: string) => string>();
        require = new Mock<NodeRequire>();
        container = new Container(fs.Object, require.Object);
    });

    describe('::get', () => {
        it('should throw error if service has not been added previously', () => {
            expect(() => container.get('some_service_name')).toThrow();
        });

        it('should resolve service definition when service is retrieved for the first time');
        it('should not resolve service definition when service is retrieved for the second time');
    });

    describe('::decorate', () => {
        it('should decorate the service definition JIT');
        it('should throw error if the service to be decorated does not yet exist');
    });

    describe('::loadConfigFromFile', () => {
        it('should throw error if a service is defined without class or module');
        it('should create new instances of the class that was required');
        it('should create new instances of the module that was required');
        it('should defer the new method to default if default import exists');
        it('should pass the values in the arguments configuration to the constructor');
        it('should transform strings in the arguments starting with @ to corresponding services');
        it('should resolve tags on the service JIT');
        it('should throw error if a tag exists without a name');
    });

    describe('::close', () => {
        it('should throw error if the container was already closed');
        it('should cause errors to be thrown when tagged services are added to the container while closed');
        it('should resolve tags');
    });
});
