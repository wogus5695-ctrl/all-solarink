document.addEventListener('DOMContentLoaded', () => {
  // Resolve dynamic keywords from query parameter ?k=urlRegion-urlKeyword
  const urlParams = new URLSearchParams(window.location.search);
  const kParam = urlParams.get('k');

  if (!kParam) {
    // Standard main page - make sure dynamic elements are hidden
    const dynamicHero = document.getElementById('section-dynamic-hero');
    const dynamicDesc = document.getElementById('section-dynamic-desc');
    const notFoundSection = document.getElementById('section-not-found');
    
    if (dynamicHero) dynamicHero.classList.add('hidden');
    if (dynamicDesc) dynamicDesc.classList.add('hidden');
    if (notFoundSection) notFoundSection.classList.add('hidden');

    // Make sure standard sections are visible
    const mainHero = document.getElementById('section-hero');
    const mainBenefits = document.getElementById('section-benefits');
    const mainTypes = document.getElementById('section-types');
    const mainTrust = document.getElementById('section-trust');
    
    if (mainHero) mainHero.classList.remove('hidden');
    if (mainBenefits) mainBenefits.classList.remove('hidden');
    if (mainTypes) mainTypes.classList.remove('hidden');
    if (mainTrust) mainTrust.classList.remove('hidden');

    // Update SEO Head elements for standard main page
    document.title = '솔라링크 | 비어 있는 지붕·부지 태양광 상담 연결';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', '공장·창고·축사·건물 옥상 등 넓은 공간의 태양광 활용 가능성을 확인해보세요. 솔라링크는 조건 확인 후 전문업체 상담 연결을 돕습니다.');
    }

    // Canonical link setup for Main page
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', 'https://www.solarlink.co.kr/');

    // Robots meta setup for Main page
    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.setAttribute('name', 'robots');
      document.head.appendChild(robotsMeta);
    }
    robotsMeta.setAttribute('content', 'index, follow');

    // OG Meta tags for Main page
    updateOGMeta(
      '솔라링크 | 비어 있는 지붕·부지 태양광 상담 연결',
      '공장·창고·축사·건물 옥상 등 넓은 공간의 태양광 활용 가능성을 확인해보세요. 솔라링크는 조건 확인 후 전문업체 상담 연결을 돕습니다.',
      'https://www.solarlink.co.kr/'
    );

    // Schema injection for Main page
    injectSchema('main');
    ensureTag('main-hero-h1', 'h1');
    ensureTag('dynamic-hero-h1', 'div');
    return;
  }

  // Parse kParam (e.g. "화성-공장태양광")
  const parts = kParam.split('-');
  
  if (parts.length !== 2) {
    showNotFound();
    return;
  }

  const urlRegion = decodeURIComponent(parts[0]).trim();
  const urlKeyword = decodeURIComponent(parts[1]).trim();

  // 1. Find matching region
  const region = window.SOLAR_REGIONS.find(r => r.urlRegion === urlRegion);
  if (!region) {
    showNotFound();
    return;
  }

  // 2. Find matching keyword based on region's keyword set
  const kwSet = window.SOLAR_KEYWORDS[region.keywordSet];
  const keyword = kwSet.find(kw => kw.urlKeyword === urlKeyword);
  if (!keyword) {
    showNotFound();
    return;
  }

  // Valid dynamic landing page resolved!
  const displayKeyword = region.regionName + " " + keyword.label;
  const regionName = region.regionName;
  const keywordLabel = keyword.label;
  const keywordType = keyword.type;

  ensureTag('main-hero-h1', 'div');
  ensureTag('dynamic-hero-h1', 'h1');

  // 3. Toggle DOM sections to match dynamic page layout order:
  // Hide main-only sections
  const mainHero = document.getElementById('section-hero');
  const mainBenefits = document.getElementById('section-benefits');
  const mainTypes = document.getElementById('section-types');
  const mainTrust = document.getElementById('section-trust');
  
  if (mainHero) mainHero.classList.add('hidden');
  if (mainBenefits) mainBenefits.classList.remove('hidden');
  if (mainTypes) mainTypes.classList.remove('hidden');
  if (mainTrust) mainTrust.classList.remove('hidden');

  // Show dynamic sections
  const dynamicHero = document.getElementById('section-dynamic-hero');
  const dynamicDesc = document.getElementById('section-dynamic-desc');
  const notFoundSection = document.getElementById('section-not-found');
  
  if (dynamicHero) dynamicHero.classList.remove('hidden');
  if (dynamicDesc) dynamicDesc.classList.remove('hidden');
  if (notFoundSection) notFoundSection.classList.add('hidden');

  // 4. Update Dynamic Hero elements
  const heroH1 = document.getElementById('dynamic-hero-h1');
  const heroDesc = document.getElementById('dynamic-hero-desc');
  const badgeRegion = document.getElementById('dynamic-badge-region');
  
  if (heroH1) {
    heroH1.innerHTML = `${displayKeyword} 상담,<br>비어 있는 지붕과 부지<br class="mo-only"> 활용 가능성부터 확인하세요.`;
  }
  if (heroDesc) {
    heroDesc.innerHTML = `공장·창고·축사·상가·건물 옥상까지<br>공간 조건에 맞는 태양광 전문업체 상담을<br class="mo-only">연결합니다.`;
  }
  if (badgeRegion) {
    badgeRegion.textContent = `${regionName} 태양광 상담`;
  }

  // 5. Update Dynamic Content Section (키워드 유형별 본문 분기)
  const descTitle = document.getElementById('dynamic-desc-title');
  const descText = document.getElementById('dynamic-desc-text');
  
  if (descTitle) {
    descTitle.textContent = `${displayKeyword} 상담 신청 전 확인 사항`;
  }
  
  let branchText = '';
  switch (keywordType) {
    case 'general':
      branchText = `${regionName}에서 태양광 설치를 검토 중이라면 먼저 건물 면적, 지붕 구조, 소유 여부, 전기 사용량을 확인해야 합니다. 솔라링크는 기본 조건 확인 후 상담 가능한 전문업체 연결을 도와드립니다.`;
      break;
    case 'factory':
      branchText = `${regionName} 공장 지붕은 전기 사용량과 지붕 면적에 따라 자가소비형 태양광 또는 지붕 임대형 태양광을 검토할 수 있습니다. 단, 실제 가능 여부는 구조안전, 소유 여부, 계통연계 조건에 따라 달라질 수 있습니다.`;
      break;
    case 'warehouse':
      branchText = `${regionName} 창고·물류시설 지붕을 보유하고 있다면 유휴공간을 활용한 태양광 상담이 가능합니다. 솔라링크는 설치 가능성 확인 후 조건에 맞는 전문업체 상담을 연결합니다.`;
      break;
    case 'barn':
      branchText = `${regionName} 축사나 농업시설 지붕은 태양광 설치를 검토할 수 있는 대표적인 공간입니다. 다만 지붕 구조, 면적, 소유 여부, 한전 계통연계 가능성 확인이 필요합니다.`;
      break;
    case 'lease':
      branchText = `${regionName}에서 비어 있는 60평 이상 지붕을 보유하고 있다면 지붕 임대형 태양광 가능성을 확인해볼 수 있습니다. 임대 가능 여부와 조건은 전문업체 상담을 통해 검토됩니다.`;
      break;
    case 'business':
      branchText = `${regionName}에서 태양광 발전사업을 검토 중이라면 부지 면적, 계통연계, 인허가 조건, 설치 방식 확인이 필요합니다. 솔라링크는 기본 조건 확인 후 상담 가능한 전문업체 연결을 도와드립니다.`;
      break;
    case 'building':
      branchText = `${regionName}에서 건물 옥상이나 상가 지붕을 보유하고 있다면 태양광 설치 가능성을 검토할 수 있습니다. 실제 가능 여부는 면적, 구조, 그림자, 소유 여부, 전기 사용량에 따라 달라질 수 있습니다.`;
      break;
    default:
      branchText = `${regionName} 지역에서 태양광 시공 타당성을 검토해 드립니다. 면적 및 소유권 기준이 충족되면 적합한 파트너사를 연결해 드립니다.`;
  }
  
  if (descText) {
    descText.textContent = branchText;
  }

  // 6. Update FAQ Q1/A1 dynamically
  const faqItem1 = document.querySelector('.faq-item:first-child');
  if (faqItem1) {
    const qButton = faqItem1.querySelector('.faq-header');
    const aContent = faqItem1.querySelector('.faq-answer');
    
    if (qButton) {
      qButton.innerHTML = `<span><span class="q-icon">Q</span>${displayKeyword} 상담은 60평 이상만 가능한가요?</span><span class="faq-arrow"><svg viewBox="0 0 24 24"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg></span>`;
    }
    if (aContent) {
      aContent.textContent = `솔라링크는 기본적으로 60평 이상 건물·지붕·부지 보유 고객을 대상으로 ${displayKeyword} 상담 연결을 진행합니다. 60평 미만 소형 설치는 연결이 어려울 수 있습니다.`;
    }
  }

  // 7. Prefill Consulting Form values for high-fidelity UX
  const formRegionInput = document.getElementById('consult-region');
  const formPurposeSelect = document.getElementById('consult-purpose');
  const formBuildingSelect = document.getElementById('consult-type');
  
  if (formRegionInput) {
    formRegionInput.value = regionName;
  }
  if (formPurposeSelect) {
    if (keywordType === 'lease') {
      formPurposeSelect.value = 'lease'; // 지붕 임대 수익 검토
    } else if (keywordType === 'business') {
      formPurposeSelect.value = 'business'; // 발전사업 검토
    } else if (keywordType === 'general') {
      formPurposeSelect.value = 'possibility'; // 설치 가능 여부 확인
    } else {
      formPurposeSelect.value = 'savings'; // 전기요금 절감
    }
  }
  if (formBuildingSelect) {
    if (keywordType === 'factory') {
      formBuildingSelect.value = 'factory';
    } else if (keywordType === 'warehouse') {
      formBuildingSelect.value = 'warehouse';
    } else if (keywordType === 'barn') {
      formBuildingSelect.value = 'barn';
    } else if (keywordType === 'building') {
      formBuildingSelect.value = 'rooftop';
    }
  }

  // 8. Update SEO Head elements for valid dynamic landing page
  document.title = `${displayKeyword} 상담 | 비어 있는 공간을 가치 있게 - 솔라링크`;
  
  const metaDesc = document.querySelector('meta[name="description"]');
  const descString = `${regionName}에서 공장·창고·축사·건물 옥상 등 넓은 지붕·부지를 보유하고 있다면 ${keywordLabel} 상담 가능성을 확인해보세요. 솔라링크가 조건 확인 후 전문업체 상담 연결을 돕습니다.`;
  if (metaDesc) {
    metaDesc.setAttribute('content', descString);
  }

  // Canonical setup
  let canonicalLink = document.querySelector('link[rel="canonical"]');
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  const pageCanonicalUrl = `https://www.solarlink.co.kr/?k=${encodeURIComponent(urlRegion)}-${encodeURIComponent(urlKeyword)}`;
  canonicalLink.setAttribute('href', pageCanonicalUrl);

  // Robots setup
  let robotsMeta = document.querySelector('meta[name="robots"]');
  if (!robotsMeta) {
    robotsMeta = document.createElement('meta');
    robotsMeta.setAttribute('name', 'robots');
    document.head.appendChild(robotsMeta);
  }
  robotsMeta.setAttribute('content', 'index, follow');

  // OG Meta setup
  updateOGMeta(
    `${displayKeyword} 상담 | 비어 있는 공간을 가치 있게 - 솔라링크`,
    descString,
    pageCanonicalUrl
  );

  // Schema structured data injection
  injectSchema('dynamic', { displayKeyword });

  // ==========================================
  // Helper Functions (Scoped inside listener)
  // ==========================================

  // Update Open Graph Meta tags
  function updateOGMeta(title, desc, url) {
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute('content', title);

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (!ogDesc) {
      ogDesc = document.createElement('meta');
      ogDesc.setAttribute('property', 'og:description');
      document.head.appendChild(ogDesc);
    }
    ogDesc.setAttribute('content', desc);

    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (!ogUrl) {
      ogUrl = document.createElement('meta');
      ogUrl.setAttribute('property', 'og:url');
      document.head.appendChild(ogUrl);
    }
    ogUrl.setAttribute('content', url);

    let ogImage = document.querySelector('meta[property="og:image"]');
    if (!ogImage) {
      ogImage = document.createElement('meta');
      ogImage.setAttribute('property', 'og:image');
      document.head.appendChild(ogImage);
    }
    ogImage.setAttribute('content', 'https://www.solarlink.co.kr/assets/images/solarlink-og.png');
  }

  // Inject WebSite, Service and FAQPage Schema structured data
  function injectSchema(type, data = {}) {
    const existing = document.getElementById('schema-structured-data');
    if (existing) {
      existing.remove();
    }

    const schemas = [
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "솔라링크",
        "url": "https://www.solarlink.co.kr",
        "description": "60평 이상 건물·지붕·부지 태양광 상담 연결 플랫폼"
      },
      {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "태양광 설치 가능성 상담 연결",
        "provider": {
          "@type": "Organization",
          "name": "솔라링크"
        },
        "areaServed": {
          "@type": "AdministrativeArea",
          "name": "제주 제외 대한민국 전국"
        },
        "serviceType": "태양광 상담 연결"
      }
    ];

    // Build FAQ Q1 dynamically
    const faqQ1 = (type === 'dynamic') 
      ? `${data.displayKeyword} 상담은 60평 이상만 가능한가요?`
      : '60평 미만 건물도 상담 가능한가요?';
      
    const faqA1 = (type === 'dynamic')
      ? `솔라링크는 기본적으로 60평 이상 건물·지붕·부지 보유 고객을 대상으로 ${data.displayKeyword} 상담 연결을 진행합니다. 60평 미만 소형 설치는 연결이 어려울 수 있습니다.`
      : '솔라링크는 기본적으로 60평 이상 건물·지붕·부지 보유 고객을 대상으로 상담 연결을 진행합니다. 60평 미만 소형 설치는 연결이 어려울 수 있습니다.';

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": faqQ1,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faqA1
          }
        },
        {
          "@type": "Question",
          "name": "솔라링크가 직접 시공하나요?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "아닙니다. 솔라링크는 태양광 설치를 검토하는 고객의 상담 정보를 접수하고, 조건에 맞는 전문업체 상담을 연결하는 플랫폼입니다."
          }
        },
        {
          "@type": "Question",
          "name": "지붕만 있으면 바로 설치 가능한가요?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "지붕 면적, 구조안전, 방향, 그림자, 소유 여부, 계통연계 가능성 등을 함께 확인해야 합니다."
          }
        },
        {
          "@type": "Question",
          "name": "수익이나 전기요금 절감이 보장되나요?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "보장되지 않습니다. 설치 방식, 발전량, 계약 조건, 정책, 전력 사용량에 따라 달라지므로 전문업체 상담을 통해 확인해야 합니다."
          }
        },
        {
          "@type": "Question",
          "name": "상담 신청 시 어떤 정보가 필요한가요?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "지역, 건물 유형, 대략적인 면적, 소유 여부, 월 전기요금, 설치 목적을 입력하면 더 정확한 상담 연결이 가능합니다."
          }
        }
      ]
    };

    schemas.push(faqSchema);

    const script = document.createElement('script');
    script.id = 'schema-structured-data';
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schemas, null, 2);
    document.head.appendChild(script);
  }

  // 404/NotFound view renderer
  function showNotFound() {
    ensureTag('main-hero-h1', 'div');
    ensureTag('dynamic-hero-h1', 'div');

    // Hide all normal sections
    const allSections = ['section-hero', 'section-target', 'section-benefits', 'section-types', 'section-precheck', 'section-steps', 'section-trust', 'section-faq', 'consult-form', 'section-dynamic-hero', 'section-dynamic-desc', 'bottom-fixed-cta'];
    allSections.forEach(id => {
      const section = document.getElementById(id);
      if (section) section.classList.add('hidden');
    });

    // Show 404 block
    const notFoundSection = document.getElementById('section-not-found');
    if (notFoundSection) notFoundSection.classList.remove('hidden');

    // Rewrite title for 404
    document.title = `페이지를 찾을 수 없습니다 | 솔라링크`;

    // Robots meta settings to prevent 404 indexing
    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.setAttribute('name', 'robots');
      document.head.appendChild(robotsMeta);
    }
    robotsMeta.setAttribute('content', 'noindex, nofollow');

    // Remove canonical link on 404 page
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.remove();
    }

    // Remove JSON-LD Schema on 404 page
    const schemaScript = document.getElementById('schema-structured-data');
    if (schemaScript) {
      schemaScript.remove();
    }
  }

  function ensureTag(elementId, targetTag) {
    const el = document.getElementById(elementId);
    if (!el) return;
    if (el.tagName.toLowerCase() === targetTag.toLowerCase()) return;
    
    const newEl = document.createElement(targetTag);
    for (let attr of el.attributes) {
      newEl.setAttribute(attr.name, attr.value);
    }
    newEl.innerHTML = el.innerHTML;
    el.parentNode.replaceChild(newEl, el);
  }
});
