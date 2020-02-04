'use babel';

import { BufferedNodeProcess, CompositeDisposable } from 'atom';
import fs from 'fs';
import path from 'path';
import process from 'process';

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

  lintSolidity(textEditor) {
    return new Promise((resolve, reject) => {
      new BufferedNodeProcess({
        command: path.resolve(__dirname, 'compiler.js'),
        args: [textEditor.getPath()],
        stdout(output) {
          resolve(JSON.parse(output))
        },
        stderr(err) {
          reject(err)
        }
      })
    })
  },

  provideLinter() {
    return {
      name: 'Solidity',
      grammarScopes: ['source.solidity'], // ['*'] will get it triggered regardless of grammar
      scope: 'file', // or 'project'
      lintOnFly: false,
      lint: this.lintSolidity
    }
  }

};
