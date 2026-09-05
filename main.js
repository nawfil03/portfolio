// Frame Sequence Configuration (Suit Sequence - 300 Frames)
const FRAME_COUNT = 300;
const frames = [];
let loadedFramesCount = 0;
let currentFrameIndex = 0;
let targetFrameIndex = 0;
let isCanvasReady = false;

const canvas = document.getElementById('sequence-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;
const sequenceSection = document.getElementById('hero-sequence');
const loaderElement = document.getElementById('sequence-loader');
const loaderProgressBar = document.getElementById('loader-progress');
const sideCards = document.querySelectorAll('.sequence-card');

// Cyber Scroll Progress Gauge Elements
const hudProgressText = document.getElementById('hud-progress-text');
const hudProgressBar = document.getElementById('hud-progress-bar');

// Generate frame image paths
function getFrameSrc(index) {
  const frameNum = String(index + 1).padStart(3, '0');
  return `/frames/ezgif-frame-${frameNum}.jpg`;
}

// Preload sequence frames
function preloadFrames() {
  if (!canvas || !ctx) return;

  for (let i = 0; i < FRAME_COUNT; i++) {
    const img = new Image();
    img.src = getFrameSrc(i);

    img.onload = () => {
      loadedFramesCount++;
      const progressPercent = Math.floor((loadedFramesCount / FRAME_COUNT) * 100);
      if (loaderProgressBar) {
        loaderProgressBar.style.width = `${progressPercent}%`;
      }

      if (loadedFramesCount === 1) {
        // Render first frame immediately
        isCanvasReady = true;
        renderCanvasFrame(0);
      }

      if (loadedFramesCount === FRAME_COUNT) {
        // All frames loaded
        if (loaderElement) {
          loaderElement.classList.add('loaded');
        }
        document.body.classList.remove('loading');
      }
    };

    img.onerror = () => {
      loadedFramesCount++;
    };

    frames.push(img);
  }

  // Safety timeout
  setTimeout(() => {
    if (loaderElement && !loaderElement.classList.contains('loaded')) {
      loaderElement.classList.add('loaded');
      document.body.classList.remove('loading');
    }
  }, 3500);
}

let currentCanvasW = 0;
let currentCanvasH = 0;

function ensureCanvasDimensions(width, height, dpr) {
  if (!canvas) return;
  const targetW = Math.floor(width * dpr);
  const targetH = Math.floor(height * dpr);

  // ONLY re-assign canvas width/height if width changes OR height changes by > 80px (e.g. device orientation change)
  if (Math.abs(canvas.width - targetW) > 4 || Math.abs(canvas.height - targetH) > 80 || canvas.width === 0) {
    canvas.width = targetW;
    canvas.height = targetH;
    currentCanvasW = width;
    currentCanvasH = height;
  }
}

// Canvas Render Function: Zero Boundary Line & Exact Photo Edge Gradient Matching
function renderCanvasFrame(index) {
  if (!ctx || !canvas || !frames[index] || !frames[index].complete) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const isMobile = window.innerWidth < 768;

  const width = isMobile ? (canvas.clientWidth || window.innerWidth - 32) : window.innerWidth;
  const height = isMobile ? (canvas.clientHeight || 380) : window.innerHeight;

  ensureCanvasDimensions(width, height, dpr);

  ctx.save();
  ctx.scale(dpr, dpr);

  // 1. Draw horizontal background gradient matching photo left edge (#ececec) and right edge (#f0f0f0)
  let bgGrad = ctx.createLinearGradient(0, 0, width, 0);
  bgGrad.addColorStop(0, '#ececec');
  bgGrad.addColorStop(0.5, '#eeeeee');
  bgGrad.addColorStop(1, '#f0f0f0');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  const img = frames[index];
  const imgWidth = img.naturalWidth || 1080;
  const imgHeight = img.naturalHeight || 1920;
  const imgRatio = imgWidth / imgHeight;

  // Uncropped contain scaling: full face & suit posture visible
  let drawHeight = height * (isMobile ? 0.95 : 0.94);
  let drawWidth = drawHeight * imgRatio;

  const maxRatioWidth = isMobile ? 0.95 : 0.46;
  if (drawWidth > width * maxRatioWidth) {
    drawWidth = width * maxRatioWidth;
    drawHeight = drawWidth / imgRatio;
  }

  const offsetX = (width - drawWidth) / 2;
  const offsetY = (height - drawHeight) / 2;

  // 2. Render raw frame image
  ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

  // 3. Dissolve ONLY the 10 outer pixels (far background margin) of the image rectangle
  const edgeBlendX = 10;

  // Left 10px edge line dissolve
  let gLeft = ctx.createLinearGradient(offsetX, 0, offsetX + edgeBlendX, 0);
  gLeft.addColorStop(0, '#ececec');
  gLeft.addColorStop(1, 'rgba(236, 236, 236, 0)');
  ctx.fillStyle = gLeft;
  ctx.fillRect(offsetX - 1, offsetY, edgeBlendX + 1, drawHeight);

  // Right 10px edge line dissolve
  let gRight = ctx.createLinearGradient(offsetX + drawWidth - edgeBlendX, 0, offsetX + drawWidth, 0);
  gRight.addColorStop(0, 'rgba(240, 240, 240, 0)');
  gRight.addColorStop(1, '#f0f0f0');
  ctx.fillStyle = gRight;
  ctx.fillRect(offsetX + drawWidth - edgeBlendX, offsetY, edgeBlendX + 1, drawHeight);

  ctx.restore();
}

// Scroll controller for 300-frame sequence, HUD progress gauge, and side text overlays
function updateSequenceOnScroll() {
  if (!sequenceSection) return;

  const rect = sequenceSection.getBoundingClientRect();
  const sectionHeight = sequenceSection.offsetHeight - window.innerHeight;

  if (sectionHeight <= 0) return;

  // Calculate scroll progress (0.0 to 1.0)
  const scrollProgress = Math.min(1, Math.max(0, -rect.top / sectionHeight));

  // Determine target frame index (0 to 299)
  targetFrameIndex = Math.min(FRAME_COUNT - 1, Math.max(0, Math.floor(scrollProgress * (FRAME_COUNT - 1))));

  // Update Cyber Scroll Progress Gauge
  const progressPercent = Math.round(scrollProgress * 100);
  if (hudProgressText) {
    hudProgressText.textContent = `SCRUB // ${progressPercent}%`;
  }
  if (hudProgressBar) {
    hudProgressBar.style.width = `${progressPercent}%`;
  }

  // Determine active side text overlay stage
  let activeStage = 0;
  if (scrollProgress >= 0.72) {
    activeStage = 3;
  } else if (scrollProgress >= 0.48) {
    activeStage = 2;
  } else if (scrollProgress >= 0.22) {
    activeStage = 1;
  } else {
    activeStage = 0;
  }

  sideCards.forEach(card => {
    const cardStage = parseInt(card.getAttribute('data-stage'), 10);
    if (cardStage === activeStage) {
      card.classList.add('active');
    } else {
      card.classList.remove('active');
    }
  });
}

// Animation loop with responsive mobile touch tracking & smooth desktop LERP
function animateSequenceLoop() {
  if (isCanvasReady) {
    const diff = targetFrameIndex - currentFrameIndex;
    const isMobile = window.innerWidth < 768;
    const lerpFactor = isMobile ? 0.32 : 0.08;

    if (Math.abs(diff) > 0.01) {
      currentFrameIndex += diff * lerpFactor;
      renderCanvasFrame(Math.round(currentFrameIndex));
    }
  }
  requestAnimationFrame(animateSequenceLoop);
}

// Initialize sequence
preloadFrames();
animateSequenceLoop();

window.addEventListener('scroll', updateSequenceOnScroll, { passive: true });
window.addEventListener('touchmove', updateSequenceOnScroll, { passive: true });

let lastWindowWidth = window.innerWidth;
window.addEventListener('resize', () => {
  if (Math.abs(window.innerWidth - lastWindowWidth) > 10) {
    lastWindowWidth = window.innerWidth;
    if (isCanvasReady) {
      renderCanvasFrame(Math.round(currentFrameIndex));
    }
  }
});
updateSequenceOnScroll();

// ==========================================================================
// AMAZING 3D REVOLVING CYBER SPHERE ENGINE (AI DATA VECTOR CORE)
// ==========================================================================
function initCyberSphereCanvas() {
  const sCanvas = document.getElementById('cyber-sphere-canvas');
  if (!sCanvas) return;
  const sCtx = sCanvas.getContext('2d');

  let width = sCanvas.width = sCanvas.clientWidth || 440;
  let height = sCanvas.height = sCanvas.clientHeight || 440;

  const points = [];
  const pointCount = 200;
  const radius = width * 0.38;

  // Generate 3D sphere point coordinates
  for (let i = 0; i < pointCount; i++) {
    const theta = Math.acos(-1 + (2 * i) / pointCount);
    const phi = Math.sqrt(pointCount * Math.PI) * theta;

    points.push({
      x: radius * Math.sin(theta) * Math.cos(phi),
      y: radius * Math.sin(theta) * Math.sin(phi),
      z: radius * Math.cos(theta)
    });
  }

  let rotX = 0.005;
  let rotY = 0.008;
  let mouseRotX = 0;
  let mouseRotY = 0;

  window.addEventListener('mousemove', e => {
    mouseRotY = (e.clientX / window.innerWidth - 0.5) * 0.015;
    mouseRotX = (e.clientY / window.innerHeight - 0.5) * 0.015;
  });

  function renderSphere() {
    sCtx.clearRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;

    const angleX = rotX + mouseRotX;
    const angleY = rotY + mouseRotY;

    // Rotate points
    points.forEach(p => {
      // Rotate around Y
      let x1 = p.x * Math.cos(angleY) - p.z * Math.sin(angleY);
      let z1 = p.z * Math.cos(angleY) + p.x * Math.sin(angleY);

      // Rotate around X
      let y2 = p.y * Math.cos(angleX) - z1 * Math.sin(angleX);
      let z2 = z1 * Math.cos(angleX) + p.y * Math.sin(angleX);

      p.x = x1;
      p.y = y2;
      p.z = z2;
    });

    // Sort by depth for correct Z rendering
    points.sort((a, b) => b.z - a.z);

    // Draw connecting mesh lines
    sCtx.lineWidth = 0.7;
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j += 6) {
        const dx = points[i].x - points[j].x;
        const dy = points[i].y - points[j].y;
        const dz = points[i].z - points[j].z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < radius * 0.55) {
          const alpha = (1 - dist / (radius * 0.55)) * 0.25 * ((points[i].z + radius) / (2 * radius));
          sCtx.strokeStyle = `rgba(37, 99, 235, ${Math.max(0.05, alpha)})`;
          sCtx.beginPath();
          sCtx.moveTo(cx + points[i].x, cy + points[i].y);
          sCtx.lineTo(cx + points[j].x, cy + points[j].y);
          sCtx.stroke();
        }
      }
    }

    // Draw 3D nodes
    points.forEach(p => {
      const scale = (p.z + radius * 1.5) / (radius * 2.5);
      const alpha = Math.max(0.15, Math.min(1, scale * 0.85));
      const pRadius = Math.max(1, scale * 2.8);

      sCtx.fillStyle = `rgba(37, 99, 235, ${alpha})`;
      sCtx.beginPath();
      sCtx.arc(cx + p.x, cy + p.y, pRadius, 0, Math.PI * 2);
      sCtx.fill();
    });

    requestAnimationFrame(renderSphere);
  }

  renderSphere();
}

