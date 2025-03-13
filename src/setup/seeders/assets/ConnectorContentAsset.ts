import { HubGlobal } from "../../../HubGlobal";

export namespace ConnectorContentAsset {
  type CategoryType =
    | "교육"
    | "생산성"
    | "마케팅 / 광고"
    | "작문"
    | "학술 / 연구"
    | "비즈니스"
    | "IT / 개발"
    | "설문"
    | "이미지 / 비디오"
    | "멘토링 / 코칭"
    | "건강 / 피트니스"
    | "뉴스 / 미디어"
    | "데이터 / 애널리틱스"
    | "취업"
    | "커뮤니케이션"
    | "패션"
    | "금융"
    | "계약"
    | "여행"
    | "그래픽 / 디자인"
    | "음악"
    | "엔터테인먼트"
    | "이커머스"
    | "라이프스타일";

  export const category: { [key: string]: CategoryType[] } = {
    "학술 논문 탐색기": ["교육", "IT / 개발", "학술 / 연구"],
    "DALL-E 3 고급 이미지 생성": ["생산성", "이미지 / 비디오"],
    "CSV 파일 데이터 처리기": ["생산성", "IT / 개발", "데이터 / 애널리틱스"],
    "다음 포털 콘텐츠 조회": ["마케팅 / 광고", "라이프스타일", "커뮤니케이션"],
    "피그마 디자인 협업 플랫폼": ["생산성", "IT / 개발", "그래픽 / 디자인"],
    "구글 광고 캠페인 운영": ["마케팅 / 광고", "생산성"],
    "구글 일정 관리자": ["생산성", "IT / 개발", "비즈니스", "라이프스타일"],
    "구글 문서 작성 및 관리": [
      "생산성",
      "IT / 개발",
      "비즈니스",
      "데이터 / 애널리틱스",
    ],
    "구글 클라우드 스토리지 관리": [
      "생산성",
      "IT / 개발",
      "데이터 / 애널리틱스",
    ],
    "구글 항공권 검색 및 비교": ["여행", "라이프스타일"],
    "구글 이메일 서비스 관리": [
      "생산성",
      "IT / 개발",
      "비즈니스",
      "커뮤니케이션",
    ],
    "구글 호텔 정보 검색 및 예약": ["여행", "라이프스타일"],
    "구글 학술 자료 통합 검색": ["교육", "IT / 개발", "학술 / 연구"],
    "구글 웹 검색 엔진": ["생산성"],
    "통합 채용정보 검색": ["비즈니스"],
    "구글 스프레드시트 데이터 관리": [
      "데이터 / 애널리틱스",
      "IT / 개발",
      "비즈니스",
      "생산성",
    ],
    "알라딘 상품 검색": ["이커머스", "라이프스타일"],
    "알리익스프레스 상품 검색": ["이커머스", "라이프스타일"],
    "쿠팡 상품 검색": ["이커머스", "라이프스타일"],
    "EQL 상품 검색": ["이커머스", "라이프스타일"],
    "Iherb 상품 검색": ["이커머스", "라이프스타일"],
    "마켓컬리 상품 검색": ["이커머스", "라이프스타일"],
    "OCO 상품 검색": ["이커머스", "라이프스타일"],
    "올리브영 상품 검색": ["이커머스", "라이프스타일"],
    "29cm 상품 검색": ["이커머스", "라이프스타일"],
    "유니클로 상품 검색": ["이커머스", "라이프스타일"],
    "Yes24 상품 검색": ["이커머스", "라이프스타일"],
    "구글 프레젠테이션 제작": [
      "데이터 / 애널리틱스",
      "IT / 개발",
      "비즈니스",
      "생산성",
    ],
    "Google Trend": ["생산성", "IT / 개발"],
    "한셀 문서 데이터 관리": ["데이터 / 애널리틱스", "IT / 개발", "생산성"],
    "한컴 오피스 HWP 한글 문서 파일 분석기": ["IT / 개발", "생산성"],
    "아임웹 상품 정보 관리": ["생산성", "마케팅 / 광고", "이커머스"],
    "카카오 지도 정보 검색": ["여행", "라이프스타일"],
    "카카오 내비게이션 경로 안내": ["여행", "라이프스타일"],
    "카카오톡 메시징 및 일정 관리": ["라이프스타일", "생산성", "커뮤니케이션"],
    "키워드 추출": ["생산성", "IT / 개발"],
    "실시간 환율 정보 제공": ["금융"],
    LLM: ["엔터테인먼트", "IT / 개발"],
    "마케팅 카피": ["마케팅 / 광고", "생산성"],
    "네이버 포털 정보 검색": [
      "마케팅 / 광고",
      "라이프스타일",
      "커뮤니케이션",
      "생산성",
    ],
    "노션 워크스페이스 관리": ["교육", "생산성", "IT / 개발"],
    "통합 공공정보 조회": ["생산성", "데이터 / 애널리틱스"],
    프롬프트: ["엔터테인먼트", "IT / 개발"],
    RAG: ["엔터테인먼트", "IT / 개발"],
    "조건 정렬": ["엔터테인먼트"],
    "Stable Diffusion 이미지 생성": ["생산성", "이미지 / 비디오"],
    "스토리 생성": ["엔터테인먼트"],
    "내파일 기반 생활기록부 일괄 작성": ["생산성"],
    "통합 택배 추적기": ["라이프스타일"],
    "유튜브 검색": ["생산성"],
    Zoom: ["비즈니스"],
  };

