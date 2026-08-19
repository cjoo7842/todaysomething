# 오늘뭐하지 (Seoul Today Culture & Places)

> **서울시 문화행사 공공데이터 + 한국관광공사 TourAPI 4.0 기반 상시 문화공간 통합 탐색 서비스**
> 
> 오늘 서울에서 바로 방문 가능한 전시, 팝업, 축제 및 상시 개방 문화공간(미술관, 박물관, 공원 등) 정보를 빠르고 직관적으로 탐색할 수 있는 웹 서비스입니다.

---

## 📌 1. 프로젝트 개요 (Service Overview)

- **서비스명**: 오늘뭐하지
- **목적**: 흩어져 있는 서울시 문화행사 정보와 한국관광공사의 상시 문화시설 데이터를 통합하여, 날짜·지역·카테고리별 맞춤형 정보를 손쉽게 탐색할 수 있도록 지원합니다.
- **핵심 가치**:
  - **엄격한 실시간 필터링**: 오늘 실제로 열려있는 행사 및 상시 운영 장소만 큐레이션하여 사용자 헛걸음 방지
  - **공공데이터 이중 연동**: 기간 한정 이벤트(서울시 API)와 연중무휴 상시 문화공간(TourAPI)을 하나의 인터페이스에서 제공
  - **빠른 모바일 최적화 UX**: 탐색 칩, 전체 검색, 실시간 찜하기 및 최근 본 장소 로컬 캐싱 지원

---

## 🛠️ 2. 기술 스택 (Tech Stack)

| 구분 | 기술 / 라이브러리 |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript (Strict Mode) |
| **UI & Styling** | React 18, Tailwind CSS, Lucide React |
| **Data Fetching** | Route Handler (Proxy & Normalization), Server Cache (`revalidate`) |
| **External APIs** | 서울시 문화행사 정보 API, 한국관광공사 TourAPI 4.0 (`KorService2/areaBasedList2`) |
| **Deployment** | Vercel (Edge / Serverless Region: `icn1` 서울 리전 최적화) |

---

## ✨ 3. 주요 기능 (Key Features)

1. **빠른 탐색 칩 & 복합 필터링**
   - 오늘, 이번 주, 이번 주말, 날짜 지정 필터링
   - 대분류(전시, 문화행사, 놀거리) 및 `상시 공간` 단독 필터 지원
   - 서울 25개 자치구 및 5대 생활권역별 맞춤 필터링

2. **오늘의 PICK & 큐레이션**
   - 현재 시각(KST) 기준 유효한 진행 중 행사만 엄격 필터링하여 상단 캐러셀 노출
   - 마감임박(D-Day) 및 신규(NEW) 실시간 배지 부여

3. **통합 검색 (Global Search)**
   - 행사명, 장소명, 주소, 카테고리, 설명 텍스트를 아우르는 통합 키워드 검색 엔진

4. **이벤트 및 상시 공간 상세 페이지 (`/event/[id]`)**
   - 서울시 API와 TourAPI 식별자(`place_...`)를 구분하여 상세 데이터 안전 Fetching
   - 연도 생략 날짜 및 특수문자 포함 URL 인코딩/디코딩 방어 로직 적용
   - 카카오맵 길찾기 딥링크, 일정 등록(Google/Apple/ICS) 캘린더 모달, SNS 공유 기능

5. **개인화 편의 기능 (`/my`)**
   - 찜한 행사(즐겨찾기) 및 최근 본 행사 LocalStorage 기반 지속 저장

---

## 🚀 4. 시작하기 (Getting Started)

### 4.1 설치 (Installation)

```bash
git clone https://github.com/cjoo7842/todaysomething.git
cd todaysomething
npm install
```

### 4.2 환경변수 설정 (Environment Variables)

루트 디렉토리에 `.env.local` 파일을 생성하고 아래 키를 입력합니다 (`.env.example` 참조):

```env
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# 한국관광공사 TourAPI 4.0 인증키 (KorService2)
TOUR_API_KEY=your_tour_api_key_here

# (선택) 서울 열린데이터광장 API 인증키
SEOUL_OPEN_DATA_API_KEY=your_seoul_api_key_here

# (선택) 카카오맵 연동 키
NEXT_PUBLIC_KAKAO_MAP_APP_KEY=your_kakao_map_key_here
```

### 4.3 개발 서버 실행 (Development)

```bash
npm run dev
```
브라우저에서 `http://localhost:3000`으로 접속하여 확인합니다.

### 4.4 프로덕션 빌드 및 검증 (Production Build)

```bash
npm run build
npm run start
```

---

## 📂 5. 프로젝트 디렉토리 구조 (Directory Structure)

```
todaysomething/
├── app/
│   ├── api/
│   │   ├── events/route.ts      # 서울시 문화행사 API Proxy
│   │   ├── places/route.ts      # TourAPI 4.0 상시공간 API Proxy
│   │   └── weather/route.ts     # 날씨 정보 API
│   ├── event/[id]/page.tsx      # 행사/장소 상세페이지 (동적 라우팅)
│   ├── events/page.tsx          # 전체 목록 및 필터링 페이지
│   ├── my/page.tsx              # 찜 / 최근 본 목록 페이지
│   ├── layout.tsx               # 공통 레이아웃 (GNB, 헤더, 네비게이션)
│   └── page.tsx                 # 메인 대시보드
├── components/                  # 재사용 UI 컴포넌트 (EventCard, FilterChips 등)
├── hooks/                       # 커스텀 훅 (useEvents, useFavorites 등)
├── lib/                         # 유틸리티 (filter-events, date, districts 등)
├── types/                       # TypeScript 타입 정의 (event.ts 등)
├── .env.example                 # 환경변수 템플릿
├── next.config.mjs              # Next.js 설정 (이미지 도메인 허용 등)
└── tailwind.config.ts           # 디자인 시스템 테마 설정
```

---

## 🔒 6. 보안 및 배포 고려사항

- **API 키 은닉**: 모든 공공 API 키는 브라우저에 직접 노출되지 않고 Next.js Route Handler(서버 사이드)를 통해 프록시 호출됩니다.
- **Vercel 배포 리전 설정**: 한국 공공데이터포털(TourAPI 등)의 해외 IP 지오블로킹 차단을 방지하기 위해 Vercel Serverless Function 리전을 서울(`icn1`)로 지정(`export const preferredRegion = 'icn1'`)하여 배포합니다.

