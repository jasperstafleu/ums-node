import ParamConverter from "$stafleu/Component/ParamConverter";

export default class NumberConverter implements ParamConverter
{
    supports(name: string): boolean
    {
        return name.substr(0, 6) === 'number';
    }

    convert(name: string, value: string): { position: number; value: number }
    {
        return {
            position: parseInt(name.substr(6)),
            value: parseFloat(value)
        }
    }
}
