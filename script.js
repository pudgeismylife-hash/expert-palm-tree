// ==========================================
// INTERACTIVE LOGIC FOR WEDDING INVITATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const waxSeal = document.getElementById('wax-seal');
  const envelope = document.getElementById('envelope');
  const envelopeOverlay = document.getElementById('envelope-overlay');
  const mainContainer = document.getElementById('main-container');
  const bgMusic = document.getElementById('bg-music');
  const musicToggle = document.getElementById('music-toggle');
  
  // RSVP Elements
  const rsvpForm = document.getElementById('rsvp-form');
  const rsvpModal = document.getElementById('rsvp-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const modalResponseMsg = document.getElementById('modal-response-msg');
  const guestsNumberGroup = document.getElementById('guests-number-group');
  
  // Set volume for ambient play
  bgMusic.volume = 0.5;

  // ==========================================
  // MUSIC CONTROLLER (PLAY/PAUSE & BLOCKED PLAYBACK HANDLER)
  // ==========================================
  
  function updateMusicUI(isPlaying) {
    const playIcon = musicToggle.querySelector('.music-icon.playing');
    const muteIcon = musicToggle.querySelector('.music-icon.muted');
    
    if (isPlaying) {
      musicToggle.classList.remove('paused');
      playIcon.classList.remove('hidden');
      muteIcon.classList.add('hidden');
    } else {
      musicToggle.classList.add('paused');
      playIcon.classList.add('hidden');
      muteIcon.classList.remove('hidden');
    }
  }

  function startMusic() {
    bgMusic.play()
      .then(() => {
        updateMusicUI(true);
      })
      .catch((err) => {
        console.warn('Audio play blocked by browser policy. User will need to manually click the music controller.', err);
        updateMusicUI(false);
      });
  }

  musicToggle.addEventListener('click', () => {
    if (bgMusic.paused) {
      bgMusic.play()
        .then(() => updateMusicUI(true))
        .catch(err => console.error("Error playing music:", err));
    } else {
      bgMusic.pause();
      updateMusicUI(false);
    }
  });

  // ==========================================
  // ENVELOPE OPENING ANIMATION SEQUENCE
  // ==========================================
  waxSeal.addEventListener('click', () => {
    // 1. Trigger audio play
    startMusic();

    // 2. Add class to animate flap opening & card sliding up
    envelope.classList.add('open');

    // 3. Fade out overlay and reveal the scrollable container
    setTimeout(() => {
      envelopeOverlay.style.opacity = '0';
      
      setTimeout(() => {
        envelopeOverlay.classList.add('hidden');
        mainContainer.classList.remove('hidden');
        musicToggle.classList.remove('hidden');
        
        // Trigger reflow & show container
        setTimeout(() => {
          mainContainer.classList.add('show');
          // Trigger scroll reveal observer for the first screen
          triggerScrollObserver();
        }, 50);
      }, 1000);
    }, 1200);
  });

  // ==========================================
  // SCROLL REVEAL ANIMATIONS (INTERSECTION OBSERVER)
  // ==========================================
  function triggerScrollObserver() {
    const reveals = document.querySelectorAll('.reveal');
    
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, {
      threshold: 0.12, // triggers when 12% of the element is visible in viewport
      rootMargin: "0px 0px -40px 0px" // triggers slightly before entering
    });

    reveals.forEach((reveal) => {
      revealObserver.observe(reveal);
    });
  }

  // ==========================================
  // LIVE COUNTDOWN TIMER (NIKAH - AUG 14, 2026)
  // ==========================================
  const weddingDate = new Date('2026-08-14T16:30:00').getTime();

  function updateCountdown() {
    const now = new Date().getTime();
    const timeRemaining = weddingDate - now;

    if (timeRemaining <= 0) {
      document.getElementById('countdown').innerHTML = `<p class="wedding-started script-font" style="font-size:24px; color:#A67C1E; grid-column: span 4;">The Wedding Celebrations Have Begun!</p>`;
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

  // Initialize and tick countdown
  updateCountdown();
  const countdownTimer = setInterval(updateCountdown, 1000);

  // ==========================================
  // RSVP INTERACTIVE FORM LOGIC
  // ==========================================
  
  // Hide guest count dropdown if user declines invitation
  const attendanceRadios = document.getElementsByName('attendance');
  attendanceRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.value === 'declined') {
        guestsNumberGroup.style.display = 'none';
      } else {
        guestsNumberGroup.style.display = 'block';
      }
    });
  });

  rsvpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('guest-name').value;
    const attendance = rsvpForm.elements['attendance'].value;
    const guests = document.getElementById('guests-count').value;
    const message = document.getElementById('guest-message').value;

    const rsvpResponse = {
      name,
      attendance,
      guests: attendance === 'attending' ? guests : 0,
      message,
      timestamp: new Date().toISOString()
    };

    // Save replies in local storage
    let allRSVPs = JSON.parse(localStorage.getItem('wedding_rsvps')) || [];
    allRSVPs.push(rsvpResponse);
    localStorage.setItem('wedding_rsvps', JSON.stringify(allRSVPs));

    // Custom success message
    if (attendance === 'attending') {
      modalResponseMsg.innerText = `Thank you, ${name}! We are absolutely thrilled that you will join us for our special celebrations! Your RSVP for ${rsvpResponse.guests} guest(s) is confirmed.`;
    } else {
      modalResponseMsg.innerText = `Thank you, ${name}. We are sorry you won't be able to make it, but we deeply appreciate your warm blessings and wishes!`;
    }

    // Open success modal
    rsvpModal.classList.remove('hidden');
  });

  // Modal Close Action
  closeModalBtn.addEventListener('click', () => {
    rsvpModal.classList.add('hidden');
    rsvpForm.reset();
    guestsNumberGroup.style.display = 'block'; // reset dropdown display
  });
});

// ==========================================
// CALENDAR INTEGRATION (iCal & Google Calendar)
// ==========================================
window.addToCalendar = function(title, startISO, location) {
  const startDate = new Date(startISO);
  const endDate = new Date(startDate.getTime() + (3 * 60 * 60 * 1000)); // Default 3 hours

  const formatGoogleDate = (date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const gStart = formatGoogleDate(startDate);
  const gEnd = formatGoogleDate(endDate);
  
  const isGoogle = confirm("Would you like to add this to Google Calendar? (Click 'Cancel' to download an iCal/Outlook file instead.)");

  if (isGoogle) {
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${gStart}/${gEnd}&details=${encodeURIComponent('Wedding Celebrations of Arshiya & Afham')}&location=${encodeURIComponent(location)}`;
    window.open(googleCalendarUrl, '_blank');
  } else {
    // ICS download
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
DESCRIPTION:Wedding Celebrations of Arshiya & Afham. We look forward to seeing you!
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
