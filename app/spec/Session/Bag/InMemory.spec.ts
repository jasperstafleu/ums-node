import InMemory from "$stafleu/Session/Bag/InMemory";

describe('InMemory', () => {
    let bag: InMemory;

    beforeEach(() => {
        bag = new InMemory();
    });

    describe('\b.getId', () => {
        it('should return a newly generated ID when no Id was set yet, and keep that id for future calls', () => {
            const id = bag.getId();

            expect(bag.getId()).toBe(id);
        });
    });

    describe('\b.setId', () => {
        it('should make the id that has been set to be returned by getId', () => {
            const id = Math.random().toString(36);

            bag.setId(id);

            expect(bag.getId()).toBe(id);
        });
    });

    describe('\b.exists', () => {
        it('should return false by default', () => {
            expect(bag.exists()).toBeFalse();
        });

        it('should not return true when ID has been set but no values have been set', () => {
            bag.setId(Math.random().toString(36));
            expect(bag.exists()).toBeFalse();
        });

        it('should return false when ID has been generated but no values have been set', () => {
            bag.getId();
            expect(bag.exists()).toBeFalse();
        });

        it('should return true when a value has been set', () => {
            bag.set(Math.random().toString(36), Math.random());
            expect(bag.exists()).toBeTrue();
        });
    });

    describe('\b.reset', () => {
        it('should cause exists to be false after the bag has been reset', () => {
            bag.set(Math.random().toString(36), Math.random());
            expect(bag.exists()).toBeTrue();

            bag.reset();
            expect(bag.exists()).toBeFalse();
        });

        it('should not cause values that have been set to be lost', () => {
            const key = Math.random().toString(36), value = Math.random();

            bag.set(key, value);
            expect(bag.exists()).toBeTrue();
            const sessId = bag.getId();

            bag.reset();
            expect(bag.exists()).toBeFalse();
            expect(bag.get(key)).not.toBe(value);
            bag.set(key, 'not'+value);
            expect(bag.get(key)).not.toBe(value);

            bag.reset();
            expect(bag.exists()).toBeFalse();
            bag.setId(sessId);
            expect(bag.exists()).toBeTrue();
            expect(bag.get(key)).toBe(value);
        });
    });

    describe('\b.set', () => {
        let key: string, value: any;

        beforeEach(() => {
            key = Math.random().toString(36);
            value = Math.random();
        });

        it('should generate an ID if non had been set yet', () => {
            bag.set(key, value);
            expect(bag.getId()).not.toBeUndefined();
        });

        it('should create memory space for values even if id had been set through other means', () => {
            bag.setId(Math.random().toString());
            bag.set(key, value); // No error thrown: OK
        });

        it('should cause exists to go from false to true', () => {
            bag.set(key, value);
            expect(bag.exists()).toBeTrue();
        });

        it('should store the key in a id based store', () => {
            bag.set(key, value);
            expect(bag.get(key)).toBe(value);
        });
    });

    describe('\b.get', () => {
        let key: string, value: any;

        beforeEach(() => {
            key = Math.random().toString(36);
            value = Math.random();
        });

        it('should return values previously set through set', () => {
            bag.set(key, value);
            expect(bag.get(key)).toBe(value);
        });

        it('should return values previously set even after a reset followed by a set', () => {
            bag.set(key, value);

            const sessId = bag.getId();
            bag.reset();

            expect(bag.get(key)).not.toBe(value);
            bag.reset();

            bag.setId(sessId);
            expect(bag.get(key)).toBe(value);
        });

        it('should return undefined if the session does not exist', () => {
            expect(bag.exists()).toBeFalse();
            expect(bag.get(key)).toBeUndefined();
        });

        it('should return undefined if the session is empty', () => {
            bag.set(key, value); // set the key, then remove it. We should now have an empty session
            bag.remove(key);

            expect(bag.exists()).toBeTrue();
            expect(bag.get(key)).toBeUndefined();
        });

        it('should return undefined if the key does not exist in the session', () => {
            bag.set('not'+key, value); // set different key.

            expect(bag.exists()).toBeTrue();
            expect(bag.get(key)).toBeUndefined();
        });
    });

    describe('\b.remove', () => {
        let key: string, value: any;

        beforeEach(() => {
            key = Math.random().toString(36);
            value = Math.random();
        });

        it('should remove a key from the session', () => {
            bag.set(key, value);
            expect(bag.get(key)).toBe(value);

            bag.remove(key);
            expect(bag.get(key)).toBeUndefined();
        });

        it('should not raise an error if the session does not exist', () => {
            expect(bag.exists()).toBeFalse();
            bag.remove(key); // Expect no error!
        });

        it('should not raise an error if the key does not exist', () => {
            bag.set(key, value); // set the key, then remove it. We should now have an empty session
            bag.remove(key);

            expect(bag.exists()).toBeTrue();

            bag.remove(key); // Expect no error!
        });
    });

    it('should generate unique ids', () => {
        const ids: {[key: string]: number} = {};

        for (let it = 1e6; it >= 0; --it) {
            bag.set('key', it);
            expect(ids[bag.getId()]).toBeUndefined();

            ids[bag.getId()] = 0;
            bag.reset();
        }
    });
});
