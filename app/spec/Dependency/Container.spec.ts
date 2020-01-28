import Container from "$stafleu/Dependency/Container";
import {Mock} from "ts-mocks";

describe('Container', () => {
    let container: Container, pathToRoot: string, fs = new Mock<(filename: string) => string>();

    beforeEach(() => {
        pathToRoot = './'+Math.random();
        container = new Container(pathToRoot, fs.Object);
    });

    describe('get', () => {
        it('Should throw error if service has not been added previously', () => {
            expect(() => container.get('some_service_name')).toThrow();
        });

        it('Should resolve service definition when service is retrieved for the first time');
        it('Should not resolve service definition when service is retrieved for the second time');
    });

});
