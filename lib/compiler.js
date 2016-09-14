'use babel';

const fs = require('fs')
const solc = require('solc')
const path = require('path')

const rawFilePath = process.argv[2];

const dirPath = path.dirname(rawFilePath)
var filePath = path.basename(rawFilePath)
const input = {}; input[filePath] = fs.readFileSync(rawFilePath, 'utf8');

function parseErrors(dirPath, errors) {

  return errors
    .map(err => {
      if(err.includes('Internal compiler error')) return {text: err, filePath};

      const filePath = path.resolve(dirPath, err.match(/\w+\.sol/)[0])
      const raw_error_range = err.match(/\:\d+:\d+\:/)[0].split(':').slice(1,3)
      const line = parseInt(raw_error_range[0])-1;

      const raw_error_range_segment = err.split(/Error:|Warning:/)[1].split('\n')[2];

      const start= raw_error_range_segment.indexOf('^')
      const end = raw_error_range_segment.lastIndexOf('^')+1

      const text = err.split(/Error:|Warning:/)[1].split('\n')[0];

      return {text, filePath, range: [[line, start], [line, end]]}
    })
    .map(err => {err.type = 'Error'; return err})
}

function findImports(dirPath) {
  return function(file) {
    try {
      return {contents: fs.readFileSync(path.resolve(dirPath, file), 'utf8')}
    } catch(err) {
      return {error: err}
    }
  }
}

const output = solc.compile({sources: input}, 1, findImports(dirPath))
const parsed = output.errors ? parseErrors(dirPath, output.errors): [];

process.stdout.write(JSON.stringify(parsed), 'utf8');
process.exit();
