/* NONNA TURBO Konzept Website. GSAP ScrollSmoother und ScrollTrigger wie bei den anderen Konzepten (Technik gleich, Optik neu).
   Herzstück: die Box füllt sich beim Scrollen (Video wird vor und zurück gespult, komplett als Blob geladen). Dazu Stoppuhr, Wort für Wort, horizontale Karten, Parallax. */
(function(){
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
  var reduce = window.matchMedia("(prefers-reduced-motion:reduce)").matches;
  var v = document.getElementById("v-build"), num = document.querySelector(".ld-num span");
  function loadVideo(){
    var url = v.getAttribute("data-src");
    return fetch(url).then(function(r){
      if(!r.ok||!r.body) throw 0;
      var total=+r.headers.get("content-length")||3e6, got=0, reader=r.body.getReader(), ch=[];
      function pump(){return reader.read().then(function(x){ if(x.done) return new Blob(ch,{type:"video/mp4"}); ch.push(x.value); got+=x.value.length; num.textContent=Math.min(99,Math.round(got/total*100)); return pump(); });}
      return pump();
    }).then(function(b){
      v.preload="auto"; v.src=URL.createObjectURL(b); v.load();
      return new Promise(function(res){ function ok(){try{v.currentTime=.001}catch(e){} res()} if(v.readyState>=1) return ok(); v.addEventListener("loadedmetadata",ok,{once:true}); setTimeout(res,2500); });
    }).catch(function(){ v.src=v.getAttribute("data-src"); });
  }
  var fonts=(document.fonts&&document.fonts.ready)?document.fonts.ready.catch(function(){}):Promise.resolve();
  var imgs=[].slice.call(document.querySelectorAll(".cd img,.par img,.lb-img img")).map(function(im){var d=(im.decode?im.decode():Promise.resolve()).catch(function(){});return Promise.race([d,new Promise(function(r){setTimeout(r,2500)})]);});
  Promise.race([Promise.all([loadVideo(),fonts].concat(imgs)),new Promise(function(r){setTimeout(r,20000)})]).then(start);

  function scrubber(el){ var target=0,cur=0; gsap.ticker.add(function(){ if(!el.duration) return; cur+=(target-cur)*.35; if(Math.abs(el.currentTime-cur)>.012){try{el.currentTime=cur}catch(e){}} }); return function(p){ if(el.duration) target=Math.max(0,Math.min(el.duration-.05,p*el.duration)); }; }

  function start(){
    document.getElementById("loader").classList.add("done"); document.body.classList.remove("loading");
    if(!reduce) ScrollSmoother.create({wrapper:"#smooth-wrapper",content:"#smooth-content",smooth:1.1,smoothTouch:.1,effects:true});

    /* Hero: Logo springt ein, Claim, Nonna wackelt rein, Stoppuhr läuft beim Scrollen bis 01:30 */
    gsap.from(".hero-logo",{scale:.8,opacity:0,duration:1.2,ease:"back.out(1.6)",delay:.2});
    gsap.from(".claim span",{yPercent:110,stagger:.18,duration:1,ease:"power3.out",delay:.6});
    gsap.from(".hero-nonna",{x:200,rotate:30,opacity:0,duration:1.1,ease:"back.out(1.4)",delay:1});
    var tmin=document.getElementById("t-min"),tsec=document.getElementById("t-sec"),st={t:0};
    function fmt(n){return (n<10?"0":"")+n}
    gsap.timeline({scrollTrigger:{trigger:".hero",start:"top top",end:"+=1200",pin:true,scrub:true}})
      .to(st,{t:90,ease:"none",duration:1,onUpdate:function(){var s=Math.round(st.t);tmin.textContent=fmt(Math.floor(s/60));tsec.textContent=fmt(s%60);}},0)
      .to(".hero-logo",{scale:.8,yPercent:-6,ease:"none",duration:1},0)
      .to(".hero-nonna",{rotate:-4,yPercent:-12,ease:"none",duration:1},0)
      .to(".scroll-hint",{opacity:0,duration:.1},0);

    document.querySelectorAll(".reveal").forEach(function(el){
      el.innerHTML=el.textContent.trim().split(/\s+/).map(function(w){return '<span class="w">'+w+' </span>'}).join("");
      gsap.to(el.querySelectorAll(".w"),{opacity:1,stagger:.1,ease:"none",scrollTrigger:{trigger:el,start:"top 80%",end:"bottom 50%",scrub:true}});
    });
    gsap.from(".facts li",{y:70,opacity:0,stagger:.12,scrollTrigger:{trigger:".facts",start:"top 92%",end:"top 58%",scrub:true}});

    /* Herzstück: Labels, dann füllt sich die Box */
    var setV=scrubber(v),labels=gsap.utils.toArray(".labels li"),VS=.22,VE=.92;
    var tl=gsap.timeline({scrollTrigger:{trigger:".bd-pin",start:"top top",end:"+=3000",pin:true,scrub:true,onUpdate:function(s){setV(Math.max(0,Math.min(1,(s.progress-VS)/(VE-VS))))}}});
    tl.to({},{duration:1},0);
    labels.forEach(function(l,i){
      tl.fromTo(l,{opacity:0,x:30},{opacity:1,x:0,duration:.05,ease:"power2.out"},.06+i*.07);
      var out=parseFloat(l.getAttribute("data-out"));
      tl.to(l,{opacity:.3,duration:.04},VS+out*(VE-VS)-.03);
    });
    tl.fromTo(".bd-done",{opacity:0,y:16,rotate:-4},{opacity:1,y:0,duration:.05},VE-.02);

    /* Karten horizontal */
    var tr=document.querySelector(".cd-track");
    function dist(){return Math.max(0,tr.scrollWidth-window.innerWidth+40)}
    gsap.to(tr,{x:function(){return -dist()},ease:"none",scrollTrigger:{trigger:".cd-pin",start:"top top",end:function(){return "+="+(dist()+300)},pin:true,scrub:true,invalidateOnRefresh:true}});
    gsap.from(".kt-head > *",{y:60,opacity:0,stagger:.1,scrollTrigger:{trigger:".karte",start:"top 75%",end:"top 25%",scrub:true}});
    gsap.utils.toArray(".cd-img img").forEach(function(im,i){gsap.fromTo(im,{scale:1.2},{scale:1,ease:"none",scrollTrigger:{trigger:".cd-pin",start:"top top",end:"+=2200",scrub:true}})});

    /* Il Laib */
    gsap.fromTo(".lb-img",{rotate:-14,scale:.8},{rotate:-3,scale:1,ease:"none",scrollTrigger:{trigger:".laib",start:"top 85%",end:"top 20%",scrub:true}});
    gsap.from(".lb-txt > *",{y:50,opacity:0,stagger:.1,scrollTrigger:{trigger:".laib",start:"top 60%",end:"top 20%",scrub:true}});
    gsap.from(".lb-nonna",{scale:.4,opacity:0,rotate:-24,scrollTrigger:{trigger:".laib",start:"center 70%",end:"bottom 80%",scrub:true}});

    /* Bau dir deine */
    gsap.from(".step",{y:90,opacity:0,stagger:.18,scrollTrigger:{trigger:".steps",start:"top 90%",end:"top 40%",scrub:true}});
    gsap.fromTo(".bau-formen",{rotate:-20,yPercent:20},{rotate:20,yPercent:-10,ease:"none",scrollTrigger:{trigger:".bau",start:"top bottom",end:"bottom top",scrub:true}});

    /* Laden Parallax */
    gsap.utils.toArray(".par img").forEach(function(img){gsap.fromTo(img,{yPercent:-7,scale:1.08},{yPercent:0,scale:1,ease:"none",scrollTrigger:{trigger:img.parentNode,start:"top bottom",end:"bottom top",scrub:true}})});
    gsap.from(".ld-head > *",{y:50,opacity:0,stagger:.1,scrollTrigger:{trigger:".laden",start:"top 80%",end:"top 40%",scrub:true}});
    gsap.from(".end-logo",{scale:.75,opacity:0,scrollTrigger:{trigger:".end",start:"top 80%",end:"top 35%",scrub:true}});

    /* Menü Farbe auf dunklen Flächen */
    var bar=document.querySelector(".bar"),darks=[].slice.call(document.querySelectorAll(".build,.laib,.end"));
    gsap.ticker.add(function(){var on=false;for(var k=0;k<darks.length;k++){var r=darks[k].getBoundingClientRect();if(r.top<40&&r.bottom>40){on=true;break}}bar.classList.toggle("on-dark",on)});

    document.querySelectorAll('.bar a[href^="#"]').forEach(function(a){a.addEventListener("click",function(e){var t=document.querySelector(a.getAttribute("href"));if(!t)return;e.preventDefault();var sm=ScrollSmoother.get();if(sm)sm.scrollTo(t,true,"top top");else t.scrollIntoView({behavior:"smooth"})})});
    ScrollTrigger.refresh(); window.addEventListener("load",function(){ScrollTrigger.refresh()});
  }
})();
