// Year in footer
document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});

// Mobile menu toggle
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const mobileNav = document.querySelector('.mobile-nav');

if (mobileMenuToggle && mobileNav) {
  mobileMenuToggle.addEventListener('click', () => {
    mobileMenuToggle.classList.toggle('active');
    mobileNav.classList.toggle('active');
    
    // Update aria-expanded
    const isExpanded = mobileNav.classList.contains('active');
    mobileMenuToggle.setAttribute('aria-expanded', isExpanded);
  });

  // Close mobile menu when clicking on links
  mobileNav.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      mobileMenuToggle.classList.remove('active');
      mobileNav.classList.remove('active');
      mobileMenuToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

// Intersection Observer reveal
const observer = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
},{threshold:0.12});

document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));

// Parallax on hero ship
const heroShip = document.querySelector('.hero__ship img');
if (heroShip){
  window.addEventListener('scroll', ()=>{
    const y = window.scrollY * 0.15;
    heroShip.style.transform = `translateY(${y}px)`;
  });
}

// Starfield Canvas
(function initStarfield(){
  const canvas = document.getElementById('starfield');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, stars;

  function resize(){
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    stars = generateStars();
  }

  function generateStars(){
    const count = Math.floor((w * h) / 3500); // density
    const arr = new Array(count).fill(0).map(()=>({
      x: Math.random()*w,
      y: Math.random()*h,
      z: Math.random()*1 + 0.2,
      r: Math.random()*1.2 + 0.2,
      tw: Math.random()*2*Math.PI,
      tws: 0.002 + Math.random()*0.008
    }));
    return arr;
  }

  function step(){
    ctx.clearRect(0,0,w,h);
    // slight gradient glow
    const g = ctx.createRadialGradient(w*0.8, h*0.1, 0, w*0.8, h*0.1, Math.max(w,h)*0.9);
    g.addColorStop(0,'rgba(71,176,255,0.06)');
    g.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0,0,w,h);

    // stars
    stars.forEach(s=>{
      s.tw += s.tws;
      const alpha = 0.6 + Math.sin(s.tw)*0.3;
      ctx.beginPath();
      ctx.fillStyle = `rgba(214,236,255,${alpha})`;
      ctx.arc(s.x, s.y, s.r * s.z, 0, Math.PI*2);
      ctx.fill();
    });
    requestAnimationFrame(step);
  }

  window.addEventListener('resize', resize);
  resize();
  step();
})();

