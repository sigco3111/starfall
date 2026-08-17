<p align="right">
  <a href="README.md">🇬🇧 English</a> · <a href="README.ko.md">🇰🇷 한국어</a>
</p>

# 스타폴 (Starfall)

> Homeworld 스타일의 우주 RTS가 브라우저에서 실행됩니다 — 모든 것이 절차적으로 생성됩니다.

| 페이지 | URL |
|---|---|
| 🎮 플레이 | https://sigco3111.github.io/starfall-korea/ |
| 📦 원본 (영문) | https://e01.ai/starfall/ |
| 🔧 소스 | https://github.com/sigco3111/starfall-korea |

Claude Opus 5가 **단 한 번의 프롬프트**로부터 멀티 에이전트 워크플로를 운전해 만든 우주 RTS입니다. 디자인 문서도, 자산 목록도, 아키텍처 명세도 사전에 정해진 것이 없었습니다 — [`prompt.md`](prompt.md)에 그 프롬프트가 그대로 실려 있습니다.

첫 실행 비용: **~$633** — 입력 68.6k 토큰, 출력 4.6M, 캐시 읽기 837.2M, 캐시 쓰기 13.6M.

## 빌드 어디에도 이미지 파일이 없습니다

선체, 텍스처, 행성, 별, 성운, 이펙트 — 모두 코드로 실시간 생성됩니다.

- **선체**는 작성된 단면 형상을 loft한 다음, 예산 기반 패스가 남은 삼각형을 판금·그리블·난간·창문 줄에 사용합니다. 전함과 노이즈의 차이는 노이즈에는 대비할 고요한 장갑이 없다는 점 — 밀도 필드가 어느 곳에 디테일을 **빠뜨릴지** 결정합니다.
- **표면**은 세 스케일의 트라이플래너 절차 디테일 — 장갑 블록·판금·리벳. 타일 크기는 선체 반경에 비례해, 2.1 km 모선과 27 m 요격기가 같은 6 m 판금으로 덮이지 않습니다.
- **행성**은 fBm 노이즈 + 대기 껍질; 하늘은 절차적 성운을 큐브맵에 굽고 PMREM 환경광에 넣어, 함선이 자신이 떠 있는 하늘에 의해 실제로 조명됩니다.

가져온 자산은 오디오뿐이며 전부 CC0 — 인게임 크레딧(CREDITS 메뉴 또는 `F1`)에서 확인.

## 들어있는 것

- **13종 함선 클래스** — 정찰기부터 2 km 모선까지
- **3차원 이동** + Homeworld 이동 디스크 (우클릭 드래그로 고도 지정)
- 편대, 스탠스, 통제 그룹, 함대 명단 바, 밴드 선택, 선체 정확 픽업
- 생산, 연구, 자원 채집, 적 AI
- 충격다이아몬드의 추진 플룸, 기동 곡선 흔적, 이온 창, 운동 에너지 궤적, 방어막, 다단계 폭발
- 교전 강도에 따라 흐르는 스트리밍 스코어

## 한국어 fork 안내

이 저장소는 한국어 fork입니다. 원본은 [e01-ai/starfall](https://github.com/e01-ai/starfall)이며, 한 프롬프트로 만들어진 원본에 한국어 UI를 얹은 것입니다. 원본의 동작은 1줄도 변경하지 않았습니다 — 모든 변경은 번역 데이터 + GitHub Pages 배포 경로 + 정직한 메타 정보에 한정됩니다.

자세한 한국어 fork 안내는 [README.md](README.md) 본문을 참고하세요 (영문/한글 통합).

## 빌드와 배포

```bash
npm install
npm run build     # tsc --noEmit && vite build → dist/
npm run preview   # dist를 :4173에서 서빙
```

WebGL 2가 있는 브라우저가 필요합니다.

## 어떻게 만들어졌나

계약 우선 설계로 각 하위 시스템을 독립적으로 만들 수 있게 했습니다:

| 경로 | 책임 |
|---|---|
| `src/core/types.ts` | 모든 공유 셰이프 — Ship, Order, Projectile, GameEvents |
| `src/core/contracts.ts` | 모듈 인터페이스, 지오메트리 attribute 계약, LOD 예산, 공유 GLSL |
| `src/core/registry.ts` | 13종 함선 클래스: 하드포인트, 엔진 마운트, 비용, 연구 |
| `src/sim/` | 60 Hz 고정 스텝 시뮬레이션 — 풀링된 엔티티 스토어 + 공간 해시 |
| `src/ships/` | 절차적 선체 생성 |
| `src/render/` | 인스턴스 함대 렌더러, 선체 머티리얼, 카메라 리그, 픽업 |
| `src/fx/` | 무기, 추진, 폭발, 파티클 |
| `src/ui/` | HUD, 생산 패널, 함대 바, 메뉴 |
| `scripts/` | 헤드리스 검증 — 스크린샷, 프로브, 제스처 테스트 |

렌더링은 시뮬레이션과 분리되어 시뮬레이션을 변경하지 않습니다. 함선은 (class, LOD, variant) 버킷당 하나의 `InstancedMesh` + 원거리 impostor 빌보드로 그려져 수백 함 함대가 프레임을 유지합니다.

스크립트 폴더를 보면 모델이 자신의 시각 작업을 어떻게 검증하는지 알 수 있습니다 — `capture.mjs`가 헤드리스 브라우저를 운전해 프레임을 찍고, `probe.mjs`가 라이브 씬에 임의 표현식을 평가하며, `pnginfo.mjs`가 스크린샷의 히스토그램을 다시 읽어옵니다. 역사에서 거의 모든 수정은 코드를 추론해서가 아니라 이 도구 중 하나로 발견되었습니다.

## 크레딧

**Homeworld** (Relic Entertainment, 1999)에 헌정 — 함대는 3차원의 형태여야 한다는 점, 흔적은 적이 어떤 방향으로 이탈하는지 알려주어야 한다는 점, 그리고 침묵과 수평선이 그 어떤 소란보다 가치가 있다는 점을 일깨워 준 작품. 스타폴은 독립적 오마주이며 그 미술·음악·코드·상표를 일절 사용하지 않습니다.

프롬프트는 [Matt Shumer](https://x.com/mattshumer_)의 one-shot AAA 프롬프트를 수정한 것입니다.

음악은 [OpenGameArt](https://opengameart.org) (Tozan, yd, wipics, vitalezzz, Synth-thetic, CleytonKauffman); 효과음은 [Kenney](https://kenney.nl). 모두 CC0.

[three.js](https://threejs.org), [Vite](https://vite.dev), [TypeScript](https://www.typescriptlang.org)로 제작.

[e01.ai](https://e01.ai/)의 [Mike Luan](https://x.com/mikeluan123)이 원작. 한국어화 + GitHub Pages 배포는 [sigco3111](https://github.com/sigco3111).

## 라이선스

[MIT](LICENSE).