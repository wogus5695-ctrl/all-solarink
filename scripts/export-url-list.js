const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://www.solarlink.co.kr';

// Helper to load client-side global JS databases
const loadDatabase = (fileName) => {
  const filePath = path.join(__dirname, '..', 'js', fileName);
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

  let csvContent = '\uFEFF'; // Excel UTF-8 BOM representation for Korean character compatibility
  csvContent += '번호,광역 지역,지역구분,지역명,키워드,동적변환 키워드,k 파라미터 원문,제출용 URL,한글 디코딩 URL,중복 여부\n';

  let count = 0;
  const seenUrls = new Set();

  provinceOrder.forEach(prov => {
    const provRegions = SOLAR_REGIONS.filter(r => r.province === prov);
    
    provRegions.forEach(region => {
      const kwSet = SOLAR_KEYWORDS[region.keywordSet];
      if (!kwSet) return;
      
      kwSet.forEach(kw => {
        count++;
        const encodedRegion = encodeURIComponent(region.urlRegion);
        const encodedKeyword = encodeURIComponent(kw.urlKeyword);
        const kParam = `${region.urlRegion}-${kw.urlKeyword}`;
        const submissionUrl = `${SITE_URL}/?k=${encodedRegion}-${encodedKeyword}`;
        const decodedUrl = `${SITE_URL}/?k=${kParam}`;
        const displayKeyword = `${region.regionName} ${kw.label}`;
        
        let isDuplicate = 'N';
        if (seenUrls.has(submissionUrl)) {
          isDuplicate = 'Y';
        } else {
          seenUrls.add(submissionUrl);
        }

        const escapeCsv = (str) => {
          if (!str) return '';
          const strVal = String(str);
          if (strVal.includes(',') || strVal.includes('"') || strVal.includes('\n')) {
            return `"${strVal.replace(/"/g, '""')}"`;
          }
          return strVal;
        };

        const row = [
          count,
          escapeCsv(region.province),
          escapeCsv(region.regionType),
          escapeCsv(region.regionName),
          escapeCsv(kw.label),
          escapeCsv(displayKeyword),
          escapeCsv(kParam),
          escapeCsv(submissionUrl),
          escapeCsv(decodedUrl),
          isDuplicate
        ].join(',');

        csvContent += row + '\n';
      });
    });
  });

  const outputPath = path.join(__dirname, '..', 'solarlink-url-list.csv');
  fs.writeFileSync(outputPath, csvContent, 'utf8');

  console.log(`\n==================================================`);
  console.log(`  ☀️ [솔라링크] URL 리스트 CSV 내보내기 완료 ☀️`);
  console.log(`==================================================`);
  console.log(`- 저장 경로: ${outputPath}`);
  console.log(`- 총 레코드 수: ${count}개`);
  console.log(`- 고유 URL 수: ${seenUrls.size}개`);
  console.log(`==================================================\n`);

} catch (error) {
  console.error('[오류] URL 리스트 내보내기 중 에러 발생:', error);
  process.exit(1);
}