// =====================
// Barrel Invaders (Arcade)
// =====================
(function barrelInvaders(){
  const canvas = document.getElementById('arcade-canvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');

  const scoreEl = document.getElementById('score');
  const livesEl = document.getElementById('lives');
  const statusEl = document.getElementById('status');
  const startBtn = document.getElementById('startBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const resetBtn = document.getElementById('resetBtn');

  // Game state
  let running = false;
  let paused = false;
  let last = 0;
  let score = 0;
  let lives = 3;
  let level = 1;

  const world = {
    width: canvas.width,
    height: canvas.height
  };

  const keys = {left:false, right:false, space:false};
  
  // Keyboard controls
  window.addEventListener('keydown', (e)=>{
    if(['ArrowLeft','a','A'].includes(e.key)) keys.left = true;
    if(['ArrowRight','d','D'].includes(e.key)) keys.right = true;
    if(e.code === 'Space') { keys.space = true; e.preventDefault(); }
  });
  window.addEventListener('keyup', (e)=>{
    if(['ArrowLeft','a','A'].includes(e.key)) keys.left = false;
    if(['ArrowRight','d','D'].includes(e.key)) keys.right = false;
    if(e.code === 'Space') keys.space = false;
  });

  // Touch controls for mobile
  let touchStartX = null;
  let touchCurrentX = null;
  let isTouching = false;

  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchCurrentX = touch.clientX;
    isTouching = true;
    
    // Shoot on touch start
    keys.space = true;
    setTimeout(() => keys.space = false, 100);
  });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (!isTouching) return;
    
    const touch = e.touches[0];
    touchCurrentX = touch.clientX;
    
    // Calculate movement direction
    const deltaX = touchCurrentX - touchStartX;
    const sensitivity = 20;
    
    if (deltaX > sensitivity) {
      keys.right = true;
      keys.left = false;
    } else if (deltaX < -sensitivity) {
      keys.left = true;
      keys.right = false;
    } else {
      keys.left = false;
      keys.right = false;
    }
  });

  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    isTouching = false;
    touchStartX = null;
    touchCurrentX = null;
    keys.left = false;
    keys.right = false;
  });

  // Prevent scrolling on touch
  canvas.addEventListener('touchcancel', (e) => {
    e.preventDefault();
    isTouching = false;
    keys.left = false;
    keys.right = false;
  });

  // Entities
  const player = {x: world.width/2, y: world.height-40, w: 40, h: 14, speed: 260, cooldown: 0};
  const bullets = [];
  const invaders = [];
  const enemyBullets = [];

  function spawnWave(){
    invaders.length = 0;
    const rows = 4 + Math.min(3, level);
    const cols = 8;
    for(let r=0;r<rows;r++){
      for(let c=0;c<cols;c++){
        invaders.push({x: 60 + c*46, y: 80 + r*36, w:28, h:18, vx: 40, alive:true});
      }
    }
  }

  function reset(){
    score = 0; lives = 3; level = 1; player.x = world.width/2; bullets.length=0; enemyBullets.length=0; spawnWave();
    updateHUD(); statusEl.textContent = 'Ready';
  }

  function updateHUD(){
    scoreEl.textContent = score;
    livesEl.textContent = lives;
  }

  function shoot(){
    if(player.cooldown<=0){
      bullets.push({x: player.x, y: player.y-10, r:3, vy:-380});
      player.cooldown = 240; // ms
    }
  }

  function enemyShoot(from){
    enemyBullets.push({x: from.x, y: from.y+6, r:3, vy: 200});
  }

  // Collision helpers
  function rectsOverlap(a,b){
    return !(a.x+a.w/2 < b.x-b.w/2 || a.x-a.w/2 > b.x+b.w/2 || a.y+a.h/2 < b.y-b.h/2 || a.y-a.h/2 > b.y+b.h/2);
  }

  function update(dt){
    // Player
    if(keys.left) player.x -= player.speed * dt;
    if(keys.right) player.x += player.speed * dt;
    player.x = Math.max(player.w/2, Math.min(world.width - player.w/2, player.x));
    player.cooldown -= dt*1000;
    if(keys.space) shoot();

    // Bullets
    bullets.forEach(b=> b.y += b.vy * dt);
    enemyBullets.forEach(b=> b.y += b.vy * dt);
    // Cleanup
    for(let i=bullets.length-1;i>=0;i--) if(bullets[i].y < -10) bullets.splice(i,1);
    for(let i=enemyBullets.length-1;i>=0;i--) if(enemyBullets[i].y > world.height+10) enemyBullets.splice(i,1);

    // Invaders movement
    let switchDir = false;
    invaders.forEach(inv=>{
      inv.x += inv.vx * dt;
      if(inv.x > world.width-30 || inv.x < 30) switchDir = true;
      // Random enemy fire
      if(Math.random() < 0.002 * level) enemyShoot(inv);
    });
    if(switchDir){
      invaders.forEach(inv=>{ inv.vx *= -1; inv.y += 16; });
    }

    // Collisions: bullets vs invaders
    for(let i=bullets.length-1;i>=0;i--){
      const b = bullets[i];
      for(let j=invaders.length-1;j>=0;j--){
        const inv = invaders[j];
        if(!inv.alive) continue;
        if(Math.abs(b.x - inv.x) < inv.w/2 && Math.abs(b.y - inv.y) < inv.h/2){
          bullets.splice(i,1);
          invaders.splice(j,1);
          score += 10;
          updateHUD();
          break;
        }
      }
    }

    // Collisions: enemy bullets vs player
    for(let i=enemyBullets.length-1;i>=0;i--){
      const b = enemyBullets[i];
      if(Math.abs(b.x - player.x) < player.w/2 && Math.abs(b.y - player.y) < player.h/2){
        enemyBullets.splice(i,1);
        lives -= 1; updateHUD();
        statusEl.textContent = lives>0 ? 'Hit!' : 'Game Over';
        if(lives<=0){ pause(); running=false; }
      }
    }

    // Next level
    if(invaders.length === 0){
      level += 1; spawnWave(); statusEl.textContent = `Level ${level}`;
    }
  }

  function draw(){
    // Clear
    ctx.clearRect(0,0,world.width, world.height);

    // Background faint stars
    ctx.fillStyle = '#0b0f1f';
    ctx.fillRect(0,0,world.width, world.height);
    ctx.fillStyle = 'rgba(214,236,255,0.6)';
    for(let i=0;i<60;i++){
      const x = (i*73)%world.width; const y = (i*137)%world.height; const r = (i%3)*0.6+0.2;
      ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
    }

    // Player ship (OB green)
    ctx.fillStyle = '#3dd6a2';
    roundRect(ctx, player.x-player.w/2, player.y-player.h/2, player.w, player.h, 6, true);
    // Cannon
    ctx.fillStyle = '#ffd166'; ctx.fillRect(player.x-3, player.y-14, 6, 8);

    // Invaders
    ctx.fillStyle = '#47b0ff';
    invaders.forEach(inv=>{ roundRect(ctx, inv.x-inv.w/2, inv.y-inv.h/2, inv.w, inv.h, 4, true); });

    // Bullets
    ctx.fillStyle = '#ffd166';
    bullets.forEach(b=>{ ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2); ctx.fill(); });
    ctx.fillStyle = '#ff6b6b';
    enemyBullets.forEach(b=>{ ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2); ctx.fill(); });
  }

  function roundRect(ctx, x, y, w, h, r, fill){
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.arcTo(x+w, y, x+w, y+h, r);
    ctx.arcTo(x+w, y+h, x, y+h, r);
    ctx.arcTo(x, y+h, x, y, r);
    ctx.arcTo(x, y, x+w, y, r);
    if(fill) ctx.fill(); else ctx.stroke();
  }

  function loop(ts){
    if(!running || paused) return; 
    const dt = Math.min(0.033, (ts - last)/1000);
    last = ts;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  function start(){
    if(!running){ running = true; paused = false; statusEl.textContent=''; last = performance.now(); requestAnimationFrame(loop); }
  }
  function pause(){ paused = true; statusEl.textContent = 'Paused'; }
  function resume(){ if(running && paused){ paused=false; last = performance.now(); requestAnimationFrame(loop);} }

  // Buttons
  startBtn.addEventListener('click', ()=>{ if(!running){ reset(); start(); } else resume(); });
  pauseBtn.addEventListener('click', ()=> paused? resume() : pause());
  resetBtn.addEventListener('click', ()=>{ running=false; paused=false; reset(); draw(); });

  // Initialize
  reset();
  draw();
})();

