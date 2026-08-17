<p align="right">
  <a href="README.md">🇬🇧 English</a> · <a href="README.ko.md">🇰🇷 한국어</a>
</p>

# 스타폴 (Starfall) — 한국어 fork

> Homeworld 스타일의 우주 RTS가 브라우저에서 실행됩니다 — 모든 것이 절차적으로 생성되는 한국어판.

| 페이지 | URL |
|---|---|
| 🎮 라이브 데모 | https://sigco3111.github.io/starfall/ |
| 📦 원본 (영문) | https://e01.ai/starfall/ |
| 🔧 원본 소스 | https://github.com/e01-ai/starfall |
| 🍴 이 fork | https://github.com/sigco3111/starfall |

![A fleet engagement in Starfall](https://sigco3111.github.io/starfall/og.jpg)

## 무엇이 다른가

원본 [`e01-ai/starfall`](https://github.com/e01-ai/starfall)에서 파생된 **독립 포크**입니다. 한 프롬프트로 Claude Opus 5가 작성한 우주 RTS를 한국어로 플레이할 수 있도록 모든 플레이어 가시 텍스트를 한국어화했습니다.

| 영역 | 상태 |
|---|---|
| 부팅 화면 (boot) | ✅ 한국어 (`applyStatic`가 런타임에 `data-i18n` 노드 채움) |
| 상단 HUD (자원·보급·함대·작전·경과) | ✅ 한국어 |
| 명령 바 (이동·공격·정지·채집·귀환) | ✅ 한국어 |
| 편대 (6종) + 스탠스 (4종) | ✅ 한국어 |
| 13종 함선 클래스 표시 이름 | ✅ 한국어 (`shipDisplayName()`) |
| 생산 패널 (생산·연구·집결지·연구 트리) | ✅ 한국어 |
| 함대 명단 바 (IDLE 칩) | ✅ 한국어 |
| 센서 매니저 미니맵 배너 | ✅ 한국어 |
| 메뉴 (조작·크레딧·오디오·마스터/효과음/음악) | ✅ 한국어 |
| 인게임 크레딧 (Homeworld 헌정·Claude Opus 5·OpenGameArt·Kenney) | ✅ 한국어 (브랜드·저작자명 보존) |
| 노스크립트 fallback (검색엔진·JS OFF 사용자용) | ✅ 한국어 |
| `<title>`, `<meta description>`, OpenGraph, Twitter Card | ✅ 한국어 + 정직한 GitHub Pages URL |
| GitHub Pages 배포 (`/starfall/`) | ✅ 정적 SPA |

**보존된 것**: 13종 함선 코드네임(Probe Scout/Talon Interceptor/...), 브랜드(Homeworld, Claude Opus 5, Mike Luan, Vite, TypeScript, Three.js, e01.ai), 라이선스(MIT), 엔진 동작, 시뮬레이션 로직.

**한국어 명명 규칙**: 함선 코드네임은 영문 그대로 두고 뒤에 한국어 직함을 붙입니다 (예: `Probe Scout 정찰기`, `Hammer Corvette 돌격 호위함`). 사용자가 친숙한 영문 코드를 유지하면서도 게임 내 의미를 즉시 알 수 있게 합니다.

## 빠른 시작

```bash
git clone https://github.com/sigco3111/starfall.git
cd starfall
npm install
npm run dev    # http://localhost:5173/starfall/
```

빌드:

```bash
npm run build  # tsc --noEmit && vite build → dist/
```

GitHub Pages 배포는 `gh-pages` 분기에 빌드 산출물(`dist/` + `public/` 자산)이 직접 커밋되어 있습니다. 자동 배포는 Pages의 "Deploy from a branch" 설정(`gh-pages` / root)에 의존합니다.

## 조작

원본과 동일 — 게임 내 F1 (또는 Esc) 키로 메뉴를 열어 조작 키맵을 확인하세요.

| 키 | 동작 |
|---|---|
| `M` | 이동 |
| `A` | 공격 |
| `S` | 정지 |
| `H` | 채집 |
| `D` | 귀환 |
| `1`–`6` | 편대 |
| `Z` `X` `C` `V` | 스탠스 |
| `F1` / `Esc` | 메뉴 |

## 13종 함선 클래스

코드네임은 gameplay 식별자로 영문 보존, UI 표시는 한국어:

| 코드네임 (영문) | 한국어 표시 | 종류 |
|---|---|---|
| Probe Scout | Probe Scout 정찰기 | 정찰기 |
| Talon Interceptor | Talon Interceptor 요격기 | 요격기 |
| Lance Bomber | Lance Bomber 폭격기 | 폭격기 |
| Hammer Corvette | Hammer Corvette 돌격 호위함 | 호위함 |
| Quiver Corvette | Quiver Corvette 미사일 호위함 | 호위함 |
| Lumen Ion Frigate | Lumen Ion Frigate 이온 프리깃 | 프리깃 |
| Bulwark Frigate | Bulwark Frigate 방패 프리깃 | 프리깃 |
| Aegis Destroyer | Aegis Destroyer 방패 구축함 | 구축함 |
| Sovereign Cruiser | Sovereign Cruiser 주권 순양함 | 순양함 |
| Ladle Collector | Ladle Collector 수집기 | 유틸리티 |
| Crucible Refinery | Crucible Refinery 정련소 | 지원함 |
| Anvil Carrier | Anvil Carrier 모루 항공모함 | 캐피탈 |
| Starfall Mothership | Starfall Mothership 모선 | 슈퍼캐피탈 |

## 빌드와 배포

- **빌드 도구**: Vite 7 + TypeScript 5.9 + Three.js 0.185
- **번들 크기**: ~1.3 MB (gzip 427 KB)
- **WebGL 2** 필수
- **정적 SPA** — 서버 렌더링 없음, Pages / Vercel / 어떤 정적 호스팅에든 `dist/` 업로드로 끝
- **i18n 모듈**: `src/i18n.ts` (KO/EN 평탄 dict + `t()` + `setLanguage()` + `shipDisplayName()`)

## 원본 attribution

이 fork는 다음 원본에서 파생되었습니다:

- **원본**: [e01-ai/starfall](https://github.com/e01-ai/starfall) (commit at fork time)
- **원본 저자**: Mike Luan (e01.ai)
- **원본 집필**: Claude Opus 5 (한 프롬프트 기반 멀티 에이전트 워크플로)
- **원본 라이선스**: [MIT](LICENSE) (Copyright (c) 2026 e01.ai)
- **원본 페이지**: https://e01.ai/starfall/

**이 fork의 추가분**: 한국어 번역 + GitHub Pages 배포 (sigco3111/starfall).

**이 fork의 라이선스**: [MIT](LICENSE) (Copyright (c) 2026 sigco3111). 한국어 텍스트도 같은 MIT 라이선스 하에 배포됩니다 — 원본과 동일한 조건으로 자유롭게 사용·수정·배포 가능.

## 정확도

이 fork는 원본의 동작을 변경하지 않습니다 — 시뮬레이션·렌더링·자산·오디오 모두 동일합니다. 유일한 변경은:

1. **번역 데이터**: `src/i18n.ts`에 한국어 dict 추가 + 모든 사용자 가시 리터럴을 `t()` 호출로 감쌈
2. **부팅 화면**: `index.html`의 `lang="en"` → `"ko"`, 메타 설명·타이틀·OpenGraph 한국어화, 부팅 텍스트 `data-i18n` 속성 부여
3. **배포 설정**: `vite.config.ts`의 `base: './'` → `'/starfall/'` (GitHub Pages 경로)
4. **정직함**: 원본 e01.ai 도메인을 가리키던 canonical/og:url/og:image/sitemap/robots 모두 sigco3111.github.io로 정직 갱신 + 부팅 푸터에 fork 정보 명시

빌드는 `tsc --noEmit && vite build`로 1초 이내 통과하며 0 에러입니다.

## 상태 뱃지

![Live](https://img.shields.io/badge/Live-sigco3111.github.io%2Fstarfall--korea-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Upstream](https://img.shields.io/badge/Upstream-e01--ai%2Fstarfall-orange)
![Korean fork](https://img.shields.io/badge/i18n-KO%2FEN-yellow)