initCyberSphereCanvas();

// ==========================================================================
// INTERACTIVE KINETIC TECH MATRIX NODE CANVAS
// ==========================================================================
function initMatrixCanvas() {
  const mCanvas = document.getElementById('tech-matrix-canvas');
  if (!mCanvas) return;
  const mCtx = mCanvas.getContext('2d');

  let width = mCanvas.width = mCanvas.parentElement.clientWidth;
  let height = mCanvas.height = mCanvas.parentElement.clientHeight;

  const nodes = [];
  const nodeCount = 38;

  for (let i = 0; i < nodeCount; i++) {
    nodes.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.7,
      vy: (Math.random() - 0.5) * 0.7,
      radius: Math.random() * 2 + 1.5
    });
  }

  function drawMatrix() {
    mCtx.clearRect(0, 0, width, height);

    // Draw connecting lines between close nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 140) {
          const alpha = (1 - dist / 140) * 0.35;
          mCtx.strokeStyle = `rgba(37, 99, 235, ${alpha})`;
          mCtx.lineWidth = 1;
          mCtx.beginPath();
          mCtx.moveTo(nodes[i].x, nodes[i].y);
          mCtx.lineTo(nodes[j].x, nodes[j].y);
          mCtx.stroke();
        }
      }
    }

    // Draw nodes
    nodes.forEach(node => {
      node.x += node.vx;
      node.y += node.vy;

      if (node.x < 0 || node.x > width) node.vx *= -1;
      if (node.y < 0 || node.y > height) node.vy *= -1;

      mCtx.fillStyle = '#2563eb';
      mCtx.beginPath();
      mCtx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      mCtx.fill();
    });

    requestAnimationFrame(drawMatrix);
  }

  drawMatrix();

  window.addEventListener('resize', () => {
    if (mCanvas.parentElement) {
      width = mCanvas.width = mCanvas.parentElement.clientWidth;
      height = mCanvas.height = mCanvas.parentElement.clientHeight;
    }
  });
}

