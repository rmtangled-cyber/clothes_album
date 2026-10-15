# album（clothes_album）

コーデ写真を保存して、どのアイテムを使ったか管理するアプリ。
「前と同じ服だ」と思われないように、誰と会った日に何を着たかを振り返れます。

## できること（v0.1）

- **コーデ**：写真（友達と写った写真でもOK）・日付・一緒にいた人・メモ・使ったアイテムを登録
- **コーデ一覧**：日付の新しい順。一緒にいた人で絞り込み
- **アイテム**：トップス／ボトムス／アウター…などのカテゴリで絞り込み
- **並び替え**：「最近着てない順」「よく着る順」
- **アイテム詳細**：そのアイテムを使ったコーデの一覧と、最後に着た日

データはすべて端末の中（SQLite＋写真ファイル）に保存されます。サーバーは使っていません。

## Web版で使う（いちばん手軽）

https://rmtangled-cyber.github.io/clothes_album/

iPhoneのSafariで開いて「共有」→「ホーム画面に追加」すると、アプリのように使えます。
`main` ブランチにpushすると、GitHub Actionsで自動的に更新されます。

- データ（記録と写真）はそのブラウザの中にだけ保存されます。別の端末やアプリ版とは共有されません
- Safariで直接開くより、ホーム画面に追加して使う方がデータが消えにくくなります

## iPhoneアプリとして動かす（Windows PC＋Expo Go）

事前に必要なもの：Node.js（LTS）、Git、iPhoneに「Expo Go」アプリ。PCとiPhoneは同じWi-Fiにつなぐ。

初回だけ：

```powershell
cd $HOME\Documents
git clone https://github.com/rmtangled-cyber/clothes_album.git
cd clothes_album
npm install
```

起動するたび：

```powershell
cd $HOME\Documents\clothes_album
git pull
npm install
npx expo start
```

ターミナルに出たQRコードをiPhoneのカメラで読み取ると、Expo Goでアプリが開きます。

- 初回にWindowsファイアウォールの確認が出たら「許可」を押す
- つながらないときは `npx expo start --tunnel` を試す

## 技術メモ

- Expo SDK 57 / Expo Router（画面は `src/app/`）
- データ保存はiPhoneアプリ版とWeb版で実装が別（Metroのプラットフォーム拡張子で切り替え）
  - アプリ版：expo-sqlite（`src/db/queries.ts`）。スキーマ変更は `src/db/migrate.ts` にバージョンを上げて追加する
  - Web版：IndexedDB（`src/db/queries.web.ts`）。両方とも同じ関数を公開している
- 写真
  - アプリ版：アプリのドキュメントフォルダにコピーし、DBにはファイル名だけ保存（`src/lib/photos.ts`）
  - Web版：縮小してIndexedDBに保存（`src/lib/photos.web.ts`）
- 型チェック：`npm run typecheck`、Lint：`npm run lint`
