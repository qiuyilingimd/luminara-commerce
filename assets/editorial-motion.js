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

    /* A small camera move keeps the film connected to the following page. */
    var billboard = document.querySelector(".billboard");
    var billboardMedia = document.querySelector("#bbVideo");
    var billboardOverlay = document.querySelector(".bb-overlay");
    if (billboard && billboardMedia && billboardOverlay){
      var filmHandoff = gsap.timeline({
        scrollTrigger: {
          trigger: billboard,
          start: "top top",
          end: "bottom top",
          scrub: .9,
          invalidateOnRefresh: true
        }
      });
      filmHandoff
        .to(billboardMedia, {scale:1.075, ease:"none"}, 0)
        .to(billboardOverlay, {yPercent:-14, autoAlpha:.15, ease:"none"}, 0);
    }
  }

  window.addEventListener("load", finish, {once:true});
  finish();
})();
