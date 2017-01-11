#!/usr/bin/env node

var gen = require('./dist/index.js');
gen.process('./tmp/input', './tmp/output');
