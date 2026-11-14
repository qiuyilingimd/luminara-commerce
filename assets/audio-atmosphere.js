(function(){
  "use strict";

  var PREF_KEY = "luminara-sound-v1";
  var AMBIENT_LEVEL = .42;
  var audioButton = document.getElementById("soundToggle");
  var enabled = true;
  try {
    enabled = window.localStorage.getItem(PREF_KEY) !== "off";
  } catch (error) {}

  var context = null;
  var master = null;
  var ambientGain = null;
  var ambientSource = null;
  var ambientBuffer = null;
  var ambientPromise = null;
  var unlocked = false;
  var pageVisible = !document.hidden;

  function persist(){
    try { window.localStorage.setItem(PREF_KEY, enabled ? "on" : "off"); } catch (error) {}
  }

  function paintButton(){
    if (!audioButton){ return; }
    var playing = enabled && unlocked;
    audioButton.setAttribute("aria-pressed", playing ? "true" : "false");
    audioButton.setAttribute("aria-label", !enabled ? "Enable ambient sound" : (playing ? "Mute ambient sound" : "Start ambient sound"));
    audioButton.classList.toggle("is-on", playing);
    audioButton.title = !enabled ? "Sound off — tap to enable" : (playing ? "Sound on — tap to mute" : "Tap to start ambient sound");
  }

  function ensureContext(){
    if (context){ return context; }
    var AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass){ return null; }
    context = new AudioContextClass();
    master = context.createGain();
    master.gain.value = .86;
    master.connect(context.destination);
    ambientGain = context.createGain();
    ambientGain.gain.value = 0;
    ambientGain.connect(master);
    return context;
  }

  function loadAmbient(){
    if (ambientPromise || !context){ return ambientPromise; }
    ambientPromise = fetch("assets/luminara-ambient-v4.m4a")
      .then(function(response){
        if (!response.ok){ throw new Error("Ambient audio unavailable"); }
        return response.arrayBuffer();
      })
      .then(function(bytes){ return context.decodeAudioData(bytes); })
      .then(function(buffer){
        ambientBuffer = buffer;
        return buffer;
      })
      .catch(function(){ return null; });
    return ambientPromise;
  }

  function startAmbient(){
    if (!enabled || !pageVisible || !context || context.state !== "running" || !ambientBuffer){ return; }
    if (!ambientSource){
      ambientSource = context.createBufferSource();
      ambientSource.buffer = ambientBuffer;
      ambientSource.loop = true;
      ambientSource.connect(ambientGain);
      ambientSource.start();
    }
    var now = context.currentTime;
    ambientGain.gain.cancelScheduledValues(now);
    ambientGain.gain.setValueAtTime(ambientGain.gain.value, now);
    ambientGain.gain.linearRampToValueAtTime(AMBIENT_LEVEL, now + 2.4);
    unlocked = true;
    paintButton();
  }

  function unlockAudio(){
    if (!enabled){
      paintButton();
      return Promise.resolve(false);
    }
    var ctx = ensureContext();
    if (!ctx){ return Promise.resolve(false); }
    var resume = ctx.state === "suspended" ? ctx.resume() : Promise.resolve();
    return resume.then(function(){
      if (ctx.state !== "running"){ return false; }
      if (!ambientSource){ startAmbient(); }
      return loadAmbient().then(function(buffer){
        if (!buffer){ return false; }
        startAmbient();
        return true;
      });
    }).catch(function(){ return false; });
  }

  function tone(frequency, start, duration, level, type){
    if (!context || !master){ return; }
    var oscillator = context.createOscillator();
    var gain = context.createGain();
    oscillator.type = type || "sine";
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(.0001, start);
    gain.gain.exponentialRampToValueAtTime(level, start + .012);
    gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(master);
    oscillator.start(start);
    oscillator.stop(start + duration + .03);
  }

  function noiseSweep(start, duration, level){
    if (!context || !master){ return; }
    var frames = Math.max(1, Math.floor(context.sampleRate * duration));
    var buffer = context.createBuffer(1, frames, context.sampleRate);
    var data = buffer.getChannelData(0);
    for (var index = 0; index < frames; index += 1){
      data[index] = (Math.random() * 2 - 1) * (1 - index / frames);
    }
    var source = context.createBufferSource();
    var filter = context.createBiquadFilter();
    var gain = context.createGain();
    source.buffer = buffer;
    filter.type = "bandpass";
    filter.Q.value = .9;
    filter.frequency.setValueAtTime(440, start);
    filter.frequency.exponentialRampToValueAtTime(1800, start + duration * .55);
    filter.frequency.exponentialRampToValueAtTime(520, start + duration);
    gain.gain.setValueAtTime(.0001, start);
    gain.gain.exponentialRampToValueAtTime(level, start + .025);
    gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    source.start(start);
    source.stop(start + duration + .02);
  }

  function play(kind){
    if (!enabled){ return; }
    unlockAudio().then(function(ready){
      if (!ready || !context || context.state !== "running"){ return; }
      var start = context.currentTime + .008;
      if (kind === "chime"){
        tone(880, start, .75, .055, "sine");
        tone(1320, start + .045, .6, .032, "sine");
        tone(1760, start + .095, .48, .018, "sine");
      } else if (kind === "paper"){
        noiseSweep(start, .32, .028);
        tone(196, start + .02, .24, .018, "triangle");
      } else if (kind === "confirm"){
        tone(523.25, start, .42, .032, "sine");
        tone(783.99, start + .08, .5, .025, "sine");
      } else if (kind === "close"){
        noiseSweep(start, .2, .018);
      } else {
        tone(1280, start, .12, .016, "sine");
      }
    });
  }

  function setEnabled(next){
    enabled = Boolean(next);
    persist();
    if (!enabled){
      if (ambientGain && context){
        var now = context.currentTime;
        ambientGain.gain.cancelScheduledValues(now);
        ambientGain.gain.setValueAtTime(ambientGain.gain.value, now);
        ambientGain.gain.linearRampToValueAtTime(0, now + .5);
      }
      paintButton();
      return;
    }
    unlockAudio().then(paintButton);
  }

  if (audioButton){
    audioButton.addEventListener("click", function(event){
      event.stopPropagation();
      if (enabled && !unlocked){
        unlockAudio().then(paintButton);
      } else {
        setEnabled(!enabled);
      }
    });
  }

  function firstGesture(event){
    if (event.target.closest && event.target.closest("#soundToggle")){ return; }
    if (enabled && !unlocked){ unlockAudio(); }
  }

  window.addEventListener("pointerdown", firstGesture, {passive:true});
  window.addEventListener("keydown", firstGesture);

  document.addEventListener("visibilitychange", function(){
    pageVisible = !document.hidden;
    if (!context || !ambientGain){ return; }
    var now = context.currentTime;
    ambientGain.gain.cancelScheduledValues(now);
    ambientGain.gain.setValueAtTime(ambientGain.gain.value, now);
    if (!pageVisible){
      ambientGain.gain.linearRampToValueAtTime(0, now + .55);
    } else if (enabled && unlocked && context.state === "running"){
      ambientGain.gain.linearRampToValueAtTime(AMBIENT_LEVEL, now + .8);
    }
  });

  window.LuminaraSound = {
    play: play,
    enable: function(){ setEnabled(true); },
    disable: function(){ setEnabled(false); },
    toggle: function(){ setEnabled(!enabled); },
    get enabled(){ return enabled; }
  };
  paintButton();
})();
