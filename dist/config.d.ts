/// <reference types="webpack-dev-server" />
import { Configuration } from 'webpack';
export interface FileConfig {
    mode?: 'development' | 'production' | 'none';
    projects?: string[];
    srcDir?: string;
    outputDir?: string;
    copyDirs?: string[];
    webpackConfiguration: Configuration | Function;
}
export declare function validate(config: Configuration): Promise<FileConfig>;
