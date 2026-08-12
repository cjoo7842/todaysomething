# 오늘뭐보지? (Seoul Today Culture)

오늘 서울에서 바로 갈 수 있는 전시·축제·팝업스토어 정보를 지역/카테고리별로
3초 만에 찾아주는 서비스의 초기 코드 스캐폴드입니다.

Next.js 14 (App Router) + TypeScript + Tailwind CSS로 구성되어 있고,
지금은 실제 API 대신 **더미 데이터**로 화면이 동작합니다.

---

## 1. 로컬 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 http://localhost:3000 접속

---

## 2. 폴더 구조

```
app/
  page.tsx              메인 홈 화면 (검색/필터/정렬/카드리스트)
  event/[id]/page.tsx   상세 페이지 (지도 이동 CTA 포함)
  layout.tsx            공통 레이아웃, 폰트/메타데이터
  globals.css           Tailwind 진입점

components/
  TodayBadge.tsx         "TODAY 7.28" 헤더 배지 + 오늘 행사 건수
  SearchBar.tsx           행사명/장소 검색
  FilterChips.tsx         지역/카테고리/무료필터/정렬
  EventCard.tsx           카드 (마감임박·NEW 배지 포함)
  SkeletonCard.tsx         로딩 중 스켈레톤 UI
  EmptyState.tsx           필터 결과 0건일 때 안내 + 초기화 버튼

lib/
  date.ts                Asia/Seoul 타임존 기준 "오늘" 계산, 마감임박 배지 로직
  filter-events.ts        지역/카테고리/무료/검색어 필터링 + 정렬
  mock-events.ts           더미 데이터 (오늘 날짜 기준 상대 계산이라 clone 즉시 테스트 가능)
  utils.ts                 className 유틸

types/
  event.ts                CultureEvent 타입 정의
```

---

## 3. 다음 사람이 이어서 할 일 (기술 담당 체크리스트)

### 3.1 서울 열린데이터광장 API 연동
1. `.env.example`을 복사해서 `.env.local` 생성, 발급받은 인증키 입력
   ```
   SEOUL_OPEN_DATA_API_KEY=발급받은_키
   ```
2. `lib/mock-events.ts`의 `getMockEvents()` 자리를 실제 fetch 함수로 교체
   - **주의**: 실제 API 응답 필드명이 이 프로젝트의 `CultureEvent` 타입과 다를 수 있습니다.
     반드시 1건 직접 호출해서 응답 구조를 먼저 확인한 뒤 매핑하세요.
   - 자치구(종로구, 중구 등) → 권역 그룹(종로/중구 등) 매핑 로직도 함께 이 단계에서 구현하세요.
3. 나머지 코드(`app/page.tsx`, `EventCard` 등)는 `CultureEvent[]` 타입만 보고 동작하므로
   데이터 소스를 바꿔도 수정할 필요가 거의 없습니다.

### 3.2 지도 링크 검증
- `mapUrl`은 현재 네이버지도 검색 URL 형태의 예시입니다.
- 실제 좌표 기반 딥링크로 바꾸려면 카카오맵/네이버지도의 좌표 기반 URL 스킴을 확인해서 교체하세요.

### 3.3 이미지 도메인 제한
- `next.config.mjs`의 `images.remotePatterns`가 지금은 전체 도메인을 허용하고 있습니다.
- 실제 API의 이미지 도메인이 확정되면 해당 도메인으로 좁혀주세요 (보안/성능상 권장).

### 3.4 배포
- Vercel에 이 저장소를 연결하면 별도 설정 없이 바로 배포됩니다.
- 배포 시 Vercel 프로젝트 설정의 Environment Variables에 `SEOUL_OPEN_DATA_API_KEY`를 등록하세요.

---

## 4. 디자인 담당이 이어서 할 일

- 컬러/타이포그래피는 `tailwind.config.ts`에 디자인 가이드 값 그대로 반영되어 있습니다
  (`brand`=오렌지, `rose.accent`=로즈, `teal.accent`=틸).
- 애니메이션은 최소한으로만 되어 있습니다 (카드 active:scale, 스켈레톤 shimmer).
  디자인 가이드의 Framer Motion 인터랙션(카드 슬라이드업, 필터 바운스 등)을 추가하려면
  `npm install framer-motion` 후 각 컴포넌트에 점진적으로 적용해주세요.
- 아직 구현되지 않은 항목: 공유하기 버튼, 저장/찜 기능, 다크모드 토글
  (사용자 편의 요소 문서의 B그룹 항목 — 우선순위에 따라 추가 예정)

---

## 5. 알아두면 좋은 설계 포인트

- **타임존 버그 방지**: `lib/date.ts`의 `getTodaySeoul()`은 서버가 어디에 배포되든
  (Vercel 기본값은 UTC) 항상 한국 기준 오늘 날짜를 정확히 계산하도록 만들어져 있습니다.
  이 로직을 우회해서 `new Date()`를 직접 쓰는 코드를 추가하지 않도록 주의하세요.
- **더미 데이터의 상대 날짜**: `mock-events.ts`는 날짜를 하드코딩하지 않고
  "오늘 기준 ±N일"로 계산합니다. 그래서 이 저장소를 언제 열어도
  마감임박/신규 배지가 항상 정상적으로 보입니다.
