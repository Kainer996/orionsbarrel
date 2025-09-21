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


