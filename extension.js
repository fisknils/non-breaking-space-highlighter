// Highlight non breakable spaces and other similar non-ascii characters
// Originally created by Possan (https://github.com/possan/nbsp-vscode)

let vscode = require('vscode');

const MAX_DOCUMENT_SIZE = 1048576;

let INVALID_INLINE_CHARS = [
  '\\x82', // High code comma
  '\\x84', // High code double comma
  '\\x85', // Tripple dot
  '\\x88', // High carat
  '\\x91', // Forward single quote
  '\\x92', // Reverse single quote
  '\\x93', // Forward double quote
  '\\x94', // Reverse double quote
  '\\x95',
  '\\x96', // High hyphen
  '\\x97', // Double hyphen
  '\\x99',
  '\\xa0',
  '\\xa6', // Split vertical bar
  '\\xab', // Double less than
  '\\xbb', // Double greater than
  '\\xbc', // one quarter
  '\\xbd', // one half
  '\\xbe', // three quarters
  '\\xbf', // c-single quote
  '\\xa8', // modifier - under curve
  '\\xb1'  // modifier - under line
];

exports.activate = function(context) {
  const whitespaceDecorationType = vscode.window.createTextEditorDecorationType({
    backgroundColor: 'rgba(255,80,0,0.75)'
  });

  vscode.window.onDidChangeActiveTextEditor(editor => {
    activeEditor = editor;
    if (editor) {
      triggerUpdateDecorations();
    }
  }, null, context.subscriptions);

  vscode.workspace.onDidChangeTextDocument(event => {
    if (activeEditor && event.document === activeEditor.document) {
      triggerUpdateDecorations();
    }
  }, null, context.subscriptions);

  let timeout = null;

  function triggerUpdateDecorations() {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(updateDecorations, 500);
  }

  const re1 = new RegExp('[' + INVALID_INLINE_CHARS.join('') + ']+', 'g');

  function updateDecorations() {
    if (!activeEditor) {
      return;
    }

    if (activeEditor.document.length > MAX_DOCUMENT_SIZE) {
        return;
    }

    const text = activeEditor.document.getText();
    const decorations = [];
    let match;

    while (match = re1.exec(text)) {
      const startPos = activeEditor.document.positionAt(match.index);
      const endPos = activeEditor.document.positionAt(match.index + match[0].length);
      const decoration = { range: new vscode.Range(startPos, endPos), hoverMessage: 'Suspicious inline whitespace' };
      decorations.push(decoration);
    }

    activeEditor.setDecorations(whitespaceDecorationType, decorations);
  }

  let activeEditor = vscode.window.activeTextEditor;
  if (activeEditor) {
    triggerUpdateDecorations();
  }
};


exports.deactivate = function() {};