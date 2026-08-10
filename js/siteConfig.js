// 솔라링크 통합 운영 상수 정의 (siteConfig)
const SOLAR_CONFIG = {
  BRAND_NAME: "솔라링크",
  SITE_POSITION: "60평 이상 건물·지붕·부지 태양광 상담 연결 플랫폼",
  SITE_URL: "https://www.solarlink.co.kr",
  
  // 사업자 정보
  BUSINESS_NAME: "올케어 서비스",
  OWNER_NAME: "김재현",
  BUSINESS_NUMBER: "405-15-02677",
  ADDRESS: "서울특별시 (상세주소 생략)"
};

// Hybrid Loader: Support both CommonJS (NodeJS) and Browser global window scope
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SOLAR_CONFIG;
} else {
  window.SOLAR_CONFIG = SOLAR_CONFIG;
}
