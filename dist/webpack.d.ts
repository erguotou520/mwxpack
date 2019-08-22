/// <reference types="webpack-dev-server" />
import { Configuration } from 'webpack';
import { FileConfig } from './config';
export default function generateConfig(config: FileConfig | null, mode: 'development' | 'production' | 'none'): Configuration[];