initMatrixCanvas();

// ==========================================================================
// 3D PERSPECTIVE TILT & SPOTLIGHT RADIAL GLOW
// ==========================================================================
function initTiltCards() {
  const tiltCards = document.querySelectorAll('.tilt-card');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
    });
  });
}

initTiltCards();

// Interactive Developer Terminal Screen Tab Switching
const termButtons = document.querySelectorAll('.term-btn');
const termPanes = document.querySelectorAll('.term-pane');

termButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const targetTab = btn.getAttribute('data-tab');

    termButtons.forEach(b => b.classList.remove('active'));
    termPanes.forEach(p => p.classList.remove('active'));

    btn.classList.add('active');
    const activePane = document.getElementById(`pane-${targetTab}`);
    if (activePane) {
      activePane.classList.add('active');
    }
  });
});

// Interactive Skill Matrix Filter (Pills & Bars)
const skillTabs = document.querySelectorAll('.skill-tab');
const skillItems = document.querySelectorAll('.skill-item');
const skillBarItems = document.querySelectorAll('.skill-bar-item');

skillTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const filter = tab.getAttribute('data-filter');

    skillTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    skillItems.forEach(item => {
      const cat = item.getAttribute('data-cat');
      if (filter === 'all' || cat === filter) {
        item.classList.remove('dimmed');
      } else {
        item.classList.add('dimmed');
      }
    });

    skillBarItems.forEach(bar => {
      const cat = bar.getAttribute('data-cat');
      if (filter === 'all' || cat === filter) {
        bar.style.opacity = '1';
        bar.style.transform = 'scale(1)';
      } else {
        bar.style.opacity = '0.3';
        bar.style.transform = 'scale(0.98)';
      }
    });
  });
});

