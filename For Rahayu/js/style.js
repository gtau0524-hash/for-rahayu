# Create a romantic-themed JavaScript file for the user's pages
script = r"""
/* =====================================================
   Romantic Interactions - script.js
   Works with your existing HTML (index.html.html & index2.html.html)
   Features:
   - Scroll reveal for .photo, .box, .text
   - Heart "confetti" burst on button/link clicks
   - Soft ripple effect for .next-button/.button
   - Audio mute/volume memory (localStorage) + 'M' to mute/unmute
   - Gentle parallax on mouse move (desktop only)
   - Page fade-in/fade-out transition
   ===================================================== */

(function(){
  const LS_KEYS = {
    MUTED: 'romance_audio_muted',
    VOLUME: 'romance_audio_volume'
  };

  // ---------- Helpers ----------
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  function qs(sel, parent=document){ return parent.querySelector(sel); }
  function qsa(sel, parent=document){ return Array.from(parent.querySelectorAll(sel)); }

  // Inject minimal styles used by JS effects (kept tiny & scoped)
  function injectRuntimeStyles(){
    const css = `
      html.body-fade {
        opacity: 0;
        transition: opacity .45s ease;
      }
      html.body-ready {
        opacity: 1;
      }
      .rvl {
        opacity: 0;
        transform: translateY(16px) scale(.98);
        transition: opacity .6s cubic-bezier(.2,.6,.2,1),
                    transform .6s cubic-bezier(.2,.6,.2,1),
                    filter .6s ease;
        will-change: opacity, transform, filter;
        filter: blur(2px);
      }
      .rvl.show {
        opacity: 1;
        transform: translateY(0) scale(1);
        filter: blur(0);
      }
      .ripple {
        position: relative;
        overflow: hidden;
        isolation: isolate;
      }
      .ripple::after{
        content: "";
        position:absolute;
        inset:auto auto auto auto;
        width:0; height:0;
        border-radius:50%;
        opacity:.35;
        background: #fff;
        transform: translate(-50%, -50%);
        pointer-events:none;
      }
      .heart {
        position: fixed;
        font-size: 18px;
        color: #ff6fa3;
        pointer-events:none;
        user-select: none;
        opacity: .95;
        will-change: transform, opacity;
        z-index: 9999;
        text-shadow: 0 6px 20px rgba(255,109,166,.4);
      }
    `;
    const style = document.createElement('style');
    style.id = 'romantic-runtime-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ---------- Page fade-in/out ----------
  function setupPageFade(){
    document.documentElement.classList.add('body-fade');
    requestAnimationFrame(()=>{
      document.documentElement.classList.add('body-ready');
    });
    window.addEventListener('beforeunload', ()=>{
      document.documentElement.classList.remove('body-ready');
    });
  }

  // ---------- Scroll reveal ----------
  function setupReveal(){
    const targets = qsa('.photo, .box, .text');
    targets.forEach(el => el.classList.add('rvl'));

    const io = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -10% 0px' });

    targets.forEach(el=> io.observe(el));
  }

  // ---------- Heart confetti ----------
  function spawnHeart(x, y){
    const h = document.createElement('div');
    h.className = 'heart';
    h.textContent = '❤';
    h.style.left = x + 'px';
    h.style.top = y + 'px';
    const driftX = (Math.random() * 80) - 40; // -40..40
    const rise = 120 + Math.random()*80;
    const scale = 0.9 + Math.random()*0.6;
    const duration = 900 + Math.random()*600;
    const start = performance.now();

    function frame(t){
      const p = clamp((t - start)/duration, 0, 1);
      const ease = p<.5 ? (2*p*p) : ( -1 + (4 - 2*p) * p ); // easeInOut
      h.style.transform = `translate(${driftX*ease}px, ${-rise*ease}px) scale(${scale}) rotate(${(ease*40-20)}deg)`;
      h.style.opacity = String(1 - p);
      if (p < 1) requestAnimationFrame(frame);
      else h.remove();
    }

    document.body.appendChild(h);
    requestAnimationFrame(frame);
  }

  function attachHeartToClicks(){
    function clickHandler(e){
      // Ignore modifier/secondary clicks
      if (e.button !== 0) return;
      spawnHeart(e.clientX, e.clientY);
    }
    qsa('.next-button, .button, a.button').forEach(btn => {
      btn.addEventListener('click', clickHandler);
      btn.classList.add('ripple');
      // add soft ripple origin
