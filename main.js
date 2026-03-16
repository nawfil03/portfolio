// 1. Initial boot sequence / Loading removal
window.addEventListener('load', () => {
  setTimeout(() => {
    document.body.classList.remove('loading');
    // Trigger scroll check on load
    handleReveal();
  }, 300);
});

// 2. Mobile Menu Toggle
const menuToggleBtn = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const navItems = document.querySelectorAll('.mobile-menu .nav-item, .mobile-menu .btn-primary');

if (menuToggleBtn && mobileMenu) {
  menuToggleBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('active');
  });

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      mobileMenu.classList.remove('active');
    });
  });
}

// 3. Reveal Animations on Scroll
function handleReveal() {
  const reveals = document.querySelectorAll('.reveal');
  const windowHeight = window.innerHeight;
  const revealPoint = 150;

  reveals.forEach(reveal => {
    const revealTop = reveal.getBoundingClientRect().top;
    if (revealTop < windowHeight - revealPoint) {
      reveal.classList.add('active');
    }
  });
}

window.addEventListener('scroll', handleReveal);

// 4. Parallax Hero Effect
const heroImage = document.querySelector('.hero-image-wrapper');
if (heroImage) {
  window.addEventListener('mousemove', (e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    
    const moveX = (clientX - innerWidth / 2) / 40;
    const moveY = (clientY - innerHeight / 2) / 40;
    
    heroImage.style.transform = `translate(${moveX}px, ${moveY}px)`;
  });
}

// 5. Fetch GitHub Projects
async function fetchGitHubProjects() {
  const projectsContainer = document.getElementById('projects');
  if (!projectsContainer) return;

  const professionalMapping = {
    'daim-perfumes.nawfil03.github.io': {
      name: 'Daim Luxury E-commerce',
      description: 'A high-end fragrance retail platform featuring responsive product displays and seamless user journeys.'
    },
    'Personal-Trainer-Dashboard': {
      name: 'OmniFit Pro Dashboard',
      description: 'Full-stack wellness management system integrating client progress tracking and automated health metrics.'
    },
    'Portfolio-Old': {
      name: 'Legacy Tech Portfolio',
      description: 'Early-stage development iteration focusing on core web technologies and responsive design principles.'
    }
    // Add more mappings as needed
  };

  const unprofessionalPhrases = [
    { regex: /sandeep sir bit for twintik/i, replacement: 'Strategic Social Media Automation Engine' },
    { regex: /aqademiq/i, replacement: 'Academic' }
  ];

  const fallbackRepos = [
    {
      name: "Enterprise Data Pipeline",
      description: "Scalable ETL pipeline processing millions of records using Python and AWS ecosystem.",
      language: "Python",
      html_url: "https://github.com/nawfil03"
    },
    {
      name: "AI Autonomous Agent Platform",
      description: "Langchain-powered intelligent bot system integrated with complex routing APIs.",
      language: "TypeScript",
      html_url: "https://github.com/nawfil03"
    },
    {
      name: "Corporate CRM Dashboard",
      description: "High-performance React frontend and Node.js backend tailored for massive B2B workflows.",
      language: "JavaScript",
      html_url: "https://github.com/nawfil03"
    }
  ];

  let reposToDisplay = [];

  try {
    const response = await fetch('https://api.github.com/users/nawfil03/repos?sort=updated&per_page=6');
    if (!response.ok) {
      throw new Error(`API rate limit exceeded or network error (${response.status})`);
    }
    reposToDisplay = await response.json();

    if (reposToDisplay.length === 0) {
      reposToDisplay = fallbackRepos;
    }
  } catch (error) {
    console.warn('Falling back to default projects due to GitHub API limit:', error.message);
    reposToDisplay = fallbackRepos;
  }

  projectsContainer.innerHTML = '';

  reposToDisplay.slice(0, 6).forEach((repo, index) => {
    const prjId = `PROJ-${String(index + 1).padStart(2, '0')}`;
    
    // Apply professional mapping
    let name = repo.name;
    let desc = repo.description || 'Enterprise-grade software architecture and development.';

    if (professionalMapping[repo.name]) {
      name = professionalMapping[repo.name].name;
      desc = professionalMapping[repo.name].description;
    }

    // Clean unprofessional phrases
    unprofessionalPhrases.forEach(item => {
      name = name.replace(item.regex, item.replacement);
      desc = desc.replace(item.regex, item.replacement);
    });

    let tagsHtml = '';
    if (repo.language) {
      tagsHtml += `<span>${repo.language}</span>`;
    }
    tagsHtml += `<span>Source Code</span>`;

    const card = document.createElement('a');
    card.href = repo.html_url || "https://github.com/nawfil03";
    card.target = '_blank';
    card.className = 'project-card';

    card.innerHTML = `
      <div class="project-top">
        <div class="flex-between">
          <span class="project-id">${prjId}</span>
          <div class="project-icon">NF</div>
        </div>
        <h3 class="project-title">${name}</h3>
      </div>
      <p class="project-desc">${desc}</p>
      <div class="tech-tags">
        ${tagsHtml}
      </div>
    `;

    projectsContainer.appendChild(card);
  });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  fetchGitHubProjects();
  initCVModal();
});

/* ─── CV Modal Logic ─────────────────────────────────── */
function initCVModal() {
  const modal = document.getElementById('cv-modal');
  const closeBtn = document.getElementById('close-cv');
  const triggers = document.querySelectorAll('.view-cv-trigger');

  const openModal = (e) => {
    e.preventDefault();
    modal.classList.add('active');
    document.body.classList.add('modal-open');
  };

  const closeModal = () => {
    modal.classList.remove('active');
    document.body.classList.remove('modal-open');
  };

  triggers.forEach(trigger => {
    trigger.addEventListener('click', openModal);
  });

  closeBtn.addEventListener('click', closeModal);

  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
}
