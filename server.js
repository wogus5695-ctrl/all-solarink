const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

// Native .env file parser (zero dependencies setup)
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const firstEqual = trimmed.indexOf('=');
      if (firstEqual > 0) {
        const key = trimmed.substring(0, firstEqual).trim();
        const value = trimmed.substring(firstEqual + 1).trim().replace(/^['"]|['"]$/g, '');
        process.env[key] = value;
      }
    });
    console.log('[설정] .env 환경변수를 성공적으로 로드했습니다.');
  }
} catch (err) {
  console.warn('[알림] .env 로딩 우회:', err.message);
}

// Import centralized site config file
const siteConfig = require('./js/siteConfig.js');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8'
};

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  let pathname = parsedUrl.pathname;

  // 1. API Route: POST /api/leads
  if (req.method === 'POST' && pathname === '/api/leads') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const leadData = JSON.parse(body);

        // Anti-spam honeypot check
        if (leadData.honeypot && leadData.honeypot.trim() !== '') {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'Spam detected.' }));
          return;
        }

        // Backend validations
        const validation = validateLead(leadData);
        if (!validation.valid) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: validation.message }));
          return;
        }

        // Calculate Lead Grade and flags
        const { grade, flags } = calculateLeadGrade(leadData);
        leadData.leadGrade = grade;
        leadData.leadFlags = flags;
        leadData.submittedAt = new Date().toISOString();

        // Save lead locally (leads.jsonl)
        saveLead(leadData);

        // Trigger Notification webhook/emails asynchronously
        sendLeadNotification(leadData)
          .then(() => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: '상담 신청이 접수되었습니다.' }));
          })
          .catch(err => {
            console.error('[오류] 알림 전송 중 예외 발생:', err.message);
            // Succeed anyway to keep submission functional for user
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: '상담 신청이 접수되었습니다.' }));
          });
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: '서버 처리 중 오류가 발생했습니다.' }));
      }
    });
    return;
  }

  // 2. Static clean URLs routing map
  if (pathname === '/') {
    pathname = '/index.html';
  } 
  else if (pathname === '/solar-guide') {
    pathname = '/solar-guide.html';
  } 
  else if (pathname === '/sitemap-solar') {
    pathname = '/sitemap-solar.html';
  }
  else if (pathname === '/privacy') {
    pathname = '/privacy.html';
  }
  else if (pathname === '/third-party-consent') {
    pathname = '/third-party-consent.html';
  }

  const safePathname = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(__dirname, safePathname);
  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 - 페이지를 찾을 수 없습니다.');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(`500 - 서버 오류가 발생했습니다: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

// ==========================================
// Lead validation and calculation helpers
// ==========================================

function validateLead(data) {
  if (!data.name || data.name.trim().length < 2) {
    return { valid: false, message: '이름은 2자 이상 입력해주세요.' };
  }
  if (/^[0-9!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/]+$/.test(data.name.trim())) {
    return { valid: false, message: '올바른 형식의 이름을 입력해주세요.' };
  }

  if (!data.phone || data.phone.trim() === '') {
    return { valid: false, message: '연락처를 입력해주세요.' };
  }
  const cleanPhone = data.phone.replace(/[-\s]/g, '');
  if (!/^01[016789]\d{7,8}$/.test(cleanPhone)) {
    return { valid: false, message: '올바른 휴대폰 번호 형식을 입력해주세요. (예: 010-0000-0000)' };
  }

  if (!data.region || data.region.trim() === '') {
    return { valid: false, message: '설치 희망 지역을 입력해주세요.' };
  }
  if (!data.propertyType) {
    return { valid: false, message: '건물/부지 유형을 선택해주세요.' };
  }
  if (!data.areaRange) {
    return { valid: false, message: '대략적인 면적을 선택해주세요.' };
  }
  if (!data.ownership) {
    return { valid: false, message: '소유 여부를 선택해주세요.' };
  }
  if (!data.monthlyElectricBill) {
    return { valid: false, message: '월 평균 전기요금을 선택해주세요.' };
  }
  if (!data.purpose) {
    return { valid: false, message: '설치 목적을 선택해주세요.' };
  }

  if (!data.privacyConsent || !data.thirdPartyConsent) {
    return { valid: false, message: '필수 개인정보 수집 및 제3자 제공 약관에 동의해주세요.' };
  }

  return { valid: true };
}