// Mobile Navigation Toggle
const menuButton = document.querySelector('.menu-button');
const mobileMenu = document.querySelector('.mobile-menu');

if (menuButton && mobileMenu) {
  const closeMenu = () => {
    mobileMenu.classList.remove('active');
    mobileMenu.setAttribute('aria-hidden', 'true');
    menuButton.setAttribute('aria-expanded', 'false');
  };

  menuButton.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('active');
    mobileMenu.setAttribute('aria-hidden', String(!isOpen));
    menuButton.setAttribute('aria-expanded', String(isOpen));
  });

  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });
}

// Topbar scroll shadow sync
const topbar = document.querySelector('.topbar');
if (topbar) {
  const syncTopbarState = () => {
    topbar.classList.toggle('scrolled', window.scrollY > 12);
  };
  syncTopbarState();
  window.addEventListener('scroll', syncTopbarState, { passive: true });
}

// Reveal elements observer for lower sections
const revealElements = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -5% 0px' }
);
revealElements.forEach(element => revealObserver.observe(element));

// RENDER REAL ATS RESUME PROJECTS
function renderResumeProjects() {
  const container = document.getElementById('projects-container');
  if (!container) return;

  const resumeProjects = [
    {
      title: 'AI Agent Prototypes',
      id: 'PROJECT 01',
      badge: 'BOOKING & VIRTUAL SUPPORT',
      desc: 'Designed and built multiple AI agent prototypes for booking automation, customer assistance, and general-purpose task handling using RAG pipelines, LangChain, LangSmith, and prompt injection for KB for AI agents.',
      tags: ['AI Agents', 'LangChain', 'LangSmith', 'Prompt Injection for KB', 'RAG'],
      url: 'https://github.com/nawfil03'
    },
    {
      title: 'TwinTik B2B Platform',
      id: 'PROJECT 02',
      badge: 'APPLE & GOOGLE STORE APP',
      logo: '/logo/twintik-logo.jpg',
      desc: 'Led full-stack development and store deployment of TwinTik, a B2B platform, to the Apple App Store and Google Play Store with Node.js, NestJS, and PostgreSQL.',
      tags: ['App Store / Play Store', 'NestJS', 'Node.js', 'PostgreSQL', 'Full-Stack'],
      url: 'https://github.com/nawfil03'
    },
    {
      title: 'Aqademiq Investor & Analytics Dashboard',
      id: 'PROJECT 03',
      badge: 'STARTUP DATA LEAD',
      desc: 'Designed a dedicated investor dashboard consolidating growth, engagement, and performance metrics to support fundraising effort at Aqademiq startup.',
      tags: ['Data Analytics Lead', 'Power BI', 'Investor Dashboard', 'Growth Metrics'],
      url: 'https://github.com/nawfil03'
    },
    {
      title: 'Beena AI Chatbot',
      id: 'PROJECT 04',
      badge: 'LLM & VECTOR DB',
      desc: 'Built an AI-powered chatbot integrating Mistral LLM, Pinecone specialized vector memory, and n8n automation workflows.',
      tags: ['Mistral LLM', 'Pinecone Vector DB', 'n8n Workflows', 'Python'],
      url: 'https://github.com/nawfil03'
    },
    {
      title: 'Computer Vision Face Detection POC',
      id: 'PROJECT 05',
      badge: 'REAL-TIME SECURITY POC',
      desc: 'Built a functional Face Detection proof-of-concept using computer vision for real-time security and user identity verification.',
      tags: ['Computer Vision', 'Python', 'OpenCV', 'Security POC'],
      url: 'https://github.com/nawfil03'
    },
    {
      title: 'Automated QR Code Engine',
      id: 'PROJECT 06',
      badge: '-70% MANUAL EFFORT',
      desc: 'Developed a dynamic QR code generator engine that automated asset creation, reducing manual team effort by 70%.',
      tags: ['Automation', 'Node.js', 'Python', '70% Effort Reduction'],
      url: 'https://github.com/nawfil03'
    },
    {
      title: 'ADCB Web Brochure',
      id: 'PROJECT 07',
      badge: 'ABU DHABI COMMERCIAL BANK',
      logo: '/logo/adcb-logo.webp',
      desc: 'Deployed an interactive web-based digital brochure for ADCB, improving digital accessibility and user engagement.',
      tags: ['ADCB Client', 'Web Application', 'Accessibility', 'JavaScript'],
      url: 'https://github.com/nawfil03'
    },
    {
      title: 'Suntory Beverages Webpage',
      id: 'PROJECT 08',
      badge: 'RESPONSIVE WEB APP',
      logo: '/logo/suntory-logo.webp',
      desc: 'Delivered a responsive webpage for Suntory Beverages built using Tailwind CSS and JavaScript.',
      tags: ['Suntory', 'Tailwind CSS', 'JavaScript', 'Responsive UI'],
      url: 'https://github.com/nawfil03'
    },
    {
      title: 'Incha Digital Platform',
      id: 'PROJECT 09',
      badge: 'ENTERPRISE SOLUTIONS',
      logo: '/logo/incha-logo.png',
      desc: 'Engineered web solutions and digital platform interfaces for Incha enterprise applications.',
      tags: ['Incha Client', 'Web Development', 'Full-Stack', 'UI Architecture'],
      url: 'https://github.com/nawfil03'
    }
  ];

  container.innerHTML = '';

  resumeProjects.forEach(proj => {
    const card = document.createElement('a');
    card.className = 'project-card tilt-card spotlight-card reveal active';
    card.href = proj.url;
    card.target = '_blank';
    card.rel = 'noreferrer';

    const tagsHtml = proj.tags.map(t => `<span>${t}</span>`).join('');
    const iconHtml = proj.logo
      ? `<div class="project-logo-box"><img src="${proj.logo}" alt="${proj.title} logo" class="project-logo-img" /></div>`
      : `<div class="project-icon">NF</div>`;

    card.innerHTML = `
      <div class="project-top">
        <div>
          <div class="project-id">${proj.id} · ${proj.badge}</div>
          <h3 class="project-title">${proj.title}</h3>
        </div>
        ${iconHtml}
      </div>
      <p class="project-desc">${proj.desc}</p>
      <div class="tech-tags">${tagsHtml}</div>
    `;

    container.appendChild(card);
  });
}

