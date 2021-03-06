import ParamConverter from "$stafleu/Component/ParamConverter";

export default class StringConverter implements ParamConverter
{
    supports(name: string): boolean
    {
        return name.substr(0, 6) === 'string';
    }

    convert(name: string, value: string): { position: number; value: string }
    {
        return {
            position: parseInt(name.substr(6)),
            value: value
        }
    }
}
