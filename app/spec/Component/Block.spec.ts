import Block from "$stafleu/Component/Block";

describe('Block', () => {
    describe('\b.await', () => {
        it('should return the promise resolution without async/await', () => {
            const resolvedValue = Math.random();
            const promise = Promise.resolve(resolvedValue);

            const result = Block.await(promise);

            expect(result).toBe(resolvedValue);
        });
    });
});
