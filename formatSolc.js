const fs = require('fs')

const SOLJSON_PATH = __dirname + '/node_modules/solc/soljson.js';
const MODULE_OVERRIDE = 'var Module = {"ENVIRONMENT": "NODE"};';

const solSrc = fs.readFileSync(SOLJSON_PATH, 'utf8')

fs.writeFileSync(SOLJSON_PATH, MODULE_OVERRIDE + solSrc)
