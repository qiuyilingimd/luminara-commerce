(function(){
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(pointer:fine)").matches;
  var hasGsap = Boolean(window.gsap);
  var hasScrollTrigger = Boolean(window.ScrollTrigger);

  function clamp(value, min, max){
    return Math.min(max, Math.max(min, value));
  }

  function finish(){
    document.documentElement.classList.add("motion-ready");
    if (hasScrollTrigger){
      requestAnimationFrame(function(){ window.ScrollTrigger.refresh(); });
    }
  }

  /*
   * React Bits-inspired light language, translated to the existing vanilla
   * storefront: SpotlightCard for the dark vitrine and GlareHover for enamel.
   * The interaction moves light across the object instead of moving the object
   * itself, keeping the jewellery legible.
   */
  if (fine && !reduce){
    document.querySelectorAll(".vitem").forEach(function(card){
      var plate = card.querySelector(".v-plate");
      if (!plate){ return; }

      card.dataset.motion = "spotlight glare";
      var frame = 0;
      var lastEvent = null;

      function paint(){
        frame = 0;
        if (!lastEvent){ return; }
        var rect = plate.getBoundingClientRect();
        var x = clamp(lastEvent.clientX - rect.left, 0, rect.width);
        var y = clamp(lastEvent.clientY - rect.top, 0, rect.height);
        var nx = rect.width > 0 ? x / rect.width : .5;
        card.style.setProperty("--spot-x", x.toFixed(1) + "px");
        card.style.setProperty("--spot-y", y.toFixed(1) + "px");
        card.style.setProperty("--spot-opacity", ".34");
        card.style.setProperty("--glare-shift", ((nx * 150) - 75).toFixed(1) + "%");
        card.style.setProperty("--glare-opacity", ".52");
        lastEvent = null;
      }

      card.addEventListener("pointermove", function(event){
        if (event.pointerType && event.pointerType !== "mouse" && event.pointerType !== "pen"){ return; }
        lastEvent = event;
        if (!frame){ frame = requestAnimationFrame(paint); }
      }, {passive:true});

      card.addEventListener("pointerleave", function(){
        card.style.setProperty("--spot-opacity", "0");
        card.style.setProperty("--glare-opacity", "0");
      }, {passive:true});

      card.addEventListener("focusin", function(){
        card.style.setProperty("--spot-x", "50%");
        card.style.setProperty("--spot-y", "50%");
        card.style.setProperty("--spot-opacity", ".22");
        card.style.setProperty("--glare-opacity", ".2");
      });
      card.addEventListener("focusout", function(){
        card.style.setProperty("--spot-opacity", "0");
        card.style.setProperty("--glare-opacity", "0");
      });
    });

    document.querySelectorAll(".ls-media, .restage-sticky").forEach(function(frame){
      var pending = 0;
      var event = null;
      function paintLight(){
        pending = 0;
        if (!event){ return; }
        var rect = frame.getBoundingClientRect();
        var x = clamp(((event.clientX - rect.left) / Math.max(1, rect.width)) * 100, 16, 88);
        var y = clamp(((event.clientY - rect.top) / Math.max(1, rect.height)) * 100, 12, 82);
        frame.style.setProperty("--lx", x.toFixed(1) + "%");
        frame.style.setProperty("--ly", y.toFixed(1) + "%");
        event = null;
      }
      frame.addEventListener("pointermove", function(nextEvent){
        if (nextEvent.pointerType && nextEvent.pointerType !== "mouse" && nextEvent.pointerType !== "pen"){ return; }
        event = nextEvent;
        if (!pending){ pending = requestAnimationFrame(paintLight); }
      }, {passive:true});
      frame.addEventListener("pointerleave", function(){
        frame.style.setProperty("--lx", "57%");
        frame.style.setProperty("--ly", "42%");
      }, {passive:true});
    });
  }

  var intro = document.querySelector("#threshold");
  var introButtons = intro ? intro.querySelectorAll("[data-enter-site]") : [];
  var siteRegions = document.querySelectorAll("#nav, #mobileMenu, main, footer");
  var introSeen = document.documentElement.classList.contains("intro-seen");

  function setSiteInert(value){
    siteRegions.forEach(function(region){
      if (value){ region.setAttribute("inert", ""); }
      else { region.removeAttribute("inert"); }
    });
  }

  function playHeroEntrance(){
    if (!hasGsap || reduce){ return; }
    var leadStory = document.querySelector(".lead-story");
    var leadStage = leadStory && leadStory.querySelector(".ls-stage");
    var leadObject = leadStory && leadStory.querySelector(".ls-object");
    var leadType = leadStory
      ? leadStory.querySelectorAll(".ls-index, .ls-cn, .ls-title h1, .ls-dek, .ls-actions")
      : [];
    if (!leadStory || !leadObject || !leadType.length){ return; }

    if (leadStage){
      gsap.from(leadStage, {
        scale: 1.08,
        duration: 1.5,
        ease: "power3.out",
        clearProps: "transform"
      });
    }
    gsap.from(leadObject, {
      y: 30,
      scale: .94,
      autoAlpha: 0,
      duration: 1.35,
      ease: "power3.out",
      clearProps: "transform,opacity,visibility"
    });
    gsap.from(leadType, {
      y: 22,
      autoAlpha: 0,
      duration: .92,
      stagger: .085,
      ease: "power3.out",
      delay: .1,
      clearProps: "transform,opacity,visibility"
    });
    gsap.to(leadObject, {
      yPercent: -3.5,
      xPercent: -1.5,
      rotation: .8,
      ease: "none",
      scrollTrigger: {
        trigger: leadStory,
        start: "top top",
        end: "bottom top",
        scrub: .8,
        invalidateOnRefresh: true
      }
    });
  }

  function enterSite(mode, immediate){
    if (!intro || intro.hidden){ return; }
    try { sessionStorage.setItem("luminara-entered", "1"); } catch (error) {}
    if (window.LuminaraSound){
      if (mode === "silent"){ window.LuminaraSound.disable(); }
      else { window.LuminaraSound.enable(); }
    }
    introButtons.forEach(function(button){ button.disabled = true; });

    function finish(){
      intro.hidden = true;
      document.documentElement.classList.add("intro-seen");
      document.body.classList.remove("intro-open");
      setSiteInert(false);
      if (window.LuminaraScroll){ window.LuminaraScroll.start(); }
      playHeroEntrance();
      if (hasScrollTrigger){ requestAnimationFrame(function(){ window.ScrollTrigger.refresh(); }); }
      var heroTitle = document.querySelector("#hero-title");
      if (heroTitle){ heroTitle.setAttribute("tabindex", "-1"); heroTitle.focus({preventScroll:true}); }
    }

    if (!hasGsap || reduce || immediate){
      finish();
      return;
    }

    var leaving = gsap.timeline({onComplete: finish});
    leaving
      .to(".threshold-copy, .threshold-actions, .threshold-foot, .threshold-brand", {
        y: 18,
        autoAlpha: 0,
        duration: .38,
        stagger: .04,
        ease: "power2.in"
      }, 0)
      .to(".threshold-piece", {
        yPercent: -8,
        scale: 1.09,
        rotate: -1.5,
        duration: 1.05,
        ease: "power3.inOut"
      }, 0)
      .to(".threshold-scene img", {
        scale: 1.12,
        duration: 1.15,
        ease: "power3.inOut"
      }, 0)
      .to(intro, {
        clipPath: "inset(0% 0% 100% 0%)",
        duration: 1.05,
        ease: "power3.inOut"
      }, .32);
  }

  if (intro && !introSeen){
    setSiteInert(true);
    document.body.classList.add("intro-open");
    if (window.LuminaraScroll){ window.LuminaraScroll.stop(); }
    if (hasGsap && !reduce){
      gsap.timeline({defaults:{ease:"power3.out"}})
        .from(".threshold-brand", {y:-12, autoAlpha:0, duration:.75}, .12)
        .from(".threshold-piece", {y:38, scale:.95, autoAlpha:0, duration:1.45}, .18)
        .from(".threshold-halo", {scale:.72, autoAlpha:0, duration:1.4}, .2)
        .from(".threshold-copy > *", {y:24, autoAlpha:0, duration:.86, stagger:.1}, .42)
        .from(".threshold-actions, .threshold-foot", {y:14, autoAlpha:0, duration:.75, stagger:.08}, .72);
    }
    introButtons.forEach(function(button){
      button.addEventListener("click", function(){
        enterSite(button.getAttribute("data-enter-site"), false);
      });
    });
    window.setTimeout(function(){
      if (intro && !intro.hidden){ introButtons[0]?.focus({preventScroll:true}); }
    }, 900);
  } else {
    document.body.classList.remove("intro-open");
    setSiteInert(false);
    playHeroEntrance();
  }

  if (hasGsap && hasScrollTrigger && !reduce){
    /*
     * ScrollExpand-inspired editorial reveal: the spread starts as a crop in
     * the paper and opens to full bleed as the reader reaches the image.
     */
    var spread = document.querySelector(".spread");
    var spreadMedia = spread && spread.querySelector(".spread-media");
    if (spread && !spread.hidden && spreadMedia){
      spread.dataset.motion = "scroll-expand";
      var spreadTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: spread,
          start: "top 96%",
          end: "center 58%",
          scrub: .7,
          invalidateOnRefresh: true
        }
      });
      spreadTimeline.fromTo(
        spreadMedia,
        {clipPath: "inset(11% 12% 11% 12% round 2px)"},
        {clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "none"}
      );
    }

    var restage = document.querySelector(".restage");
    if (restage){
      restage.dataset.motion = "restaged-objects";
      var restageTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: restage,
          start: "top top",
          end: "bottom bottom",
          scrub: .9,
          invalidateOnRefresh: true
        }
      });
      restageTimeline
        .fromTo(".restage-bg", {scale:1.015, xPercent:-.6}, {scale:1.075, xPercent:.8, ease:"none"}, 0)
        .fromTo(".restage-piece.is-serpentine", {x:0, y:0, rotation:-8}, {x:-26, y:-34, rotation:-4, ease:"none"}, 0)
        .fromTo(".restage-piece.is-pearl", {x:0, y:0, rotation:0}, {x:-42, y:-30, rotation:1.6, ease:"none"}, 0)
        .fromTo(".restage-piece.is-doves", {x:0, y:0, rotation:3}, {x:28, y:24, rotation:0, ease:"none"}, 0)
        .fromTo(".restage-piece.is-coral", {x:0, y:0, rotation:9}, {x:22, y:-16, rotation:12, ease:"none"}, 0)
        .fromTo(".restage-copy", {y:0}, {y:-22, ease:"none"}, 0);
    }
  }

  window.addEventListener("load", finish, {once:true});
  finish();
})();
