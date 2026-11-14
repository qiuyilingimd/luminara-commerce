(function(){
  "use strict";

  var room = document.getElementById("godotRoom");
  var frame = document.getElementById("godotFrame");
  var closeButton = document.getElementById("godotClose");
  var status = document.getElementById("godotStatus");
  var progress = document.getElementById("godotProgressBar");
  var triggers = document.querySelectorAll("[data-open-godot]");
  var closeTriggers = document.querySelectorAll("[data-close-godot]");
  var regions = document.querySelectorAll("#nav, #mobileMenu, main, footer, #threshold");
  var lastTrigger = null;
  var loaded = false;

  if (!room || !frame){ return; }

  function setPageInert(value){
    regions.forEach(function(region){
      if (value){ region.setAttribute("inert", ""); }
      else { region.removeAttribute("inert"); }
    });
  }

  function setStatus(message){
    if (status){ status.textContent = message; }
  }

  function openRoom(trigger){
    lastTrigger = trigger?.closest("#mobileMenu") ? document.getElementById("menuBtn") : (trigger || null);
    if (trigger?.closest("#mobileMenu")){
      document.getElementById("menuClose")?.click();
    }
    room.classList.add("is-open");
    room.classList.remove("is-ready", "has-error");
    room.setAttribute("aria-hidden", "false");
    document.body.classList.add("godot-open");
    if (progress){ progress.style.setProperty("--godot-progress", "8%"); }
    setStatus("Preparing the jewellery objects and studio light.");
    setPageInert(true);
    if (window.LuminaraScroll){ window.LuminaraScroll.stop(); }
    if (!loaded){
      loaded = true;
      frame.src = "assets/godot/index.html";
    }
    window.setTimeout(function(){ closeButton?.focus({preventScroll:true}); }, 80);
  }

  function closeRoom(){
    if (!room.classList.contains("is-open")){ return; }
    room.classList.remove("is-open", "is-ready", "has-error");
    room.setAttribute("aria-hidden", "true");
    document.body.classList.remove("godot-open");
    setPageInert(false);
    if (window.LuminaraScroll){ window.LuminaraScroll.start(); }
    if (lastTrigger){ lastTrigger.focus({preventScroll:true}); }
    window.setTimeout(function(){
      if (!room.classList.contains("is-open")){
        frame.src = "about:blank";
        loaded = false;
      }
    }, 500);
  }

  triggers.forEach(function(trigger){
    trigger.addEventListener("click", function(){ openRoom(trigger); });
  });
  closeButton?.addEventListener("click", closeRoom);
  closeTriggers.forEach(function(trigger){
    trigger.addEventListener("click", closeRoom);
  });
  document.addEventListener("keydown", function(event){
    if (event.key === "Escape"){ closeRoom(); }
  });

  window.addEventListener("message", function(event){
    if (event.source !== frame.contentWindow){ return; }
    var data = event.data || {};
    if (typeof data === "string"){ data = { type: data }; }
    if (data.type === "luminara-godot-progress"){
      var ratio = Number(data.total) > 0 ? Number(data.current) / Number(data.total) : 0;
      if (progress){
        progress.style.setProperty("--godot-progress", Math.max(8, Math.round(ratio * 100)) + "%");
      }
      setStatus("Placing the objects in the room.");
    } else if (data.type === "luminara-godot-ready"){
      room.classList.add("is-ready");
      setStatus("The room is open.");
      window.setTimeout(function(){ frame.focus({preventScroll:true}); }, 650);
    } else if (data.type === "luminara-godot-error"){
      room.classList.add("has-error");
      setStatus(data.message || "The 3D room could not start in this browser.");
    } else if (data.type === "luminara-godot-close"){
      closeRoom();
    }
  });

  frame.addEventListener("error", function(){
    room.classList.add("has-error");
    setStatus("The 3D room could not load. Check the connection and try again.");
  });
})();
