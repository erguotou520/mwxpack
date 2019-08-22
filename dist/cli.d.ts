/// <reference types="webpack-dev-server" />
import { ParsedArgs } from 'minimist';
import { Configuration } from 'webpack';
export declare function parseArg(_args: string[]): {
    service: string;
    args: ParsedArgs;
};
export declare function loadConfiguration(args: ParsedArgs, service: string): Promise<Configuration[]>;
export default function run(_args: string[]): Promise<void>;
