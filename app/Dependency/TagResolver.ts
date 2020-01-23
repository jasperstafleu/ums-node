'use strict';

import {Container} from "./Container";

export interface TagResolver
{
    resolve(container: Container, serviceName: string, tag: any): void;
}