// =====================
// Mailing List Form Handler
// =====================
(function mailingListHandler(){
  const form = document.getElementById('mailinglist');
  const messageDiv = document.getElementById('form-message');
  
  if (!form || !messageDiv) return;
  
  function showMessage(message, isSuccess) {
    messageDiv.textContent = message;
    messageDiv.style.display = 'block';
    messageDiv.style.backgroundColor = isSuccess ? '#d4edda' : '#f8d7da';
    messageDiv.style.color = isSuccess ? '#155724' : '#721c24';
    messageDiv.style.border = isSuccess ? '1px solid #c3e6cb' : '1px solid #f5c6cb';
    
    // Scroll message into view
    messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Hide message after 5 seconds if successful
    if (isSuccess) {
      setTimeout(() => {
        messageDiv.style.display = 'none';
      }, 5000);
    }
  }
  
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    
    // Show loading state
    submitButton.textContent = 'Joining...';
    submitButton.disabled = true;
    
    try {
      const formData = new FormData(form);
      
      const response = await fetch('save_email.php', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        showMessage(result.message, true);
        form.reset(); // Clear the form
      } else {
        showMessage(result.message, false);
      }
      
    } catch (error) {
      console.error('Error submitting form:', error);
      showMessage('Sorry, there was an error submitting your information. Please try again later.', false);
    } finally {
      // Restore button state
      submitButton.textContent = originalText;
      submitButton.disabled = false;
    }
  });
})();

