/// <reference types="webpack-dev-server" />
import { Configuration } from 'webpack';
export interface FileConfig {
    projects: string[] | string;
    srcDir?: string;
    outputDir?: string;
    copyDirs?: string[];
    webpackConfiguration: Configuration | Function;
}
export declare function validate(config: Configuration): Promise<FileConfig>;
