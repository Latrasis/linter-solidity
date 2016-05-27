'use babel';

import Demo from '../lib/linter.js';

// Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
//
// To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
// or `fdescribe`). Remove the `f` to unfocus the block.

describe('Demo', () => {
  let workspaceElement, activationPromise;

  beforeEach(() => {
    workspaceElement = atom.views.getView(atom.workspace);
    activationPromise = atom.packages.activatePackage('linter-solidity');
  });

  describe('when solc lints', () => {
    it('shows no errors on no errors')
    it('shows an error on a syntax error')
    it('shows an error on a compiler error')
  });
});
