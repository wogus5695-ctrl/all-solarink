document.addEventListener('DOMContentLoaded', () => {
  // Page load timestamp for rate-limit spam block (3 seconds minimum limit)
  const pageLoadTime = window.performance ? window.performance.now() : Date.now();
  let lastSubmitTime = 0;
  let isSubmitting = false;

  // 1. FAQ Accordion Control
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const header = item.querySelector('.faq-header');
    const content = item.querySelector('.faq-content');
    
    if (header && content) {
      header.addEventListener('click', () => {
        const isOpen = item.classList.contains('active');
        
        faqItems.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('active');
            const otherContent = otherItem.querySelector('.faq-content');
            if (otherContent) otherContent.style.maxHeight = null;
          }
        });
        
        if (isOpen) {
          item.classList.remove('active');
          content.style.maxHeight = null;
        } else {
          item.classList.add('active');
          content.style.maxHeight = content.scrollHeight + 'px';
        }
      });
    }
  });

  // 2. Area Select Warning Alert Logic
  const areaSelect = document.getElementById('consult-area');
  const alertContainer = document.getElementById('area-warning-alert');

  if (areaSelect && alertContainer) {
    areaSelect.addEventListener('change', (e) => {
      if (e.target.value === 'under-60') {
        alertContainer.classList.remove('hidden');
      } else {
        alertContainer.classList.add('hidden');
      }
    });
  }

  // 3. Form Submission API Handler
  const consultForm = document.getElementById('consult-form-element');
  const submitButton = document.getElementById('btn-submit-form');

  if (consultForm && submitButton) {
    consultForm.addEventListener('submit', (e) => {
      e.preventDefault();

      if (isSubmitting) return;

      // Anti-spam 2: Honeypot field validation
      const honeypotVal = document.getElementById('consult-website').value;
      if (honeypotVal && honeypotVal.trim() !== '') {
        console.warn('[보안 경고] 스팸 필터 감지됨.');
        return;
      }

      // Anti-spam 3: Too fast submission rate limit (Minimum 3 seconds since page load)
      const now = window.performance ? window.performance.now() : Date.now();
      const secondsSinceLoad = (now - pageLoadTime) / 1000;
      if (secondsSinceLoad < 3.0) {
        alert('너무 빠른 제출은 허용되지 않습니다. 잠시 후 다시 시도해주세요.');
        return;
      }

      // Anti-spam 4: Double submission rate limit (Minimum 10 seconds between requests)
      if (lastSubmitTime > 0 && (now - lastSubmitTime) < 10000) {
        alert('이전 상담 신청이 진행 중이거나 연속 제출이 차단되었습니다. 잠시 후 다시 시도해주세요.');
        return;
      }

      // Form validation
      const name = document.getElementById('consult-name').value.trim();
      const phone = document.getElementById('consult-phone').value.trim();
      const region = document.getElementById('consult-region').value.trim();
      const propertyType = document.getElementById('consult-type').value;
      const areaRange = document.getElementById('consult-area').value;
      const ownership = document.getElementById('consult-ownership').value;
      const monthlyElectricBill = document.getElementById('consult-electric').value;
      const purpose = document.getElementById('consult-purpose').value;
      const preferredTime = document.getElementById('consult-time').value;
      const privacyConsent = document.getElementById('agree-privacy').checked;
      const thirdPartyConsent = document.getElementById('agree-thirdparty').checked;

      // Front-end Validation checks
      if (!name || name.length < 2) {
        alert('이름은 2자 이상 입력해주세요.');
        return;
      }
      if (/^[0-9!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/]+$/.test(name)) {
        alert('이름에 숫자 또는 특수문자만 입력할 수 없습니다. 올바른 실명을 입력해주세요.');
        return;
      }

      const cleanPhone = phone.replace(/[-\s]/g, '');
      if (!/^01[016789]\d{7,8}$/.test(cleanPhone)) {
        alert('올바른 휴대폰 번호 형식을 입력해주세요. (예: 010-0000-0000)');
        return;
      }

      if (!region) {
        alert('설치 희망 지역을 입력해주세요.');
        return;
      }
      if (!propertyType) {
        alert('건물/부지 유형을 선택해주세요.');
        return;
      }
      if (!areaRange) {
        alert('대략적인 면적을 선택해주세요.');
        return;
      }
      if (!ownership) {
        alert('소유 여부를 선택해주세요.');
        return;
      }
      if (!monthlyElectricBill) {
        alert('월 평균 전기요금을 선택해주세요.');
        return;
      }
      if (!purpose) {
        alert('설치 목적을 선택해주세요.');
        return;
      }
      if (!privacyConsent || !thirdPartyConsent) {
        alert('개인정보 수집 및 제3자 제공 동의 약관 체크는 필수 사항입니다.');
        return;
      }

      // Gather UTM and campaign metrics
      const urlParams = new URLSearchParams(window.location.search);
      const keywordParam = urlParams.get('k') || '';
      
      let displayKeyword = '';
      if (keywordParam) {
        displayKeyword = decodeURIComponent(keywordParam).replace(/-/g, ' ');
      }

      const leadPayload = {
        name,
        phone,
        region,
        buildingType: propertyType,
        area: areaRange,
        ownership,
        monthlyElectricBill,
        installPurpose: purpose,
        preferredTime,
        privacyConsent,
        thirdPartyConsent,
        pageUrl: window.location.href,
        displayKeyword,
        keywordParam,
        sourceDomain: window.location.hostname,
        referrer: document.referrer || '',
        userAgent: navigator.userAgent,
        website: honeypotVal
      };

      // Set Submitting State (Disable submit button)
      isSubmitting = true;
      submitButton.disabled = true;
      submitButton.textContent = '접수 중입니다...';
      lastSubmitTime = now;

      // Submit leads via AJAX POST Fetch
      fetch('/api/solar-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(leadPayload)
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Server returned error status');
        }
        return response.json();
      })
      .then(resData => {
        isSubmitting = false;
        submitButton.disabled = false;
        submitButton.textContent = '무료 상담 신청하기';
        
        if (resData.ok) {
          // Trigger Success feedback modal
          const successModal = document.getElementById('lead-success-modal');
          if (successModal) {
            successModal.classList.remove('hidden');
          }
          consultForm.reset();
          if (alertContainer) alertContainer.classList.add('hidden');
        } else {
          // Trigger Failure feedback modal
          const failureModal = document.getElementById('lead-failure-modal');
          if (failureModal) {
            failureModal.classList.remove('hidden');
          }
        }
      })
      .catch(error => {
        console.error('[오류] 신청폼 전송 중 에러 발생:', error);
        isSubmitting = false;
        submitButton.disabled = false;
        submitButton.textContent = '무료 상담 신청하기';
        
        // Trigger Failure feedback modal
        const failureModal = document.getElementById('lead-failure-modal');
        if (failureModal) {
          failureModal.classList.remove('hidden');
        }
      });
    });
  }

  // 4. Hero Background Image Slider Logic (5 seconds auto interval transition)
  const setupHeroSlider = (selector) => {
    const heroSlides = document.querySelectorAll(selector);
    if (heroSlides.length > 1) {
      let currentSlideIndex = 0;
      setInterval(() => {
        heroSlides[currentSlideIndex].classList.remove('active');
        currentSlideIndex = (currentSlideIndex + 1) % heroSlides.length;
        heroSlides[currentSlideIndex].classList.add('active');
      }, 5000);
    }
  };
  setupHeroSlider('#section-hero .hero-slide');
  setupHeroSlider('#section-dynamic-hero .hero-slide');

  // 5. Slot Machine Number Rolling Animation for section-benefits
  const revenueSection = document.getElementById('section-benefits');
  if (revenueSection) {
    const startSlotAnimation = () => {
      // Check prefers-reduced-motion
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.querySelectorAll('.slot-digit').forEach(digit => {
          const val = parseInt(digit.getAttribute('data-value'), 10);
          const strip = digit.querySelector('.slot-strip');
          if (strip) strip.style.transform = `translateY(-${val * 10}%)`;
        });
        return;
      }

      const digits = document.querySelectorAll('.slot-digit');
      digits.forEach((digit, index) => {
        const val = parseInt(digit.getAttribute('data-value'), 10);
        const strip = digit.querySelector('.slot-strip');
        if (!strip) return;

        // Force initial state
        strip.style.transform = 'translateY(0%)';
        strip.style.transition = 'none';

        // Trigger reflow
        void strip.offsetHeight;

        // Easing cubic-bezier deceleration like real slot machine
        const delay = index * 100;
        const duration = 1800 + (index * 80);

        strip.style.transition = `transform ${duration}ms cubic-bezier(0.1, 0.85, 0.25, 1) ${delay}ms`;
        strip.style.transform = `translateY(-${val * 10}%)`;
      });
    };

    // Trigger when 40% visible in viewport (once only)
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          startSlotAnimation();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    observer.observe(revenueSection);
  }

  // 6. Pentagon Precheck Section Scroll Animation
  const precheckSection = document.getElementById('section-precheck');
  if (precheckSection) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          precheckSection.classList.add('animate');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    observer.observe(precheckSection);
  }

  // 7. Progress Steps Section Scroll Animation
  const stepsSection = document.getElementById('section-steps');
  if (stepsSection) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          stepsSection.classList.add('animate');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    observer.observe(stepsSection);
  }

  // Exposed Global function to close feedback modals
  window.closeLeadModal = (type) => {
    const successModal = document.getElementById('lead-success-modal');
    const failureModal = document.getElementById('lead-failure-modal');
    
    if (type === 'success' && successModal) {
      successModal.classList.add('hidden');
      // Smooth redirect scroll to top of page
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (type === 'failure' && failureModal) {
      failureModal.classList.add('hidden');
    }
  };
});
