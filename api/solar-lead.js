module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, message: 'Method Not Allowed' });
  }

  try {
    const {
      name,
      phone,
      region,
      buildingType,
      area,
      ownership,
      monthlyElectricBill,
      privacyConsent,
      thirdPartyConsent,
      installPurpose = '',
      preferredTime = '',
      pageUrl = '',
      displayKeyword = '',
      keywordParam = '',
      sourceDomain = '',
      referrer = '',
      userAgent = '',
      website // Honeypot field
    } = req.body || {};

    // 1. Honeypot check for bots
    if (website && website.trim() !== '') {
      // Return fake success to spammer bot without saving to Google Sheets
      return res.status(200).json({
        ok: true,
        message: '상담 신청이 접수되었습니다.'
      });
    }

    // 2. Mandatory validations
    if (!name || !name.trim()) {
      return res.status(400).json({ ok: false, message: '이름/담당자명을 입력해주세요.' });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ ok: false, message: '연락처를 입력해주세요.' });
    }
    if (!region || !region.trim()) {
      return res.status(400).json({ ok: false, message: '설치 희망 지역을 입력해주세요.' });
    }
    if (!buildingType || !buildingType.trim()) {
      return res.status(400).json({ ok: false, message: '건물/부지 유형을 선택해주세요.' });
    }
    if (!area || !area.trim()) {
      return res.status(400).json({ ok: false, message: '대략적인 면적을 입력해주세요.' });
    }
    if (!ownership || !ownership.trim()) {
      return res.status(400).json({ ok: false, message: '소유 여부를 선택해주세요.' });
    }
    if (!monthlyElectricBill || !monthlyElectricBill.trim()) {
      return res.status(400).json({ ok: false, message: '월 평균 전기요금을 선택해주세요.' });
    }
    if (privacyConsent !== true) {
      return res.status(400).json({ ok: false, message: '개인정보 수집 및 이용 동의가 필요합니다.' });
    }
    if (thirdPartyConsent !== true) {
      return res.status(400).json({ ok: false, message: '개인정보 제3자 제공 동의가 필요합니다.' });
    }

    // 3. Env check
    const targetUrl = process.env.GOOGLE_SCRIPT_WEBAPP_URL;
    if (!targetUrl) {
      console.error('Error: GOOGLE_SCRIPT_WEBAPP_URL environment variable is missing.');
      return res.status(500).json({
        ok: false,
        message: '접수 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
      });
    }

    // 4. Construct payload for Google Apps Script
    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      region: region.trim(),
      buildingType: buildingType.trim(),
      area: area.trim(),
      ownership: ownership.trim(),
      monthlyElectricBill: monthlyElectricBill.trim(),
      installPurpose: installPurpose.trim(),
      preferredTime: preferredTime.trim(),
      privacyConsent: !!privacyConsent,
      thirdPartyConsent: !!thirdPartyConsent,
      pageUrl: pageUrl.trim(),
      displayKeyword: displayKeyword.trim(),
      keywordParam: keywordParam.trim(),
      sourceDomain: sourceDomain.trim(),
      referrer: referrer.trim(),
      userAgent: userAgent.trim()
    };

    // 5. Send POST to Google Apps Script
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error(`Google Script returned error status: ${response.status}`);
      return res.status(500).json({
        ok: false,
        message: '접수 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
      });
    }

    let result = {};
    try {
      result = await response.json();
    } catch (e) {
      console.warn('Could not parse Google Script response as JSON');
    }

    if (result.result === 'success' || result.status === 'success' || response.status === 200) {
      return res.status(200).json({
        ok: true,
        message: '상담 신청이 접수되었습니다. 조건 확인 후 상담 연결을 도와드리겠습니다.'
      });
    } else {
      console.error('Google Script returned failure:', result);
      return res.status(500).json({
        ok: false,
        message: '접수 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
      });
    }
  } catch (error) {
    console.error('Exception caught in solar-lead API:', error.message);
    return res.status(500).json({
      ok: false,
      message: '접수 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    });
  }
};
