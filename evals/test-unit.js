#!/usr/bin/env node
// Eval "test-unit": corre la suite completa con node --test y sale con su mismo código (≠ 0 si falla algún test).
'use strict';
const { spawnSync } = require('child_process');
const path = require('path');

const r = spawnSync(process.execPath, ['--test'], { cwd: path.resolve(__dirname, '..'), stdio: 'inherit' });
process.exit(r.status === null ? 1 : r.status);
