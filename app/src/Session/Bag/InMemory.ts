import SessionBag from "$stafleu/Session/Bag/SessionBag";

export default class InMemory implements SessionBag
{
    protected id: string | undefined;
    private values: {[id: string]: {[key: string]: any} | null} = {};

    protected generateSession(): string
    {
        const generator = () => {
            // Generate a long enough pseudo random number as sessionId.
            return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(36)
                + Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(36)
                + Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(36);
        };

        let id: string, it: number;
        for (id = generator(), it = 0; id in this.values; id = generator(), it++) {
            // prevent eternal loops.
            if (it > 1e3) {
                throw new Error('Too many attempts needed to generate session ID, aborting');
            }
        }

        // reserve this key for this thread, preventing race conditions. Not really needed, as InMemory should be threadsafe...
        this.values[id] = null;

        return id;
    }

    getId(): string
    {
        if (!this.id) {
            this.id = this.generateSession();
        }

        return this.id;
    }

    setId(id: string): void
    {
        this.id = id;
    }

    exists(): boolean
    {
        return this.id !== undefined && this.id in this.values && this.values[this.id] !== null;
    }

    reset(): void
    {
        this.id = undefined;
    }

    set(key: string, value: any): this
    {
        if (!this.id) {
            this.id = this.generateSession();
        }

        const values = this.values[this.id] || {};
        values[key] = value;
        this.values[this.id] = values;

        return this;
    }

    get(key: string): any
    {
        if (!this.id) {
            return undefined;
        }

        const values = this.values[this.id];
        return values ? values[key] : undefined;
    }

    remove(key: string): void
    {
        if (!this.id) {
            return;
        }

        const values = this.values[this.id] || {};
        delete values[key];

        this.values[this.id] = values;
    }
}
