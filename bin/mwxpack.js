#!/usr/bin/env node
'use strict';

const cli = require('../dist/cli').default
cli(process.argv.slice(2))
