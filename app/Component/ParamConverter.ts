'use strict';

export interface ParamConverter
{
    supports(name: string): boolean;
    convert(name: string, value: string): {position: number, value: any};
}
