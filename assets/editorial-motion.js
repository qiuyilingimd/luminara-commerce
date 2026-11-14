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

    /*
     * The first screen is now a still portrait. Type enters once, then the
     * photograph takes a restrained camera move while the reader scrolls.
     */
    var leadStory = document.querySelector(".lead-story");
    var leadImage = leadStory && leadStory.querySelector(".ls-media img");
    var leadType = leadStory
      ? leadStory.querySelectorAll(".ls-index, .ls-cn, .ls-title h1, .ls-dek, .ls-actions")
      : [];
    if (leadStory && leadImage && leadType.length){
      gsap.from(leadImage, {
        scale: 1.045,
        duration: 1.55,
        ease: "power3.out",
        clearProps: "transform"
      });
      gsap.from(leadType, {
        y: 22,
        autoAlpha: 0,
        duration: .92,
        stagger: .085,
        ease: "power3.out",
        delay: .12,
        clearProps: "transform,opacity,visibility"
      });
      gsap.to(leadImage, {
        scale: 1.035,
        yPercent: 1.7,
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

    var objectStudy = document.querySelector(".object-study");
    var objectMedia = objectStudy && objectStudy.querySelector(".object-media");
    if (objectStudy && objectMedia){
      objectStudy.dataset.motion = "developing-frame";
      gsap.fromTo(
        objectMedia,
        {clipPath: "inset(0% 0% 14% 0%)"},
        {
          clipPath: "inset(0% 0% 0% 0%)",
          ease: "none",
          scrollTrigger: {
            trigger: objectStudy,
            start: "top 88%",
            end: "center 58%",
            scrub: .7,
            invalidateOnRefresh: true
          }
        }
      );
    }
  }

  window.addEventListener("load", finish, {once:true});
  finish();
})();
