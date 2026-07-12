// =========================================================
// INTERACTIVE SCRIPTING FOR FIRST HOLY COMMUNION INVITATION
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const waxSeal = document.getElementById('wax-seal');
  const coverOverlay = document.getElementById('cover-overlay');
  const mainContainer = document.getElementById('main-container');
  const lightFlash = document.getElementById('light-flash');
  const bgMusic = document.getElementById('bg-music');
  const musicToggle = document.getElementById('music-toggle');
  const skipBtn = document.getElementById('skip-btn');
  

  
  // Audio setup
  bgMusic.volume = 0.45;

  // =========================================================
  // MUSIC CONTROLLER (PLAY/PAUSE & BLOCKED PLAYBACK)
  // =========================================================
  
  function updateMusicUI(isPlaying) {
    if (isPlaying) {
      musicToggle.classList.remove('paused');
      musicToggle.classList.add('playing');
    } else {
      musicToggle.classList.add('paused');
      musicToggle.classList.remove('playing');
    }
  }

  function startMusic() {
    bgMusic.play()
      .then(() => {
        updateMusicUI(true);
      })
      .catch((err) => {
        console.warn('Playback blocked by browser autoplay rules. Waiting for user interaction.', err);
        updateMusicUI(false);
      });
  }

  // Handle start and loop timing limits (0:40 to 1:20 -> 40s to 80s)
  bgMusic.addEventListener('play', () => {
    if (bgMusic.currentTime < 40 || bgMusic.currentTime > 80) {
      bgMusic.currentTime = 40;
    }
  });

  bgMusic.addEventListener('timeupdate', () => {
    if (bgMusic.currentTime >= 80) {
      bgMusic.currentTime = 40;
    }
  });

  musicToggle.addEventListener('click', () => {
    if (bgMusic.paused) {
      bgMusic.play()
        .then(() => updateMusicUI(true))
        .catch(err => console.error("Error starting music:", err));
    } else {
      bgMusic.pause();
      updateMusicUI(false);
    }
  });

  // =========================================================
  // "MEDALLION UNLOCK" ZOOM OPENING ANIMATION SEQUENCE
  // =========================================================
  
  function executeOpeningSequence() {
    // 1. Start ambient music loop
    startMusic();

    // 2. Trigger Cover split panels slide animation
    coverOverlay.classList.add('open');

    // 3. Initiate scene flash & reveal scrollable content
    setTimeout(() => {
      // Activate screen flash
      lightFlash.classList.add('active');
      
      setTimeout(() => {
        // Fade out overlay screen
        coverOverlay.style.opacity = '0';
        lightFlash.classList.remove('active');
        
        setTimeout(() => {
          // Remove cover elements, show details
          coverOverlay.classList.add('hidden');
          mainContainer.classList.remove('hidden');
          musicToggle.classList.remove('hidden');
          
          // Trigger flow
          setTimeout(() => {
            mainContainer.classList.add('show');
            initScrollObserver();
          }, 60);
        }, 800);
      }, 300);
    }, 1200); // Wait for split panels to slide away
  }

  // Bind Open Triggers
  waxSeal.addEventListener('click', executeOpeningSequence);
  skipBtn.addEventListener('click', executeOpeningSequence);

  // =========================================================
  // SCROLL REVEAL (INTERSECTION OBSERVER)
  // =========================================================
  
  function initScrollObserver() {
    const reveals = document.querySelectorAll('.reveal');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, {
      root: mainContainer,
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px"
    });

    reveals.forEach(el => observer.observe(el));
  }

  // =========================================================
  // AMBIENT PARTICLES & GOLD DUST CANVAS ENGINE
  // =========================================================
  
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas.getContext('2d');
  
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;
  
  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  // Particle models
  const particles = [];
  const particleCount = 45;
  const mouse = { x: null, y: null, radius: 120 };

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
    }
  });

  window.addEventListener('touchend', () => {
    mouse.x = null;
    mouse.y = null;
  });

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height + height; // Spawn below screen
      this.size = Math.random() * 2.8 + 0.6;
      this.speedY = -(Math.random() * 0.8 + 0.3); // Drift upwards
      this.speedX = Math.random() * 0.4 - 0.2;
      this.opacity = Math.random() * 0.6 + 0.2;
      this.color = `rgba(195, 166, 98, ${this.opacity})`; // Gold Dust
      this.angle = Math.random() * 360;
      this.spinSpeed = Math.random() * 0.02 - 0.01;
    }

    update() {
      this.y += this.speedY;
      this.x += this.speedX;
      this.angle += this.spinSpeed;

      // Mouse interactive push
      if (mouse.x !== null && mouse.y !== null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const distance = Math.hypot(dx, dy);
        
        if (distance < mouse.radius) {
          const force = (mouse.radius - distance) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          this.x += Math.cos(angle) * force * 3;
          this.y += Math.sin(angle) * force * 3;
        }
      }

      // If particle drifts off top or sides, reset it at bottom
      if (this.y < -10 || this.x < -10 || this.x > width + 10) {
        this.reset();
        this.y = height + 10;
      }
    }

    draw() {
      ctx.save();
      ctx.beginPath();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.fillStyle = this.color;
      
      // Draw glowing dust starlet
      ctx.arc(0, 0, this.size, 0, Math.PI * 2);
      ctx.shadowBlur = 8;
      ctx.shadowColor = 'rgba(244, 235, 217, 0.9)';
      ctx.fill();
      ctx.restore();
    }
  }

  // Populate particles
  for (let i = 0; i < particleCount; i++) {
    const p = new Particle();
    p.y = Math.random() * height; // Spread across screen initially
    particles.push(p);
  }

  function animateCanvas() {
    ctx.clearRect(0, 0, width, height);
    
    // Draw very soft ambient beam layer
    const gradient = ctx.createRadialGradient(width * 0.5, 0, 100, width * 0.5, 0, height);
    gradient.addColorStop(0, 'rgba(251, 248, 243, 0.35)');
    gradient.addColorStop(1, 'rgba(250, 246, 238, 0.05)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    particles.forEach(p => {
      p.update();
      p.draw();
    });

    requestAnimationFrame(animateCanvas);
  }
  
  // Start canvas loop
  animateCanvas();

  // =========================================================
  // LIVE COUNTDOWN TIMER (MASS - SUNDAY, 10 MAY 2026 8:30 AM)
  // =========================================================
  
  const communionDate = new Date('2026-05-10T08:30:00').getTime();

  function updateCountdown() {
    const now = new Date().getTime();
    const timeRemaining = communionDate - now;

    if (timeRemaining <= 0) {
      document.getElementById('countdown-timer').innerHTML = 
        `<p class="communion-started script-font" style="font-size:22px; color:var(--color-gold-dark); grid-column: span 4;">The Holy Mass Celebrations Have Begun!</p>`;
      clearInterval(countdownTimer);
      return;
    }

    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

    document.getElementById('days').innerText = String(days).padStart(2, '0');
    document.getElementById('hours').innerText = String(hours).padStart(2, '0');
    document.getElementById('minutes').innerText = String(minutes).padStart(2, '0');
    document.getElementById('seconds').innerText = String(seconds).padStart(2, '0');
  }

  // Run countdown immediately and then on interval
  updateCountdown();
  const countdownTimer = setInterval(updateCountdown, 1000);

  // =========================================================
  // MULTI-LAYER PARALLAX SCROLLING (Illustrations parallax)
  // =========================================================
  const artLeft = document.querySelector('.art-left');
  const artRight = document.querySelector('.art-right');
  
  mainContainer.addEventListener('scroll', () => {
    const scrollTop = mainContainer.scrollTop;
    if (artLeft) {
      artLeft.style.transform = `translateY(${scrollTop * 0.15}px)`;
    }
    if (artRight) {
      artRight.style.transform = `translateY(calc(-50% + ${scrollTop * -0.1}px))`;
    }
  });
});

