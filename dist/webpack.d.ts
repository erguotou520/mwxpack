/// <reference types="webpack-dev-server" />
import { Configuration } from 'webpack';
import { FileConfig } from './config';
export default function generateConfig(config: FileConfig, mode: 'development' | 'production' | 'none', watch: boolean): Configuration[];
