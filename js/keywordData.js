// 키워드 세트 정의 (기본 세트, 서울형 세트, 광역시형 세트)
// 각 키워드는 URL용 식별자, 노출 라벨 및 유형 분기를 지님
window.SOLAR_KEYWORDS = {
  // 경기, 인천, 충남, 충북, 경남, 경북, 전남, 전북, 강원 대상 기본 키워드 세트 (8개)
  default: [
    { label: "태양광 설치", urlKeyword: "태양광설치", type: "general" },
    { label: "태양광 업체", urlKeyword: "태양광업체", type: "general" },
    { label: "공장 태양광", urlKeyword: "공장태양광", type: "factory" },
    { label: "공장 지붕 태양광", urlKeyword: "공장지붕태양광", type: "factory" },
    { label: "창고 태양광", urlKeyword: "창고태양광", type: "warehouse" },
    { label: "축사 태양광", urlKeyword: "축사태양광", type: "barn" },
    { label: "지붕 태양광 임대", urlKeyword: "지붕태양광임대", type: "lease" },
    { label: "태양광 발전사업", urlKeyword: "태양광발전사업", type: "business" }
  ],
  
  // 서울특별시 대상 서울형 키워드 세트 (8개)
  seoul: [
    { label: "태양광 설치", urlKeyword: "태양광설치", type: "general" },
    { label: "태양광 업체", urlKeyword: "태양광업체", type: "general" },
    { label: "건물 태양광", urlKeyword: "건물태양광", type: "building" },
    { label: "옥상 태양광", urlKeyword: "옥상태양광", type: "building" },
    { label: "상가 태양광", urlKeyword: "상가태양광", type: "building" },
    { label: "공장 태양광", urlKeyword: "공장태양광", type: "factory" },
    { label: "지붕 태양광 임대", urlKeyword: "지붕태양광임대", type: "lease" },
    { label: "태양광 발전사업", urlKeyword: "태양광발전사업", type: "business" }
  ],

  // 부산, 대구, 울산, 광주, 대전, 세종 대상 광역시형 키워드 세트 (8개)
  metro: [
    { label: "태양광 설치", urlKeyword: "태양광설치", type: "general" },
    { label: "태양광 업체", urlKeyword: "태양광업체", type: "general" },
    { label: "건물 태양광", urlKeyword: "건물태양광", type: "building" },
    { label: "옥상 태양광", urlKeyword: "옥상태양광", type: "building" },
    { label: "상가 태양광", urlKeyword: "상가태양광", type: "building" },
    { label: "공장 태양광", urlKeyword: "공장태양광", type: "factory" },
    { label: "지붕 태양광 임대", urlKeyword: "지붕태양광임대", type: "lease" },
    { label: "태양광 발전사업", urlKeyword: "태양광발전사업", type: "business" }
  ]
};
