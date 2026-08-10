const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://www.solarlink.co.kr';

// Helper to load client-side global JS databases
const loadDatabase = (fileName) => {
  const filePath = path.join(__dirname, 'js', fileName);
  const code = fs.readFileSync(filePath, 'utf8');
  const window = {};
  eval(code);
  return window;
};

try {
  const regionsDb = loadDatabase('regions.js');
  const keywordsDb = loadDatabase('keywordData.js');

  const SOLAR_REGIONS = regionsDb.SOLAR_REGIONS;
  const SOLAR_KEYWORDS = keywordsDb.SOLAR_KEYWORDS;

  // Ordered 16 provinces (Jeju strictly excluded)
  const provinceOrder = [
    "서울", "경기", "인천", "충남", "충북", "경남", "경북", "부산", 
    "대구", "울산", "전남", "전북", "광주", "강원", "대전", "세종"
  ];

  let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xmlContent += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // 1. Static Pages
  // Main Root
  xmlContent += `  <url>\n    <loc>${SITE_URL}/</loc>\n    <priority>1.0</priority>\n  </url>\n`;
  // solar-guide Page
  xmlContent += `  <url>\n    <loc>${SITE_URL}/solar-guide</loc>\n    <priority>0.8</priority>\n  </url>\n`;
  // sitemap-solar Page
  xmlContent += `  <url>\n    <loc>${SITE_URL}/sitemap-solar</loc>\n    <priority>0.8</priority>\n  </url>\n`;

  let dynamicUrlCount = 0;

  // 2. Dynamic Pages grouped by ordered provinces
  provinceOrder.forEach(prov => {
    const provRegions = SOLAR_REGIONS.filter(r => r.province === prov);
    
    provRegions.forEach(region => {
      const kwSet = SOLAR_KEYWORDS[region.keywordSet];
      if (!kwSet) return;
      
      kwSet.forEach(kw => {
        const encodedRegion = encodeURIComponent(region.urlRegion);
        const encodedKeyword = encodeURIComponent(kw.urlKeyword);
        const url = `${SITE_URL}/?k=${encodedRegion}-${encodedKeyword}`;
        
        xmlContent += `  <url>\n    <loc>${url}</loc>\n    <priority>0.6</priority>\n  </url>\n`;
        dynamicUrlCount++;
      });
    });
  });

  xmlContent += '</urlset>\n';

  // Write sitemap.xml to workspace root
  fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), xmlContent, 'utf8');

  console.log(`\n==================================================`);
  console.log(`     ☀️ [솔라링크] sitemap.xml 빌드 완료 ☀️`);
  console.log(`==================================================`);
  console.log(`- 생성 경로: ${path.join(__dirname, 'sitemap.xml')}`);
  console.log(`- 기준 도메인: ${SITE_URL}`);
  console.log(`- 고정 페이지 수: 3개`);
  console.log(`- 동적 키워드 페이지 수: ${dynamicUrlCount}개`);
  console.log(`- 총 사이트맵 수록 URL 수: ${dynamicUrlCount + 3}개`);
  console.log(`==================================================\n`);

} catch (error) {
  console.error('[오류] sitemap.xml 생성 중 에러 발생:', error);
  process.exit(1);
}