function calculateLeadGrade(data) {
  const area = data.areaRange;
  const ownership = data.ownership;
  const type = data.propertyType;
  const purpose = data.purpose;

  let grade = 'D';
  const flags = [];

  if (area === 'under-60') {
    flags.push('under_60_pyeong');
  }
  if (ownership === 'tenant') {
    flags.push('renter');
  }
  if (area === 'unknown') {
    flags.push('missing_area');
  }

  const isHighArea = (area === '100-300' || area === '300-up');
  const isMedArea = (area === '60-100');
  const isOwner = (ownership === 'owner' || ownership === 'family' || ownership === 'corporate');
  const isStandardType = (type === 'factory' || type === 'warehouse' || type === 'barn' || type === 'rooftop' || type === 'land');
  const isStandardPurpose = (purpose === 'savings' || purpose === 'lease' || purpose === 'business');

  if (isHighArea && isOwner && isStandardType && isStandardPurpose) {
    grade = 'A';
  } else if (isMedArea && isOwner && isStandardPurpose) {
    grade = 'B';
  } else if (area === 'unknown' || ownership === 'manager' || ownership === 'unknown') {
    grade = 'C';
  } else {
    grade = 'D';
  }

  return { grade, flags };
}

function saveLead(data) {
  try {
    const filePath = path.join(__dirname, 'leads.jsonl');
    const record = JSON.stringify(data) + '\n';
    fs.appendFileSync(filePath, record, 'utf8');
    
    // Safety Log masking for compliance (홍길동 -> 홍**, 010-1234-5678 -> 010-****-5678)
    const maskedName = maskName(data.name);
    const maskedPhone = maskPhone(data.phone);
    
    console.log(`[리드 저장] 등급: ${data.leadGrade} | 이름: ${maskedName} | 연락처: ${maskedPhone} | 지역: ${data.region} | 면적: ${data.areaRange} | 플래그: ${JSON.stringify(data.leadFlags)}`);
  } catch (error) {
    console.error('[오류] 리드 저장 실패:', error);
  }
}

// Masking Utilities
function maskName(name) {
  if (!name) return '';
  const len = name.trim().length;
  if (len <= 1) return '*';
  if (len === 2) return name.trim()[0] + '*';
  return name.trim()[0] + '*'.repeat(len - 1);
}

function maskPhone(phone) {
  if (!phone) return '';
  return phone.trim().replace(/^(01\d{1})-?(\d{3,4})-?(\d{4})$/, '$1-****-$3');
}

// ==========================================
// Webhook & Email Notification Integrations
// ==========================================

function sendLeadNotification(leadData) {
  return Promise.all([
    sendWebhookLead(leadData),
    sendEmailLead(leadData)
  ]).then(results => {
    const webhookResult = results[0];
    const emailResult = results[1];
    console.log(`[알림 처리 완료] Webhook: ${webhookResult.bypassed ? '비활성' : webhookResult.success ? '성공' : '실패'} | Email: ${emailResult.bypassed ? '비활성' : emailResult.success ? '성공' : '실패'}`);
  });
}

function mapKeysToLabels(data) {
  const propertyMap = { factory: '공장', warehouse: '창고', barn: '축사', commercial: '상가/근린생활시설', rooftop: '건물 옥상', land: '유휴 부지', etc: '기타' };
  const areaMap = { 'under-60': '60평 미만', '60-100': '60~100평', '100-300': '100~300평', '300-up': '300평 이상', unknown: '잘 모르겠음' };
  const ownershipMap = { owner: '소유자', family: '가족 소유', corporate: '법인 소유 건물 담당자', tenant: '임차인', manager: '관리자', unknown: '잘 모르겠음' };
  const billMap = { 'under-50': '50만원 미만', '50-100': '50~100만원', '100-300': '100~300만원', '300-500': '300~500만원', '500-up': '500만원 이상', unknown: '잘 모르겠음' };
  const purposeMap = { savings: '전기요금 절감', lease: '지붕 임대 수익 검토', business: '발전사업 검토', possibility: '설치 가능 여부 확인', etc: '기타' };
  const timeMap = { morning: '오전', afternoon: '오후', evening: '저녁', anytime: '언제든 가능' };

  return {
    ...data,
    propertyType: propertyMap[data.propertyType] || data.propertyType,
    areaRange: areaMap[data.areaRange] || data.areaRange,
    ownership: ownershipMap[data.ownership] || data.ownership,
    monthlyElectricBill: billMap[data.monthlyElectricBill] || data.monthlyElectricBill,
    purpose: purposeMap[data.purpose] || data.purpose,
    preferredTime: timeMap[data.preferredTime] || data.preferredTime || '미지정'
  };
}

