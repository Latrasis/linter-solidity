'use babel';

import { CompositeDisposable } from 'atom';
import fs from 'fs';
import solc from 'solc';
import path from 'path';

module.exports = {

  demoView: null,
  modalPanel: null,
  subscriptions: null,

  activate() {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'demo:provideLinter': () => this.provideLinter()
    }));
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  provideLinter() {

    function parseErrors(dirPath, errors) {
      return errors
        .map(err => {
          if(err.includes('Internal compiler error')) return {text: err, filePath};

          const filePath = path.resolve(dirPath, err.match(/\w+\.sol/)[0])
          const raw_error_range = err.match(/\:\d+:\d+\:/)[0].split(':').slice(1,3)
          const line = parseInt(raw_error_range[0])-1;

          const raw_error_range_segment = err.split('Error:')[1].split('\n')[2];

          const start= raw_error_range_segment.indexOf('^')
          const end = raw_error_range_segment.lastIndexOf('^')

          const text = err.split('Error:')[1].split('\n')[0];

          return {text, filePath, range: [[line, start], [line, end]]}
        })
        .map(err => {err.type = 'Error'; return err})
    }

    function findImports(dirPath) {
      return function(file) {
        console.log(file)
        try {
          return {contents: fs.readFileSync(path.resolve(dirPath, file), 'utf8')}
        } catch(err) {
          return {error: err}
        }
      }
    }

    return {
      name: 'Solidity',
      grammarScopes: ['source.solidity'], // ['*'] will get it triggered regardless of grammar
      scope: 'file', // or 'project'
      lintOnFly: false,
      lint: function(textEditor) {
        const dirPath = path.dirname(textEditor.getPath())
        const input = {}; input[path.basename(textEditor.getPath())] = textEditor.getText();

        return Promise
          .resolve(solc.compile({sources: input}, 1, findImports(dirPath)))
          .then(output => output.errors ? parseErrors(dirPath, output.errors): [])
      }
    }
  }

};
