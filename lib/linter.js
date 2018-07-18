'use babel';

import { BufferedNodeProcess, CompositeDisposable } from 'atom';
import path from 'path';

module.exports = {

  demoView: null,
  modalPanel: null,
  subscriptions: null,

  config: {
    includes: {
      title: 'External Includes',
      description: 'List of directories to look for external .sol modules',
      type: 'array',
      default: ['node_modules'],
      items: {
        title: 'External Directory',
        description: 'An external directory for finding external .sol files',
        type: 'string',
        default: ''
      }
    }
  },

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

      const includes = this.config.get('linter-solidity.includes');
      const args = [textEditor.getPath()].concat(includes);

      new BufferedNodeProcess({
        command: path.resolve(__dirname, 'compiler.js'),
        args: args,
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
