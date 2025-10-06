module.exports = {
  // ... プロジェクトの他の設定
  output: {
    // ...
    client: 'react-query',
    clientOptions: {
      reactQuery: {
        // ↓ この行を追加します
        useTypeOverloads: false,
      }
    }
  },
  input: {
    // ...
  }
  // ...
};