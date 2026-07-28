<p align="center">
  <img src="public/myo.jpg" alt="GAMERS.lol" width="120" />
</p>

<h1 align="center">GAMERS.lol</h1>
<p align="center">リーグ・オブ・レジェンド 5v5 内戦チーム自動バランサー</p>

---

## 概要

ロビーチャットログを貼り付けるだけで、召喚師10名のランクとレーン希望をもとに最適な5v5チームを自動編成します。

## 主な機能

- **ロビーログ解析** — チャットログから `ニックネーム#タグ` を自動抽出
- **Riot API 連携** — ランクティア・LP・プロフィールアイコンを自動取得
- **レーン希望入力** — 第1希望・第2希望・フィルを各プレイヤーが設定
- **ハンガリアンアルゴリズム** — O(n³) 最小コスト二部マッチングで最適レーン配置を決定
- **Top-K 候補生成** — 126通りの全ロスターから上位10候補を算出
- **再抽選 (재분배)** — 加重ランダムで毎回異なる候補を提示。候補枯渇時は自動で ±3% ジッター再計算

## 使い方

| ステップ | 内容 |
|---|---|
| 1 | ロビーチャットを貼り付けて10名を抽出 |
| 2 | 各プレイヤーのレーン希望を設定 |
| 3 | チーム生成 → 気に入らなければ再抽選 |

## 技術スタック

| 区分 | 内容 |
|---|---|
| フロントエンド | React 19 + TypeScript + Vite |
| アニメーション | GSAP |
| API | Riot Games API (Account V1 / Summoner V4 / League V4) |
| デプロイ | Vercel |

## 対応リージョン

`KR` `JP` `NA` `EUW` `EUNE` `OCE`

## ローカル起動

```bash
cp .env.example .env   # VITE_RIOT_API_KEY を設定
npm install
npm run dev
```

---

<p align="center">
  <a href="https://gamers-lol.vercel.app/ko">🇰🇷 KR</a> ·
  <a href="https://gamers-lol.vercel.app/ja">🇯🇵 JA</a>
</p>