  export const thumbnail: { [key: string]: string[] } = {
    "학술 논문 탐색기": [
      `https://${HubGlobal.env.CONNECTOR_BUCKET}.s3.ap-northeast-2.amazonaws.com/thumbnails/arxive.png`,
    ],
    "DALL-E 3 고급 이미지 생성": [
      `https://${HubGlobal.env.CONNECTOR_BUCKET}.s3.ap-northeast-2.amazonaws.com/thumbnails/Dall-e3.png`,
    ],
    "CSV 파일 데이터 처리기": [
      `https://${HubGlobal.env.CONNECTOR_BUCKET}.s3.ap-northeast-2.amazonaws.com/thumbnails/CSV.png`,
    ],
    "다음 포털 콘텐츠 조회": [
      `https://${HubGlobal.env.CONNECTOR_BUCKET}.s3.ap-northeast-2.amazonaws.com/thumbnails/daum.png`,
    ],
    "피그마 디자인 협업 플랫폼": [
      `https://${HubGlobal.env.CONNECTOR_BUCKET}.s3.ap-northeast-2.amazonaws.com/thumbnails/figma.png`,
    ],
    "구글 광고 캠페인 운영": [
      `https://${HubGlobal.env.CONNECTOR_BUCKET}.s3.ap-northeast-2.amazonaws.com/thumbnails/google+ad.png`,
    ],
    "구글 일정 관리자": [
      `https://${HubGlobal.env.CONNECTOR_BUCKET}.s3.ap-northeast-2.amazonaws.com/thumbnails/google+calender.png`,
    ],
    "구글 문서 작성 및 관리": [
      `https://${HubGlobal.env.CONNECTOR_BUCKET}.s3.ap-northeast-2.amazonaws.com/thumbnails/google+docs.png`,
    ],
    "구글 클라우드 스토리지 관리": [
      `https://${HubGlobal.env.CONNECTOR_BUCKET}.s3.ap-northeast-2.amazonaws.com/thumbnails/google+drive.png`,
    ],
    "구글 항공권 검색 및 비교": [
      `https://${HubGlobal.env.CONNECTOR_BUCKET}.s3.ap-northeast-2.amazonaws.com/thumbnails/GoogleFilght.png`,
    ],
    "구글 이메일 서비스 관리": [
      `https://${HubGlobal.env.CONNECTOR_BUCKET}.s3.ap-northeast-2.amazonaws.com/thumbnails/gmail.png`,
    ],
    "구글 호텔 정보 검색 및 예약": [
      `https://${HubGlobal.env.CONNECTOR_BUCKET}.s3.ap-northeast-2.amazonaws.com/thumbnails/GoogleHotel.png`,
    ],
    "구글 학술 자료 통합 검색": [
      `https://${HubGlobal.env.CONNECTOR_BUCKET}.s3.ap-northeast-2.amazonaws.com/thumbnails/google+scholar.png`,
    ],
    "구글 웹 검색 엔진": [
      `https://${HubGlobal.env.CONNECTOR_BUCKET}.s3.ap-northeast-2.amazonaws.com/thumbnails/google+search.png`,
    ],
    "통합 채용정보 검색": [
      `https://${HubGlobal.env.CONNECTOR_BUCKET}.s3.ap-northeast-2.amazonaws.com/thumbnails/google+search.png`,
    ],
    "구글 스프레드시트 데이터 관리": [
      `https://${HubGlobal.env.CONNECTOR_BUCKET}.s3.ap-northeast-2.amazonaws.com/thumbnails/google+sheet.png`,
    ],
    "알라딘 상품 검색": [
      `https://${HubGlobal.env.CONNECTOR_BUCKET}.s3.ap-northeast-2.amazonaws.com/thumbnails/Aladdin.png`,
    ],
    "알리익스프레스 상품 검색": [
      `https://${HubGlobal.env.CONNECTOR_BUCKET}.s3.ap-northeast-2.amazonaws.com/thumbnails/Aliexpress.png`,
    ],
    "쿠팡 상품 검색": [
      `https://${HubGlobal.env.CONNECTOR_BUCKET}.s3.ap-northeast-2.amazonaws.com/thumbnails/Coupang.png`,
    ],
    "EQL 상품 검색": [
      `https://${HubGlobal.env.CONNECTOR_BUCKET}.s3.ap-northeast-2.amazonaws.com/thumbnails/EQL.png`,
    ],
    "Iherb 상품 검색": [
      `https://${HubGlobal.env.CONNECTOR_BUCKET}.s3.ap-northeast-2.amazonaws.com/thumbnails/iherb.png`,
    ],
    "마켓컬리 상품 검색": [
      `https://${HubGlobal.env.CONNECTOR_BUCKET}.s3.ap-northeast-2.amazonaws.com/thumbnails/Marketkurly.png`,
    ],
    "OCO 상품 검색": [
      `https://${HubGlobal.env.CONNECTOR_BUCKET}.s3.ap-northeast-2.amazonaws.com/thumbnails/OCO.png`,
    ],
    "올리브영 상품 검색": [
      `https://${HubGlobal.env.CONNECTOR_BUCKET}.s3.ap-northeast-2.amazonaws.com/thumbnails/OliveYoung.png`,
    ],
    "29cm 상품 검색": [
      `https://${HubGlobal.env.CONNECTOR_BUCKET}.s3.ap-northeast-2.amazonaws.com/thumbnails/29cm.png`,
    ],
    "유니클로 상품 검색": [
      `https://${HubGlobal.env.CONNECTOR_BUCKET}.s3.ap-northeast-2.amazonaws.com/thumbnails/Uniqlo.png`,
    ],
    "Yes24 상품 검색": [
      `https://${HubGlobal.env.CONNECTOR_BUCKET}.s3.ap-northeast-2.amazonaws.com/thumbnails/Yes24.png`,
    ],
    "구글 프레젠테이션 제작": [
      `https://${HubGlobal.env.CONNECTOR_BUCKET}.s3.ap-northeast-2.amazonaws.com/thumbnails/google+slides.png`,
    ],
    "Google Trend": [
      `https://${HubGlobal.env.CONNECTOR_BUCKET}.s3.ap-northeast-2.amazonaws.com/thumbnails/google+trend.png`,
    ],
    "한셀 문서 데이터 관리": [
      `https://${HubGlobal.env.CONNECTOR_BUCKET}.s3.ap-northeast-2.amazonaws.com/thumbnails/Hancell.png`,
    ],
    "한컴 오피스 HWP 한글 문서 파일 분석기": [],
    "아임웹 상품 정보 관리": [
      `https://${HubGlobal.env.CONNECTOR_BUCKET}.s3.ap-northeast-2.amazonaws.com/thumbnails/imweb.png`,
    ],
    "카카오 지도 정보 검색": [
      `https://${HubGlobal.env.CONNECTOR_BUCKET}.s3.ap-northeast-2.amazonaws.com/thumbnails/kakaomap.png`,
    ],
    "카카오 내비게이션 경로 안내": [
      `https://${HubGlobal.env.CONNECTOR_BUCKET}.s3.ap-northeast-2.amazonaws.com/thumbnails/kakaonavi.png`,
    ],
    "카카오톡 메시징 및 일정 관리": [
      `https://${HubGlobal.env.CONNECTOR_BUCKET}.s3.ap-northeast-2.amazonaws.com/thumbnails/kakaotalk.png`,
    ],
    "키워드 추출": [
      `https://${HubGlobal.env.CONNECTOR_BUCKET}.s3.ap-northeast-2.amazonaws.com/thumbnails/keyword.png`,
    ],
    "실시간 환율 정보 제공": [
      `https://${HubGlobal.env.CONNECTOR_BUCKET}.s3.ap-northeast-2.amazonaws.com/thumbnails/exchangerate.png`,
    ],
    LLM: [
      `https://${HubGlobal.env.CONNECTOR_BUCKET}.s3.ap-northeast-2.amazonaws.com/thumbnails/LLM.png`,
    ],
    "마케팅 카피": [
      `https://${HubGlobal.env.CONNECTOR_BUCKET}.s3.ap-northeast-2.amazonaws.com/thumbnails/marketing.png`,
    ],
    "네이버 포털 정보 검색": [
      `https://${HubGlobal.env.CONNECTOR_BUCKET}.s3.ap-northeast-2.amazonaws.com/thumbnails/naver.png`,
    ],
    "노션 워크스페이스 관리": [
      `https://${HubGlobal.env.CONNECTOR_BUCKET}.s3.ap-northeast-2.amazonaws.com/thumbnails/notion.png`,
    ],
    "통합 공공정보 조회": [],
    프롬프트: [
      `https://${HubGlobal.env.CONNECTOR_BUCKET}.s3.ap-northeast-2.amazonaws.com/thumbnails/prompt.png`,
    ],
    RAG: [
      `https://${HubGlobal.env.CONNECTOR_BUCKET}.s3.ap-northeast-2.amazonaws.com/thumbnails/RAG.png`,
    ],
    "조건 정렬": [
      `https://${HubGlobal.env.CONNECTOR_BUCKET}.s3.ap-northeast-2.amazonaws.com/thumbnails/sort.png`,
    ],
    "Stable Diffusion 이미지 생성": [
      `https://${HubGlobal.env.CONNECTOR_BUCKET}.s3.ap-northeast-2.amazonaws.com/thumbnails/stabledifusion.png`,
    ],
    "스토리 생성": [
      `https://${HubGlobal.env.CONNECTOR_BUCKET}.s3.ap-northeast-2.amazonaws.com/thumbnails/story.png`,
    ],
    "내파일 기반 생활기록부 일괄 작성": [
      `https://${HubGlobal.env.CONNECTOR_BUCKET}.s3.ap-northeast-2.amazonaws.com/thumbnails/StudentRecord.png`,
    ],
    "통합 택배 추적기": [
      `https://${HubGlobal.env.CONNECTOR_BUCKET}.s3.ap-northeast-2.amazonaws.com/thumbnails/delivery.png`,
    ],
    "유튜브 검색": [
      `https://${HubGlobal.env.CONNECTOR_BUCKET}.s3.ap-northeast-2.amazonaws.com/thumbnails/youtube.png`,
    ],
    Zoom: [
      `https://${HubGlobal.env.CONNECTOR_BUCKET}.s3.ap-northeast-2.amazonaws.com/thumbnails/zoom.png`,
    ],
  };
}