// Resume Viewer Modal Controller
function initResumeModal() {
  const modal = document.getElementById('resume-modal');
  if (!modal) return;

  const openBtns = document.querySelectorAll('.open-resume-modal');
  const closeElements = modal.querySelectorAll('[data-close-modal]');
  const tabBtns = modal.querySelectorAll('.tab-btn');
  const tabContents = modal.querySelectorAll('.tab-content');
  const copyBtn = document.getElementById('copy-resume-text');
  const copyLabel = document.getElementById('copy-text-label');

  function openModal() {
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  openBtns.forEach(btn => {
    btn.addEventListener('click', openModal);
  });

  closeElements.forEach(el => {
    el.addEventListener('click', closeModal);
  });

  // ESC key to close modal
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

  // Tab switching between Document View and PDF Preview
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const targetContent = document.getElementById(`tab-${targetTab}`);
      if (targetContent) {
        targetContent.classList.add('active');
      }
    });
  });

  // Copy Summary text button
  if (copyBtn && copyLabel) {
    copyBtn.addEventListener('click', () => {
      const summaryText = `NAWFIL FARAAZ - Data Scientist & Software Developer (MSc Data Science GPA 8.6)\nDubai, UAE | +971 52 384 1353 | nawfilfaraaz786@gmail.com | https://nawfil.tech\n\nExperience: TechnoCIT Software Solutions (2 yrs 1 mo) - Software Developer (TwinTik B2B Store App, NestJS, Node.js, PostgreSQL) & AI Engineer Intern (AI Agent Prototypes, LangChain RAG, Prompt Injection for KB AI Agents, Face Detection POC).\nEducation: MSc Data Science (Middlesex Univ Dubai, GPA 8.6), BCA (New College Chennai, GPA 8.4).\nCertifications: Google Data Analytics, Cisco Data Science, Full-Stack Web, Power BI, Java.`;

      navigator.clipboard.writeText(summaryText).then(() => {
        const originalText = copyLabel.textContent;
        copyLabel.textContent = '✓ Copied!';
        setTimeout(() => {
          copyLabel.textContent = originalText;
        }, 2200);
      }).catch(err => {
        console.error('Clipboard copy failed:', err);
      });
    });
  }
}

renderResumeProjects();
initResumeModal();