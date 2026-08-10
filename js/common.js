document.addEventListener('DOMContentLoaded', () => {
  // 1. Header scroll effect
  const header = document.querySelector('.header');
  const handleScroll = () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Init on load

  // 2. Mobile Drawer Navigation Toggle
  const hamburger = document.querySelector('.hamburger');
  const drawer = document.querySelector('.drawer');
  const drawerOverlay = document.querySelector('.drawer-overlay');
  const drawerLinks = document.querySelectorAll('.drawer-link');

  const toggleDrawer = () => {
    hamburger.classList.toggle('active');
    drawer.classList.toggle('open');
    drawerOverlay.classList.toggle('visible');
    document.body.classList.toggle('overflow-hidden');
  };

  const closeDrawer = () => {
    hamburger.classList.remove('active');
    drawer.classList.remove('open');
    drawerOverlay.classList.remove('visible');
    document.body.classList.remove('overflow-hidden');
  };

  if (hamburger) hamburger.addEventListener('click', toggleDrawer);
  if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);
  
  drawerLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  // 3. Fixed Bottom CTA scroll trigger
  const fixedCta = document.querySelector('.fixed-cta');
  const heroSection = document.querySelector('.hero');
  
  const handleCtaVisibility = () => {
    if (!fixedCta) return;
    
    // Show fixed CTA when user scrolls past 300px or when hero is out of view
    const triggerHeight = heroSection ? heroSection.offsetHeight - 100 : 400;
    
    if (window.scrollY > triggerHeight) {
      fixedCta.classList.add('visible');
    } else {
      fixedCta.classList.remove('visible');
    }
  };
  
  window.addEventListener('scroll', handleCtaVisibility);
  handleCtaVisibility(); // Run initially

  // 4. Smooth Anchor Scrolling for CTA buttons
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        
        // Compensate for fixed header height
        const headerOffset = window.innerWidth > 1024 ? 72 : 58;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // 5. Centralized Phone Number Management (Loaded dynamically from window.SOLAR_CONFIG)
  const config = window.SOLAR_CONFIG || {
    BRAND_NAME: "솔라링크",
    PHONE_DISPLAY: "010-0000-0000",
    PHONE_TEL: "tel:01000000000"
  };

  const PHONE_NUMBER = config.PHONE_DISPLAY;
  const PHONE_TEL = config.PHONE_TEL;

  const updateTelLinks = () => {
    document.querySelectorAll('a[href^="tel:"]').forEach(link => {
      link.setAttribute('href', '#consult-form');
      link.textContent = '무료 상담 신청';
    });

    // Update footer contacts representation as plain text (non-clickable)
    const footerLinks = document.querySelectorAll('.footer-links ul li');
    footerLinks.forEach(li => {
      if (li.textContent.includes('대표 번호') || li.textContent.includes('010-0000-0000')) {
        li.innerHTML = `대표 번호: ${PHONE_NUMBER}`;
      }
    });
  };

  updateTelLinks();
  // Expose to window for dynamic modals
  window.PHONE_NUMBER = PHONE_NUMBER;
  window.PHONE_TEL = PHONE_TEL;
});

