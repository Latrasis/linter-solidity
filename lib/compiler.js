'use babel';

const fs = require('fs');
const solc = require('solc');
const path = require('path');

const rawFilePath = process.argv[2];

const dirPath = path.dirname(rawFilePath)
const filePath = path.basename(rawFilePath)
const input = {};
input[filePath] = fs.readFileSync(rawFilePath, 'utf8');

const errorType = {
    DOCSTRING: 0,
    SYNTAX: 1
};

function parseErrors(dirPath, errors) {
    return errors
        .map(function (err) {
            if (err.includes('Internal compiler error')) return {text: err};

            var fPath, raw_error_range, line, start, end, raw_error_range_segment, errorMsg = null;
            var types = [];
            types[errorType.DOCSTRING] = [
                /End of tag (?:[\s\S]*)not found/img,
                /End of param name not found(?:[\s\S]*)/img,
                /Documented parameter "(?:[\s\S]*)" not found in the parameter list of the function\./img,
                /Doc tag @(?:[\s\S]*) not valid for (?:[\s\S]*)\./img
            ];

            var errorInfo = {type: null, regex: null};

            for (var key in types) {
                for (var value in types[key]) {
                    if (err.match(types[key][value]) != null) {
                        errorInfo.type = parseInt(key);
                        errorInfo.regex = types[key][value];
                        break;
                    }
                }
                if(errorInfo.type != null) break;
            }

            switch(errorInfo.type){
                case errorType.SYNTAX:
                    fPath = path.resolve(dirPath, err.match(/\w+\.sol/)[0]);
                    raw_error_range = err.match(/\:\d+:\d+\:/)[0].split(':').slice(1, 3);
                    line = parseInt(raw_error_range[0]) - 1;
                    raw_error_range_segment = err.split('Error:')[1].split('\n')[2];
                    start = raw_error_range_segment.indexOf('^');
                    end = raw_error_range_segment.lastIndexOf('^');
                    errorMsg = err.split('Error:')[1].split('\n')[0];
                    return {text: errorMsg, filePath: fPath, range: [[line, start], [line, end]]};
                    break;
                case errorType.DOCSTRING:
                    errorMsg = err.split('Error:')[1].replace("\n"," ");
                    return {text: errorMsg};
                    break;
                default:
                    return null;
            }
        })
        .map(function (err) {
            err.type = 'Error';
            return err
        });
}

function findImports(dirPath) {
    return function (file) {
        try {
            return {contents: fs.readFileSync(path.resolve(dirPath, file), 'utf8')}
        } catch (err) {
            return {error: err}
        }
    }
}

const output = solc.compile({sources: input}, 1, findImports(dirPath));
const parsed = output.errors ? parseErrors(dirPath, output.errors) : [];

process.stdout.write(JSON.stringify(parsed), 'utf8');
process.exit();
