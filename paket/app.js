/* NONNA TURBO One Pager. GSAP 3.13 ScrollSmoother + ScrollTrigger: Parallax (data-speed und Bild Parallax), Wort für Wort, Zähler, horizontale Karten mit Pin.
   Alle Bilder sind normale img (nicht lazy), damit die Pin Berechnung stimmt. Nach dem Dekodieren aller Bilder und der Schrift: ScrollTrigger.refresh().
   Handy und reduzierte Bewegung ("calm"): kein Smoother, kein Pin, Karten per Wischen. Bei reduzierter Bewegung gar keine Animation. */
(function(){
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
  var mqM = window.matchMedia("(max-width:900px)");
  var reduce = window.matchMedia("(prefers-reduced-motion:reduce)").matches;
  var calm = mqM.matches || reduce;
  var bp = mqM.matches;
  if (mqM.addEventListener) mqM.addEventListener("change", function(e){ if (e.matches !== bp) location.reload(); });

  /* Tabs für die Zahlen funktionieren auch ohne Animation */
  document.querySelectorAll(".tab").forEach(function(b){
    b.addEventListener("click", function(){
      document.querySelectorAll(".tab").forEach(function(t){ var on = t === b; t.classList.toggle("on", on); t.setAttribute("aria-selected", on); });
      document.querySelectorAll(".zpanel").forEach(function(p){ p.classList.toggle("on", p.id === b.getAttribute("data-f")); });
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    });
  });

  var decodes = [].slice.call(document.images).map(function(im){
    var d = (im.decode ? im.decode() : Promise.resolve()).catch(function(){});
    return Promise.race([d, new Promise(function(r){ setTimeout(r, 4000); })]);
  });
  var fonts = (document.fonts && document.fonts.ready) ? document.fonts.ready.catch(function(){}) : Promise.resolve();
  Promise.race([Promise.all(decodes.concat([fonts])), new Promise(function(r){ setTimeout(r, 7000); })]).then(start);

  function start(){
    var bar = document.querySelector(".bar");
    var darks = [].slice.call(document.querySelectorAll(".idee,.zahlen,.kontakt"));
    function barColor(){
      var on = false;
      for (var k = 0; k < darks.length; k++){ var r = darks[k].getBoundingClientRect(); if (r.top < 40 && r.bottom > 40){ on = true; break; } }
      bar.classList.toggle("on-dark", on);
    }
    function nav(){
      document.querySelectorAll('.bar a[href^="#"], .btn[href^="#"]').forEach(function(a){
        a.addEventListener("click", function(e){
          var t = document.querySelector(a.getAttribute("href")); if (!t) return;
          e.preventDefault(); var sm = ScrollSmoother.get();
          if (sm) sm.scrollTo(t, true, "top top"); else t.scrollIntoView({behavior:"smooth"});
        });
      });
    }
    if (reduce){ window.addEventListener("scroll", barColor, {passive:true}); barColor(); nav(); return; }
    if (!calm) ScrollSmoother.create({ wrapper:"#smooth-wrapper", content:"#smooth-content", smooth:1.1, smoothTouch:0.1, effects:true });

    /* Hero */
    gsap.from(".hero-in .eyebrow, .hero-logo", { y:40, opacity:0, stagger:.12, duration:1.1, ease:"power3.out", delay:.1 });
    gsap.from(".claim span", { yPercent:110, stagger:.18, duration:1, ease:"power3.out", delay:.5 });
    gsap.from(".pill", { y:20, opacity:0, duration:.8, delay:1.1 });
    gsap.from(".st-nonna", { x:220, rotate:30, opacity:0, duration:1.1, ease:"back.out(1.4)", delay:.9 });
    gsap.from(".st-nest", { scale:.3, rotate:-120, opacity:0, duration:1.2, ease:"back.out(1.6)", delay:.7 });
    if (calm) gsap.to(".st-nest", { rotate:80, ease:"none", scrollTrigger:{ trigger:".hero", start:"top top", end:"bottom top", scrub:true } });

    /* Wort für Wort */
    document.querySelectorAll(".reveal").forEach(function(el){
      el.innerHTML = el.textContent.trim().split(/\s+/).map(function(w){ return '<span class="w">' + w + ' </span>'; }).join("");
      gsap.to(el.querySelectorAll(".w"), { opacity:1, stagger:.1, ease:"none", scrollTrigger:{ trigger:el, start:"top 82%", end:"bottom 55%", scrub:true } });
    });

    /* Zähler (nur Zählungen, keine Preise, keine Kennzahlen) */
    document.querySelectorAll("[data-n]").forEach(function(el){
      var to = +el.getAttribute("data-n"), o = { v:0 };
      if (to === 0) return;
      el.textContent = "0";
      gsap.to(o, { v:to, duration:1.6, ease:"power2.out", scrollTrigger:{ trigger:el, start:"top 92%", once:true }, onUpdate:function(){ el.textContent = Math.round(o.v); } });
    });
    gsap.from(".facts li", { y:60, opacity:0, stagger:.12, duration:.9, ease:"power3.out", scrollTrigger:{ trigger:".facts", start:"top 92%", once:true } });

    /* Inhalt: horizontale Karten mit Pin (Desktop) */
    var tr = document.querySelector(".hz-track");
    if (!calm && tr){
      var dist = function(){ return Math.max(0, tr.scrollWidth - window.innerWidth); };
      gsap.to(tr, { x:function(){ return -dist(); }, ease:"none", scrollTrigger:{ trigger:".hz-pin", start:"top top", end:function(){ return "+=" + (dist() + 200); }, pin:true, scrub:.6, invalidateOnRefresh:true,
        onUpdate:function(s){ gsap.set(".hz-prog span", { scaleX:s.progress }); } } });
      gsap.utils.toArray(".hc-img img").forEach(function(im){
        gsap.fromTo(im, { scale:1.18 }, { scale:1, ease:"none", scrollTrigger:{ trigger:".hz-pin", start:"top top", end:function(){ return "+=" + (dist() * .6); }, scrub:true, invalidateOnRefresh:true } });
      });
    }

    /* Karte, Köpfe von Abschnitten */
    gsap.utils.toArray(".kt-head > *, .ld-head > *, .pk-head > *, .eh-head > *, .wt-head > *, .zh-head > div > *").forEach(function(el){
      gsap.from(el, { y:50, opacity:0, duration:1, ease:"power3.out", scrollTrigger:{ trigger:el, start:"top 88%", once:true } });
    });
    gsap.utils.toArray(".dc").forEach(function(el, i){
      gsap.from(el, { y:60, opacity:0, duration:.9, delay:(i % 4) * .06, ease:"power3.out", scrollTrigger:{ trigger:el, start:"top 94%", once:true } });
    });
    gsap.utils.toArray(".dc-img img").forEach(function(im){
      gsap.fromTo(im, { scale:1.15 }, { scale:1, ease:"none", scrollTrigger:{ trigger:im.parentNode, start:"top bottom", end:"bottom 30%", scrub:true } });
    });

    /* Laden: Bild Parallax im Rahmen */
    gsap.utils.toArray(".fr img").forEach(function(im){
      gsap.fromTo(im, { yPercent:-8 }, { yPercent:8, ease:"none", scrollTrigger:{ trigger:im.parentNode, start:"top bottom", end:"bottom top", scrub:true } });
    });

    /* Pakete, Zahlen, Ehrlich, Schritte */
    gsap.from(".pk", { y:80, opacity:0, stagger:.15, duration:1, ease:"power3.out", scrollTrigger:{ trigger:".pk-grid", start:"top 85%", once:true } });
    gsap.from(".pk-mini", { y:40, opacity:0, stagger:.08, duration:.8, ease:"power3.out", scrollTrigger:{ trigger:".pk-row", start:"top 92%", once:true } });
    gsap.from(".zh-stamp", { scale:.2, rotate:-70, opacity:0, duration:1, ease:"back.out(1.8)", scrollTrigger:{ trigger:".zh-head", start:"top 80%", once:true } });
    gsap.from(".zcard", { y:70, opacity:0, stagger:.15, duration:1, ease:"power3.out", scrollTrigger:{ trigger:".zpanels", start:"top 88%", once:true } });
    gsap.from(".notes p", { y:40, opacity:0, stagger:.12, duration:.9, ease:"power3.out", scrollTrigger:{ trigger:".notes", start:"top 90%", once:true } });
    gsap.utils.toArray(".eh").forEach(function(el, i){
      gsap.from(el, { y:50, opacity:0, duration:.9, delay:(i % 3) * .08, ease:"power3.out", scrollTrigger:{ trigger:el, start:"top 92%", once:true } });
    });
    gsap.utils.toArray(".sp").forEach(function(el, i){
      gsap.from(el, { y:50, opacity:0, duration:.9, delay:(i % 3) * .08, ease:"power3.out", scrollTrigger:{ trigger:el, start:"top 92%", once:true } });
    });
    gsap.from(".end-logo", { scale:.75, opacity:0, scrollTrigger:{ trigger:".kontakt", start:"top 80%", end:"top 35%", scrub:true } });
    gsap.from(".kontakt .end-claim, .kontakt .who, .kontakt .cta", { y:40, opacity:0, stagger:.12, duration:.9, scrollTrigger:{ trigger:".kontakt", start:"top 50%", once:true } });

    gsap.ticker.add(barColor);
    nav();
    ScrollTrigger.refresh();
    window.addEventListener("load", function(){ ScrollTrigger.refresh(); });
    setTimeout(function(){ ScrollTrigger.refresh(); }, 1200);
  }
})();
