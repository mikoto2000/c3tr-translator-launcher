```sh
npm create tauri-app@latest -- --rc
```

コンポーネントライブラリ追加。

```sh
npm install @mui/material @emotion/react @emotion/styled
```

ダイアログ用プラグイン追加。

```sh
cargo add tauri-plugin-dialog
npm add @tauri-apps/plugin-dialog
cargo add tauri-plugin-fs
npm add @tauri-apps/plugin-fs
```

入力記憶用に Store プラグインを追加。

```sh
cargo add tauri-plugin-store
npm add @tauri-apps/plugin-store
```

ファイルダウンロード用にクレートを追加

```sh
cargo add reqwest
```

GitHub API 操作用にクレートを追加

```sh
cargo add octocrab
```

zip を扱うためにクレートを追加

```sh

```