function sendWebhookLead(leadData) {
  const webhookUrl = process.env.LEAD_WEBHOOK_URL;
  if (!webhookUrl || webhookUrl.trim() === '') {
    return Promise.resolve({ success: true, bypassed: true });
  }

  return new Promise((resolve) => {
    try {
      const url = new URL(webhookUrl);
      const client = url.protocol === 'https:' ? require('https') : require('http');
      
      // Map select keys to readable Korean labels for webhook receivers
      const mappedData = mapKeysToLabels(leadData);
      const postData = JSON.stringify({
        brand: siteConfig.BRAND_NAME,
        ...mappedData
      });

      const options = {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = client.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          resolve({ success: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode });
        });
      });

      req.on('error', (e) => {
        console.error('[오류] Webhook 전송 실패:', e.message);
        resolve({ success: false, error: e.message });
      });

      req.write(postData);
      req.end();
    } catch (err) {
      console.error('[오류] Webhook URL 파싱 에러:', err.message);
      resolve({ success: false, error: err.message });
    }
  });
}

function sendEmailLead(leadData) {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const to = process.env.LEAD_EMAIL_TO;
  const from = process.env.LEAD_EMAIL_FROM || user;

  if (!host || !port || !user || !pass || !to) {
    return Promise.resolve({ success: true, bypassed: true });
  }

  return new Promise((resolve) => {
    try {
      // Load nodemailer dynamically to protect runtime in environment where npm install was not run
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        host: host,
        port: parseInt(port),
        secure: parseInt(port) === 465,
        auth: { user, pass }
      });

      const mappedData = mapKeysToLabels(leadData);
      const subject = `[${siteConfig.BRAND_NAME} 상담신청] ${mappedData.leadGrade}급 / ${mappedData.region} / ${mappedData.propertyType} / ${mappedData.purpose}`;
      
      const htmlBody = `
        <h3>[${siteConfig.BRAND_NAME}] 새로운 태양광 상담 신청 내역</h3>
        <table border="1" cellpadding="6" cellspacing="0" style="border-collapse: collapse;">
          <tr><th>리드 등급</th><td><strong>${mappedData.leadGrade}</strong></td></tr>
          <tr><th>성함 / 담당자</th><td>${mappedData.name}</td></tr>
          <tr><th>연락처</th><td>${mappedData.phone}</td></tr>
          <tr><th>지역</th><td>${mappedData.region}</td></tr>
          <tr><th>유형</th><td>${mappedData.propertyType}</td></tr>
          <tr><th>면적</th><td>${mappedData.areaRange}</td></tr>
          <tr><th>소유 여부</th><td>${mappedData.ownership}</td></tr>
          <tr><th>전기요금</th><td>${mappedData.monthlyElectricBill}</td></tr>
          <tr><th>설치 목적</th><td>${mappedData.purpose}</td></tr>
          <tr><th>희망 시간</th><td>${mappedData.preferredTime}</td></tr>
          <tr><th>페이지 구분</th><td>${mappedData.source.pageType}</td></tr>
          <tr><th>동적 키워드</th><td>${mappedData.source.displayKeyword || '없음'} (k: ${mappedData.source.kParam || '없음'})</td></tr>
          <tr><th>유입 주소</th><td><a href="${mappedData.source.currentUrl}">${mappedData.source.currentUrl}</a></td></tr>
          <tr><th>유입 채널</th><td>UTM: [${mappedData.source.utm_source || '-'}/${mappedData.source.utm_medium || '-'}/${mappedData.source.utm_campaign || '-'}]</td></tr>
          <tr><th>레퍼러</th><td>${mappedData.source.referrer || '-'}</td></tr>
          <tr><th>접수 시간</th><td>${mappedData.submittedAt}</td></tr>
          <tr><th>개인정보수집동의</th><td>${mappedData.privacyConsent ? '동의함' : '동의안함'}</td></tr>
          <tr><th>제3자제공동의</th><td>${mappedData.thirdPartyConsent ? '동의함' : '동의안함'}</td></tr>
        </table>
      `;

      const mailOptions = {
        from,
        to,
        subject,
        html: htmlBody
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('[오류] 이메일 발송 실패:', error.message);
          resolve({ success: false, error: error.message });
        } else {
          console.log('[이메일 발송 완료] Message ID:', info.messageId);
          resolve({ success: true });
        }
      });
    } catch (err) {
      console.warn('[알림] nodemailer 모듈이 없어 메일 전송을 우회합니다. (npm install nodemailer 필요)');
      resolve({ success: true, bypassed: true, error: err.message });
    }
  });
}

server.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`  ☀️ [솔라링크] 로컬 개발 서버 구동 완료 ☀️`);
  console.log(`==================================================`);
  console.log(`- 메인 페이지: http://localhost:${PORT}`);
  console.log(`- 설치 가이드: http://localhost:${PORT}/solar-guide`);
  console.log(`- 사이트맵 허브: http://localhost:${PORT}/sitemap-solar`);
  console.log(`==================================================\n`);
});
