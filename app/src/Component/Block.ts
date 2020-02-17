export default class Block
{
    static await<T>(promise: Promise<T>): T
    {
        // TODO: This is not thread safe (nor can it be). Check whether the front-controller guarantees this...
        let done = false, result: T|any = null;

        promise.then((res: T) => {
            result = res;
            done = true;
        });

        require('deasync').loopWhile(() => !done);

        return (result as T);
    }
}
