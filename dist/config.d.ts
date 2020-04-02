/// <reference types="webpack-dev-server" />
import { Configuration } from 'webpack';
export interface FileConfig {
    useDescription?: boolean;
    mode?: 'development' | 'production' | 'none';
    platform?: 'wx' | 'ali' | 'swan' | 'qq' | 'tt';
    projects: string[];
    _isSingle: boolean;
    srcDir: string;
    outputDir: string;
    copyDirs?: string[];
    webpackConfiguration: Configuration | Function;
}
export declare const defaultConfig: FileConfig;
export declare function validate(config: Configuration): Promise<FileConfig>;
