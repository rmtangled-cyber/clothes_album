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

## iPhoneで動かす（Windows PC）

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
- DB：expo-sqlite（`src/db/`）。スキーマ変更は `src/db/migrate.ts` にバージョンを上げて追加する
- 写真：`expo-file-system` でアプリのドキュメントフォルダにコピーし、DBにはファイル名だけ保存（`src/lib/photos.ts`）
- 型チェック：`npm run typecheck`