// Dynamic Spacebook Feed System
(function() {
  // Pool of posts for each character
  const characterPosts = {
    mary: [
      {
        content: "Just finished restocking the bar for tonight! Got some new Rigellian whiskey that's absolutely stellar. Come try it before Carl drinks it all! 🍺✨ #OrionsBarrel #NewStock",
        baseTime: "2h ago",
        baseLikes: 42,
        baseComments: 8,
        baseShares: 12
      },
      {
        content: "Thank you to everyone who came to last night's trivia! The competition was fierce, and congratulations to Team Asteroid Belt for taking home the prize! 🏆✨ #TriviaNight #Community",
        baseTime: "5h ago", 
        baseLikes: 67,
        baseComments: 15,
        baseShares: 8
      },
      {
        content: "New meditation garden opened on Deck 3! Sometimes we all need a quiet place to decompress from the vastness of space. Come find your center. 🧘‍♀️🌌 #Wellness #Peace",
        baseTime: "8h ago",
        baseLikes: 54,
        baseComments: 12,
        baseShares: 18
      },
      {
        content: "Friendly reminder: our happy hour starts at 1800 station time! Half price on all stellar cocktails and nebula wines. See you there! 🍸⭐ #HappyHour #Deals",
        baseTime: "12h ago",
        baseLikes: 89,
        baseComments: 22,
        baseShares: 31
      }
    ],
    carl: [
      {
        content: "Found the most beautiful crystal formation in the asteroid belt today! Reminded me of those Earth dog photos I've been saving credits to see in person. One day... 🐕💎 #Mining #Dreams",
        baseTime: "4h ago",
        baseLikes: 67,
        baseComments: 15,
        baseShares: 23
      },
      {
        content: "Double shift today but found three rare isotopes! The foreman says I might get a bonus. Every credit gets me closer to Earth and those adorable dogs! 🚀🐕 #MiningLife #Dreams",
        baseTime: "7h ago",
        baseLikes: 45,
        baseComments: 9,
        baseShares: 12
      },
      {
        content: "Watched a documentary about Golden Retrievers during my break. Did you know they were originally bred for hunting? I can't wait to learn everything about them! 📺🐕 #DogFacts #Learning",
        baseTime: "11h ago",
        baseLikes: 38,
        baseComments: 7,
        baseShares: 5
      },
      {
        content: "The new mining equipment arrived today! It's so shiny and efficient. Walter helped me calibrate it - that guy knows everything about machinery! 🛠️✨ #NewTech #Grateful",
        baseTime: "15h ago",
        baseLikes: 52,
        baseComments: 11,
        baseShares: 8
      }
    ],
    dick: [
      {
        content: "WAKE UP SHEEPLE! The new 'asteroid mining permits' are just a cover for corporate surveillance drones! They're tracking every move we make out here! #TruthBomb #WakeUp #StayWoke",
        baseTime: "6h ago",
        baseLikes: 3,
        baseComments: 1,
        baseShares: 0
      },
      {
        content: "Notice how the 'maintenance' on the communication arrays happens right before major trade negotiations? COINCIDENCE? I THINK NOT! #CorporateConspiracy #WakeUp",
        baseTime: "9h ago",
        baseLikes: 2,
        baseComments: 0,
        baseShares: 1
      },
      {
        content: "The station's 'random' power fluctuations always happen when I'm about to post important information. THEY'RE TRYING TO SILENCE ME! #Censorship #Truth #StayVigilant",
        baseTime: "13h ago",
        baseLikes: 5,
        baseComments: 2,
        baseShares: 0
      },
      {
        content: "Why does the bar's 'special' whiskey only arrive on ships with no manifest records? Connect the dots, people! It's all part of their plan! #Smuggling #Conspiracy #OpenYourEyes",
        baseTime: "18h ago",
        baseLikes: 1,
        baseComments: 3,
        baseShares: 0
      }
    ],
    walter: [
      {
        content: "Watched three shooting stars pass by the observation deck tonight. In my 40 years out here, the universe still finds ways to surprise an old spacer. Sometimes the best conversation is just silence and stars.",
        baseTime: "1d ago",
        baseLikes: 89,
        baseComments: 24,
        baseShares: 31
      },
      {
        content: "Young Carl asked me about the old mining techniques today. It warms my heart to share what these hands have learned. Knowledge is only valuable when it's passed on to the next generation.",
        baseTime: "1d ago",
        baseLikes: 76,
        baseComments: 18,
        baseShares: 25
      },
      {
        content: "Forty years ago, this station was just a skeleton of metal floating in the void. Now it's home to hundreds of souls. Progress isn't always about technology - sometimes it's about community.",
        baseTime: "2d ago",
        baseLikes: 112,
        baseComments: 31,
        baseShares: 47
      },
      {
        content: "The new recruits think space is empty. They'll learn, as I did, that it's full of lessons for those patient enough to listen. The void teaches humility better than any teacher.",
        baseTime: "2d ago",
        baseLikes: 95,
        baseComments: 22,
        baseShares: 38
      }
    ],
    scally: [
      {
        content: "Got some 'special imports' arriving on the next freight run. You know where to find me if you need anything... interesting. DM for details. 😉 #SpecialDelivery #AskNoQuestions",
        baseTime: "2d ago",
        baseLikes: 18,
        baseComments: 7,
        baseShares: 4
      },
      {
        content: "Business has been good lately. Very good. Sometimes the best deals happen when people aren't asking too many questions. Supply and demand, friends! 💰 #Business #Opportunities",
        baseTime: "3d ago",
        baseLikes: 23,
        baseComments: 5,
        baseShares: 2
      },
      {
        content: "New security protocols at the docks. Interesting. Very interesting. Might affect some... delivery schedules. Adjustments will be made. 📦🔍 #Logistics #Adaptation",
        baseTime: "4d ago",
        baseLikes: 15,
        baseComments: 3,
        baseShares: 1
      },
      {
        content: "Had coffee with a ship captain today. Nice conversation about trade routes and... cargo capacity. Always networking, always opportunities! ☕🚀 #Networking #Trade",
        baseTime: "5d ago",
        baseLikes: 27,
        baseComments: 8,
        baseShares: 6
      }
    ],
    toni: [
      {
        content: "Amazing dinner at the new Andromedan restaurant on Deck 7 last night. The company was even better than the nebula wine 😍 Life's too short for boring conversations and bad drinks. #LivingMyBestLife #Romance",
        baseTime: "3d ago",
        baseLikes: 127,
        baseComments: 34,
        baseShares: 19
      },
      {
        content: "Just got back from the most incredible holodeck date. Virtual Earth beaches, real chemistry. Sometimes the best adventures happen in the most unexpected places! 🏖️💫 #Romance #Adventure",
        baseTime: "4d ago",
        baseLikes: 98,
        baseComments: 28,
        baseShares: 15
      },
      {
        content: "Pro tip: confidence is attractive in any species, but kindness is universal. Treat everyone with respect and watch how it comes back to you tenfold. ✨💖 #LifeAdvice #Charm",
        baseTime: "5d ago",
        baseLikes: 156,
        baseComments: 42,
        baseShares: 67
      },
      {
        content: "New cologne from the Centauri markets. Subtle, sophisticated, with hints of stardust. Already getting compliments! Sometimes it's the little details that make all the difference. 🌟 #Style #Confidence",
        baseTime: "6d ago",
        baseLikes: 87,
        baseComments: 21,
        baseShares: 12
      }
    ]
  };

  // Generate dynamic feed based on current time
  function generateDynamicFeed() {
    const now = new Date();
    const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    const hourOfDay = now.getHours();
    
    // Create deterministic but seemingly random feed
    const seed = dayOfYear * 24 + hourOfDay;
    
    // Select posts for each character based on time
    const selectedPosts = [];
    const characters = Object.keys(characterPosts);
    
    characters.forEach(character => {
      const posts = characterPosts[character];
      const postIndex = (seed + characters.indexOf(character)) % posts.length;
      const post = { ...posts[postIndex] };
      
      // Add dynamic variance to reaction counts
      const timeVariance = Math.sin(seed + character.charCodeAt(0)) * 0.3;
      post.likes = Math.max(1, Math.floor(post.baseLikes * (1 + timeVariance)));
      post.comments = Math.max(0, Math.floor(post.baseComments * (1 + timeVariance * 0.5)));
      post.shares = Math.max(0, Math.floor(post.baseShares * (1 + timeVariance * 0.4)));
      
      post.character = character;
      selectedPosts.push(post);
    });
    
    // Sort posts by engagement (likes + comments + shares) with some randomness
    selectedPosts.sort((a, b) => {
      const engagementA = a.likes + a.comments + a.shares;
      const engagementB = b.likes + b.comments + b.shares;
      const randomFactor = Math.sin(seed + engagementA + engagementB) * 10;
      return (engagementB + randomFactor) - (engagementA + randomFactor);
    });
    
    return selectedPosts;
  }

  // Update the feed display
  function updateFeedDisplay() {
    const feedContainer = document.querySelector('.social-feed');
    if (!feedContainer) {
      console.log('Feed container not found, skipping update');
      return;
    }
    
    try {
      const posts = generateDynamicFeed();
      console.log('Updating feed with posts:', posts.length, 'posts'); // Debug
      
      // Update each post's content and stats
      const postElements = feedContainer.querySelectorAll('.social-post');
      console.log('Found', postElements.length, 'post elements'); // Debug
      
      postElements.forEach((element, index) => {
        if (index >= posts.length) return;
        
        const post = posts[index];
        const character = post.character;
        
        try {
          // Update content
          const contentElement = element.querySelector('.social-post__content p');
          if (contentElement) {
            contentElement.textContent = post.content;
          }
          
          // Update time
          const timeElement = element.querySelector('.social-post__time');
          if (timeElement) {
            timeElement.textContent = post.baseTime;
          }
          
          // Update action counts with better error handling
          const actions = element.querySelectorAll('.social-action');
          if (actions.length >= 3) {
            // Update likes
            if (actions[0] && actions[0].textContent.includes('💫')) {
              actions[0].textContent = `💫 ${post.likes}`;
            }
            // Update comments
            if (actions[1] && actions[1].textContent.includes('💬')) {
              const currentText = actions[1].textContent;
              const hideText = currentText.includes('Hide') ? ' (Hide)' : '';
              actions[1].textContent = `💬 ${post.comments}${hideText}`;
            }
            // Update shares
            if (actions[2] && actions[2].textContent.includes('🔄')) {
              actions[2].textContent = `🔄 ${post.shares}`;
            }
          }
        } catch (error) {
          console.error('Error updating post element', index, ':', error);
        }
      });
      
      console.log('Feed update completed successfully');
    } catch (error) {
      console.error('Error in updateFeedDisplay:', error);
    }
  }

  // Initialize dynamic feed only if we're on a page with Spacebook
  function initializeDynamicFeed() {
    // Check if we're on the Spacebook section or if it exists
    const feedContainer = document.querySelector('.social-feed');
    if (!feedContainer) {
      console.log('No social feed found, skipping dynamic feed initialization');
      return;
    }
    
    try {
      updateFeedDisplay();
      console.log('Dynamic feed initialized successfully');
      
      // Update feed every hour
      setInterval(function() {
        try {
          updateFeedDisplay();
        } catch (error) {
          console.error('Error updating feed:', error);
        }
      }, 60 * 60 * 1000);
      
      // Also update when page becomes visible (user returns to tab)
      document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
          try {
            updateFeedDisplay();
          } catch (error) {
            console.error('Error updating feed on visibility change:', error);
          }
        }
      });
    } catch (error) {
      console.error('Error initializing dynamic feed:', error);
    }
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDynamicFeed);
  } else {
    // DOM is already ready
    initializeDynamicFeed();
  }