// =========================================================
// CALENDAR INTEGRATION
// =========================================================
window.addToCalendar = function(title, startISO, location) {
  const startDate = new Date(startISO);
  const endDate = new Date(startDate.getTime() + (2 * 60 * 60 * 1000)); // Default 2 hours event

  const formatGoogleDate = (date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const gStart = formatGoogleDate(startDate);
  const gEnd = formatGoogleDate(endDate);

  const isGoogle = confirm("Add this ceremony to your Google Calendar? (Click 'Cancel' to download an iCal/Outlook file instead.)");

  if (isGoogle) {
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${gStart}/${gEnd}&details=${encodeURIComponent("Christan Lawrence's First Holy Communion. Your presence and blessings will be our treasured gifts.")}&location=${encodeURIComponent(location)}`;
    window.open(calendarUrl, '_blank');
  } else {
    // Generate .ics download
    const formatICSDate = (date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const icsContent = 
`BEGIN:VCALENDAR
VERSION:2.0
CALSCALE:GREGORIAN
BEGIN:VEVENT
SUMMARY:${title}
DTSTART:${formatICSDate(startDate)}
DTEND:${formatICSDate(endDate)}
LOCATION:${location}
DESCRIPTION:First Holy Communion of Christan Lawrence. We look forward to seeing you!
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `${title.replace(/\s+/g, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