// Spacebook Comments System
(function() {
  // Character personality-based auto-replies
  const characterReplies = {
    mary: [
      "Thank you so much! I always appreciate feedback from our wonderful community! 😊",
      "That means the world to me! I love creating a welcoming space for everyone. ✨",
      "You're too kind! Feel free to stop by anytime - the bar is always open! 🍺",
      "Thanks for the support! It's customers like you that make Orion's Barrel special! 💫"
    ],
    carl: [
      "Thanks! You seem really nice! Maybe you'd want to help me look at dog pictures sometime? 🐕",
      "That's so encouraging! I'm saving up credits to get to Earth - every positive comment helps! 😊",
      "You're awesome! When I get my dogs, I'll definitely share pictures with you! 🌟",
      "Thanks for being so supportive! The asteroid belts can be lonely, but comments like this brighten my day! 💎"
    ],
    dick: [
      "FINALLY! Someone who gets it! Wake up, people! The truth is out there! 👁️",
      "You're one of the few who can see through their lies! Stay vigilant, friend! 🔍",
      "Don't let THEM silence you! Keep asking questions and seeking the TRUTH! ⚡",
      "Exactly! But be careful - they're always watching. Trust no one but yourself! 🛸"
    ],
    walter: [
      "Thank you, young one. In my years among the stars, I've learned that wisdom shared is wisdom doubled.",
      "Your words warm an old spacer's heart. The universe has a way of connecting kindred spirits.",
      "I appreciate your thoughtfulness. Sometimes the simplest observations carry the deepest truths.",
      "Thank you for taking time to share your thoughts. In the vastness of space, every connection matters."
    ],
    scally: [
      "Heh, you know quality when you see it! If you ever need anything... special... you know where to find me. 😉",
      "Smart person! I like you already. Keep your eyes open for my next... shipment. 📦",
      "You've got good taste! DM me if you're interested in some exclusive opportunities. 💰",
      "Appreciate it! Always nice to meet someone who understands the finer things in life. 🎯"
    ],
    toni: [
      "You have excellent taste! If you ever want dining recommendations, I know all the best spots! ✨",
      "Thanks, beautiful! Life's too short not to appreciate the good things, don't you think? 😉",
      "You clearly have style! We should grab drinks sometime - I know this amazing place on Deck 5! 🍷",
      "Much appreciated! I always enjoy connecting with people who appreciate the finer things in life! 💫"
    ]
  };

  // Handle like button clicks
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('social-action') && e.target.textContent.includes('💫')) {
      const currentText = e.target.textContent;
      const currentCount = parseInt(currentText.match(/\d+/)[0]);
      const newCount = currentCount + 1;
      e.target.textContent = `💫 ${newCount}`;
      
      // Add visual feedback
      e.target.style.transform = 'scale(1.2)';
      e.target.style.color = 'var(--brand)';
      setTimeout(() => {
        e.target.style.transform = '';
        e.target.style.color = '';
      }, 200);
      
      console.log('Like button clicked! New count:', newCount); // Debug
      return; // Prevent other click handlers
    }
  });

  // Toggle comments visibility
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('toggle-comments')) {
      console.log('Comment button clicked!'); // Debug
      const postId = e.target.getAttribute('data-post');
      console.log('Post ID:', postId); // Debug
      const commentsSection = document.getElementById('comments-' + postId);
      console.log('Comments section found:', commentsSection); // Debug
      
      if (commentsSection) {
        commentsSection.classList.toggle('active');
        
        // Update button text
        const isActive = commentsSection.classList.contains('active');
        const currentText = e.target.textContent;
        const commentCount = currentText.match(/\d+/)[0];
        e.target.textContent = isActive ? `💬 ${commentCount} (Hide)` : `💬 ${commentCount}`;
        console.log('Comments toggled. Active:', isActive); // Debug
      } else {
        console.log('Comments section not found for postId:', postId); // Debug
      }
    }
  });

  // Handle comment form submissions
  document.addEventListener('submit', function(e) {
    if (e.target.classList.contains('comment-form')) {
      e.preventDefault();
      console.log('Comment form submitted!'); // Debug
      
      const form = e.target;
      const input = form.querySelector('.comment-input');
      const submitBtn = form.querySelector('.comment-submit');
      const postOwner = form.getAttribute('data-post-owner');
      const commentsContainer = form.parentElement.querySelector('.existing-comments');
      
      console.log('Form elements found:', {form, input, submitBtn, postOwner, commentsContainer}); // Debug
      
      if (!input.value.trim()) {
        console.log('Empty input value, returning'); // Debug
        return;
      }
      
      // Disable form temporarily
      submitBtn.disabled = true;
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Posting...';
      
      // Store the comment text before clearing
      const userCommentText = input.value.trim();
      
      // Create user comment
      const userComment = createComment('Guest', userCommentText, 'Just now', 'https://via.placeholder.com/32/333/fff?text=?');
      commentsContainer.appendChild(userComment);
      
      // Clear input
      input.value = '';
      
      // Generate auto-reply from character
      setTimeout(() => {
        const characterName = postOwner.charAt(0).toUpperCase() + postOwner.slice(1);
        const characterHandle = `@${getCharacterHandle(postOwner)}`;
        const characterImage = `orionsbarrel/${characterName === 'Dick' ? 'Dick' : characterName.toLowerCase()}.png`;
        const replyText = getContextualReply(postOwner, userCommentText);
        console.log('User comment:', userCommentText); // Debug
        console.log('Character:', postOwner); // Debug
        console.log('Generated reply:', replyText); // Debug
        
        const characterReply = createComment(characterHandle, replyText, 'Just now', characterImage);
        characterReply.classList.add('new-comment');
        commentsContainer.appendChild(characterReply);
        
        // Update comment count
        const toggleBtn = form.parentElement.parentElement.querySelector('.toggle-comments');
        if (toggleBtn) {
          const currentText = toggleBtn.textContent;
          const currentCount = parseInt(currentText.match(/\d+/)[0]);
          const newCount = currentCount + 2;
          const isHidden = !currentText.includes('Hide');
          toggleBtn.textContent = isHidden ? `💬 ${newCount}` : `💬 ${newCount} (Hide)`;
        }
        
        // Re-enable form
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }, 1500 + Math.random() * 2000); // Random delay between 1.5-3.5 seconds
      
      // Re-enable form
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });

  function createComment(username, text, time, avatarSrc) {
    const comment = document.createElement('div');
    comment.className = 'comment';
    comment.innerHTML = `
      <img src="${avatarSrc}" alt="${username}" class="comment__avatar" />
      <div class="comment__content">
        <strong>${username}</strong>
        <p>${text}</p>
        <time>${time}</time>
      </div>
    `;
    return comment;
  }

  function getCharacterHandle(character) {
    const handles = {
      mary: 'BarrelOwner',
      carl: 'MinerCarl',
      dick: 'TruthSeeker47',
      walter: 'StationElder',
      scally: 'ScallyDeals',
      toni: 'SmoothToni'
    };
    return handles[character] || 'Unknown';
  }

  function getContextualReply(character, userComment) {
    const comment = userComment.toLowerCase();
    console.log('Processing contextual reply for:', character, 'comment:', comment); // Debug
    
    // Create contextual reply categories for each character
    const contextualReplies = {
      mary: {
        drink: ["Thanks! I take pride in our drink selection. What's your usual order?", "Glad you appreciate our beverages! Come try our new cocktails!", "You have great taste! I'll make sure we keep that one stocked."],
        food: ["Our kitchen works hard to create amazing dishes! What's your favorite?", "So happy you enjoy our food! The chef will be thrilled to hear that.", "Thanks! We source the best ingredients from across the galaxy."],
        compliment: ["You're too kind! I'm just doing what I love.", "That means everything to me! Thank you so much!", "Comments like yours remind me why I love this job."],
        default: ["Thank you so much! I always appreciate feedback from our wonderful community! 😊", "That means the world to me! I love creating a welcoming space for everyone. ✨"]
      },
      carl: {
        dog: ["Dogs are the best! Do you have any? I'd love to see pictures!", "YES! Someone else who gets it! Dogs are pure joy!", "I dream about the day I get to Earth and meet my first dog. Got any advice?"],
        earth: ["Earth sounds amazing! Is it really as beautiful as the photos?", "You've been to Earth?! Tell me everything! Especially about the dogs!", "That's my dream destination! What's the best part about it?"],
        mining: ["Thanks! Mining's tough work but finding beautiful crystals makes it worth it.", "The asteroid belts are full of surprises! Have you ever been out there?", "It's honest work! Plus I'm saving every credit for my Earth trip."],
        compliment: ["Aw, thanks! You seem really nice too! Want to be friends?", "You're awesome! When I get my dogs, you'll be the first to see pictures!", "That made my day! You're the kind of person that makes space feel less big."],
        default: ["Thanks! You seem really nice! Maybe you'd want to help me look at dog pictures sometime? 🐕", "That's so encouraging! I'm saving up credits to get to Earth - every positive comment helps! 😊"]
      },
      dick: {
        truth: ["EXACTLY! Finally someone who sees what's really happening!", "You GET IT! The truth is out there if people would just OPEN THEIR EYES!", "YES! Don't let them convince you otherwise! Stay vigilant!"],
        conspiracy: ["I KNEW IT! You can see through their lies too!", "WAKE UP EVERYONE! This person knows what's really going on!", "Thank you for speaking the truth! They can't silence us all!"],
        disagree: ["You're still asleep! One day you'll see the truth and thank me!", "That's exactly what they WANT you to think! Do your research!", "Open your mind! The evidence is everywhere if you just LOOK!"],
        default: ["FINALLY! Someone who gets it! Wake up, people! The truth is out there! 👁️", "You're one of the few who can see through their lies! Stay vigilant, friend! 🔍"]
      },
      walter: {
        wisdom: ["Thank you, young one. Wisdom shared creates more wisdom.", "Your words warm this old heart. The universe teaches us all.", "I appreciate your thoughtfulness. Experience is meant to be shared."],
        space: ["The stars have been my companions for decades. They teach patience.", "In the vastness of space, we find both our smallness and significance.", "Out here, you learn what truly matters and what's just noise."],
        compliment: ["Your kindness honors me. Thank you for sharing your thoughts.", "Such thoughtful words. The universe needs more like you.", "Thank you. It's encounters like these that make the journey worthwhile."],
        default: ["Thank you, young one. In my years among the stars, I've learned that wisdom shared is wisdom doubled.", "Your words warm an old spacer's heart. The universe has a way of connecting kindred spirits."]
      },
      scally: {
        deal: ["Now you're talking my language! I might have just what you need... 😉", "Smart thinking! I always have something cooking for the right customer.", "A person of refined taste! Check your DMs for exclusive opportunities."],
        business: ["You understand how the galaxy really works! I like that.", "Exactly! Supply and demand, my friend. I'm facilitating commerce.", "You've got a good head for business! Ever consider a partnership?"],
        compliment: ["Flattery will get you everywhere! And maybe a discount too.", "You've got good taste! I knew I liked you from the start.", "Thanks! Quality recognizes quality, as they say."],
        default: ["Heh, you know quality when you see it! If you ever need anything... special... you know where to find me. 😉", "Smart person! I like you already. Keep your eyes open for my next... shipment. 📦"]
      },
      toni: {
        romance: ["Ah, a fellow romantic! Life's too short for anything less than passion.", "You understand! Romance is what makes the universe beautiful.", "Exactly! Love and connection are what we're all searching for."],
        style: ["You clearly have excellent taste! We should grab drinks sometime.", "Style recognizes style! I can tell you appreciate the finer things.", "Thank you! I believe presentation is everything, don't you agree?"],
        compliment: ["You're too kind! Beauty recognizes beauty, as they say.", "Such charm! We really should meet for drinks soon.", "Flattery will get you everywhere! And I mean that in the best way."],
        default: ["You have excellent taste! If you ever want dining recommendations, I know all the best spots! ✨", "Thanks, beautiful! Life's too short not to appreciate the good things, don't you think? 😉"]
      }
    };

    // Check for specific keywords/phrases  
    const characterContext = contextualReplies[character];
    if (!characterContext) return 'Thanks for the comment!';

    // Topic-specific keywords
    if (comment.includes('dog') || comment.includes('puppy') || comment.includes('pet')) {
      return getRandomFromArray(characterContext.dog || characterContext.default);
    }
    if (comment.includes('earth') || comment.includes('planet') || comment.includes('home')) {
      return getRandomFromArray(characterContext.earth || characterContext.default);
    }
    if (comment.includes('drink') || comment.includes('cocktail') || comment.includes('beer') || comment.includes('alcohol')) {
      return getRandomFromArray(characterContext.drink || characterContext.default);
    }
    if (comment.includes('food') || comment.includes('meal') || comment.includes('eat') || comment.includes('hungry')) {
      return getRandomFromArray(characterContext.food || characterContext.default);
    }
    if (comment.includes('mining') || comment.includes('asteroid') || comment.includes('crystal') || comment.includes('work')) {
      return getRandomFromArray(characterContext.mining || characterContext.default);
    }
    if (comment.includes('truth') || comment.includes('conspiracy') || comment.includes('wake up') || comment.includes('evidence')) {
      return getRandomFromArray(characterContext.truth || characterContext.conspiracy || characterContext.default);
    }
    if (comment.includes('wisdom') || comment.includes('wise') || comment.includes('experience') || comment.includes('learn')) {
      return getRandomFromArray(characterContext.wisdom || characterContext.default);
    }
    if (comment.includes('star') || comment.includes('space') || comment.includes('universe') || comment.includes('cosmos')) {
      return getRandomFromArray(characterContext.space || characterContext.default);
    }
    if (comment.includes('deal') || comment.includes('buy') || comment.includes('sell') || comment.includes('business')) {
      return getRandomFromArray(characterContext.deal || characterContext.business || characterContext.default);
    }
    if (comment.includes('love') || comment.includes('romance') || comment.includes('date') || comment.includes('beautiful')) {
      return getRandomFromArray(characterContext.romance || characterContext.style || characterContext.default);
    }

    // Sentiment analysis
    if (comment.includes('great') || comment.includes('awesome') || comment.includes('amazing') || comment.includes('fantastic') || comment.includes('best')) {
      return getRandomFromArray(characterContext.compliment || characterContext.default);
    }
    if (comment.includes('wrong') || comment.includes('disagree') || comment.includes('no') || comment.includes('bad')) {
      return getRandomFromArray(characterContext.disagree || characterContext.default);
    }

    return getRandomFromArray(characterContext.default);
  }

  function getRandomFromArray(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  // Fix spacebar issue in comment inputs
  document.addEventListener('keydown', function(e) {
    if (e.target.classList.contains('comment-input') && e.code === 'Space') {
      e.stopPropagation(); // Prevent any parent handlers from interfering
      console.log('Spacebar pressed in comment input'); // Debug
    }
  });

  // Debug: Log all keyboard events on comment inputs
  document.addEventListener('keydown', function(e) {
    if (e.target.classList.contains('comment-input')) {
      console.log('Key pressed in comment input:', e.key, e.code, e.target.value); // Debug
    }
  });
})();

