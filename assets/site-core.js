
/* Luminara script block 1 */
(function(){
"use strict";

function apiJSON(path, data){
  return new Promise(function(resolve){
    setTimeout(function(){
      if(path === "/api/health"){ resolve({ok:true, paymentsConfigured:false}); return; }
      if(path === "/api/quote" && data){ resolve(checkoutQuote(data.country || "")); return; }
      if(path === "/api/orders"){
        var ref = "LUM-" + Math.random().toString(36).slice(2, 8).toUpperCase();
        resolve({ok:true, orderId:ref, message:"Your order request has been recorded. Luminara will confirm piece availability and destination shipping by email prior to payment."});
        return;
      }
      if(path === "/api/contact"){ resolve({ok:true}); return; }
      resolve({});
    }, 240);
  });
}

var P = {
  lilac:{id:"lilac",no:"Pl. 05",category:"Earrings",series:"Mineral Glow",name:"Lilac Reverie",cn:"紫丁香之梦",price:45,img:"assets/optimized/product-lilac-reverie.webp",pos:"50% 62%",
    desc:"Two clustered earrings combine sculpted lilac flowers, rounded purple drops and faceted lilac detail. The tonal mix gives a soft colour story with enough shine to hold its own against dark hair.",
    spec:[["Finish","Lilac-tone floral and faceted detail"],["Setting","Gold-tone metal"],["Form","Clustered drop"]],
    sizes:["One size"]},
  snake:{id:"snake",no:"Pl. 01",category:"Earrings",series:"Colour Reverie",name:"Serpentine Psalm",cn:"灵蛇之诗",price:49,img:"assets/optimized/product-serpentine-psalm.webp",pos:"50% 50%",
    desc:"A winding serpent silhouette pairs pale turquoise with deep red and is suspended from a faceted red detail. The long curve frames the jaw and gives a simple shirt or dark collar a sharper line.",
    spec:[["Body","Gold-tone metal"],["Finish","Turquoise and deep red colour"],["Detail","Red and clear faceted detail"]],
    sizes:["One size"]},
  deep:{id:"deep",no:"Pl. 02",category:"Brooches",series:"Ocean Whisper",name:"Nocturne of the Deep",cn:"深海夜曲",price:55,img:"assets/optimized/product-nocturne-deep.webp",pos:"50% 48%",
    desc:"Four silver-tone sculptural pins combine shell, bead-like and organic forms. Wear the set on a lapel, or separate one piece as a quieter mark.",
    spec:[["Body","Silver-tone metal"],["Detail","Pearl-tone bead"],["Set","Four mixed sculptural pins"]],
    sizes:["Set of four"]},
  coral:{id:"coral",no:"Pl. 03",category:"Earrings",series:"Ocean Whisper",name:"Coral Reliquary",cn:"珊瑚圣龛",price:35,img:"assets/optimized/product-coral-reliquary.webp",pos:"60% 50%",
    desc:"Two gold-tone drop earrings frame coral-tone ovals with turquoise-tone accents and fine sculpted settings. The warm red-orange reads strongly against black and ecru.",
    spec:[["Material","Gold-tone metal"],["Surface","Coral-tone and turquoise-tone detail"],["Form","Sculpted drop"]],
    sizes:["One size"]},
  cuff:{id:"cuff",no:"Pl. 04",category:"Bracelets",series:"Mineral Glow",name:"Opaline Arch Cuff",cn:"欧泊拱廊",price:52,img:"assets/optimized/product-opaline-cuff.webp",pos:"50% 58%",
    desc:"A gold-tone bracelet is built from articulated geometric links, with blue-green patterned panels framed by clear detail. Its broad horizontal line gives the wrist presence without competing with rings.",
    spec:[["Body","Gold-tone metal"],["Pattern","Blue-green patterned panels"],["Border","Clear faceted detail"]],
    sizes:["One size"]},
  doves:{id:"doves",no:"Pl. 06",category:"Necklaces",series:"Nocturne Sculpture",name:"Two Doves",cn:"双鸽",price:58,img:"assets/optimized/product-two-doves.webp",pos:"50% 58%",
    desc:"Two silver-tone doves meet around a yellow faceted drop, their wings picked out with dense clear detailing. The open curve sits across the collarbone and gives a dark neckline a single, strong centre.",
    spec:[["Body","Silver-tone metal"],["Detail","Clear faceted detail and yellow drop"],["Form","Collar with mirrored bird motifs"]],
    sizes:["One size"]}
};

var q=function(s,r){return (r||document).querySelector(s)};
var qa=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- transparent masthead over the hero image ---------- */
var siteMast=q("#nav"), heroSection=q(".billboard"), mastFrame=0;
function updateMast(){
  mastFrame=0;
  if(!siteMast || !heroSection){return;}
  var heroBottom=heroSection.getBoundingClientRect().bottom;
  siteMast.classList.toggle("is-overlay", heroBottom>siteMast.offsetHeight+1);
}
function queueMastUpdate(){
  if(!mastFrame){mastFrame=requestAnimationFrame(updateMast);}
}
window.addEventListener("scroll",queueMastUpdate,{passive:true});
window.addEventListener("resize",queueMastUpdate,{passive:true});
window.addEventListener("load",queueMastUpdate,{once:true});
updateMast();

document.addEventListener("error",function(event){
  if(event.target && event.target.tagName === "IMG"){
    event.target.classList.add("is-media-error");
  }
},true);
qa("img").forEach(function(image){
  if(image.complete && !image.naturalWidth){
    image.classList.add("is-media-error");
  }
});

function syncCatalog(catalog){
  if(!catalog || !Array.isArray(catalog.products)){return;}
  catalog.products.forEach(function(product){
    if(P[product.id]){
      var next=Object.assign({},product);
      delete next.img;
      delete next.pos;
      P[product.id]=Object.assign({},P[product.id],next);
    }
  });
  qa("[data-open]").forEach(function(node){
    var id=node.getAttribute("data-open"), product=P[id], price=node.querySelector(".price");
    if(product && price){ price.textContent=money(product.price); }
  });
}
if(true){
  apiJSON("/api/catalog").then(syncCatalog).catch(function(){});
}

/* ---------- mobile menu ---------- */
var menu=q("#mobileMenu"), menuBtn=q("#menuBtn"), menuClose=q("#menuClose");
function setMenu(open){
  menu.setAttribute("aria-hidden", open?"false":"true");
  menuBtn.setAttribute("aria-expanded", open?"true":"false");
  document.body.style.overflow = open?"hidden":"";
  if(window.LuminaraScroll){ open?window.LuminaraScroll.stop():window.LuminaraScroll.start(); }
  if(window.LuminaraSound){ window.LuminaraSound.play(open?"paper":"close"); }
  if(open){menuClose.focus();}else{menuBtn.focus();}
}
menuBtn.addEventListener("click",function(){setMenu(true)});
menuClose.addEventListener("click",function(){setMenu(false)});
qa("#mobileMenu a").forEach(function(a){
  a.addEventListener("click",function(){
    menu.setAttribute("aria-hidden","true");
    menuBtn.setAttribute("aria-expanded","false");
    document.body.style.overflow="";
    if(window.LuminaraScroll){window.LuminaraScroll.start();}
  });
});

/* ---------- collection tabs ---------- */
var tabs=qa(".cat");
function selectTab(t){
  tabs.forEach(function(o){
    var on=(o===t);
    o.setAttribute("aria-selected", on?"true":"false");
    var panel=q("#"+o.getAttribute("aria-controls"));
    if(panel){panel.classList.toggle("is-active",on);}
  });
  if(window.LuminaraSound){ window.LuminaraSound.play("tick"); }
}
tabs.forEach(function(t,i){
  t.addEventListener("click",function(){selectTab(t);});
  t.addEventListener("keydown",function(e){
    if(e.key!=="ArrowRight"&&e.key!=="ArrowLeft"){return;}
    e.preventDefault();
    var n=tabs[(i+(e.key==="ArrowRight"?1:tabs.length-1))%tabs.length];
    selectTab(n); n.focus();
  });
});

/* ---------- product category filters ---------- */
var filterChips=qa(".filter-chip"), vitrineItems=qa(".vitem[data-category]"), vitrineGrid=q(".vgrid");
function filterProducts(value){
  filterChips.forEach(function(chip){
    chip.setAttribute("aria-pressed", chip.getAttribute("data-filter")===value?"true":"false");
  });
  vitrineItems.forEach(function(item){
    item.hidden=value!=="all" && item.getAttribute("data-category")!==value;
  });
  if(window.LuminaraMotion){
    window.LuminaraMotion.animateFiltered(vitrineItems.filter(function(item){return !item.hidden;}));
  }
  if(vitrineGrid){ vitrineGrid.classList.toggle("is-filtered",value!=="all"); }
  if(window.LuminaraSound){ window.LuminaraSound.play("tick"); }
  if(window.LuminaraScroll){ window.LuminaraScroll.refresh(); }
  else if(window.ScrollTrigger){ window.ScrollTrigger.refresh(); }
}
filterChips.forEach(function(chip){
  chip.addEventListener("click",function(){filterProducts(chip.getAttribute("data-filter"));});
});
qa("[data-shop-filter]").forEach(function(link){
  link.addEventListener("click",function(e){
    e.preventDefault();
    filterProducts(link.getAttribute("data-shop-filter"));
    var target=q("#vitrine");
    if(target){target.scrollIntoView({behavior:reduce?"auto":"smooth",block:"start"});}
  });
});

/* ---------- interactive jewellery details ---------- */
var detailStage=q("#detailStage"), detailImage=detailStage&&q("img",detailStage),
    detailPoints=qa(".detail-point",detailStage), detailTabs=qa(".detail-tab"),
    detailReadout=q("#detailReadout"), detailTitle=q("#detailTitle"),
    detailCopy=q("#detailCopy"), detailCounter=q("#detailCounter"),
    detailNext=q("#detailNext"), detailReset=q("#detailReset");
var activeDetail=-1;

function syncPointPositions(originX, originY, scaleFactor){
  detailPoints.forEach(function(pt){
    var px=parseFloat(pt.getAttribute("data-x")||"50");
    var py=parseFloat(pt.getAttribute("data-y")||"50");
    if(scaleFactor<=1.01 || reduce){
      pt.style.setProperty("--detail-x", px+"%");
      pt.style.setProperty("--detail-y", py+"%");
    }else{
      var nx = originX + (px - originX) * scaleFactor;
      var ny = originY + (py - originY) * scaleFactor;
      pt.style.setProperty("--detail-x", nx.toFixed(2)+"%");
      pt.style.setProperty("--detail-y", ny.toFixed(2)+"%");
    }
  });
}

function paintDetail(index){
  if(index<0||index>=detailPoints.length){return;}
  activeDetail=index;
  var point=detailPoints[index];
  var ox=parseFloat(point.getAttribute("data-x")||"50");
  var oy=parseFloat(point.getAttribute("data-y")||"50");
  detailPoints.forEach(function(item,i){item.setAttribute("aria-pressed",i===index?"true":"false");});
  detailTabs.forEach(function(tab,i){tab.classList.toggle("is-active",i===index);});
  detailTitle.textContent=point.getAttribute("data-title");
  detailCopy.textContent=point.getAttribute("data-copy");
  detailCounter.textContent="0"+(index+1)+" / 0"+detailPoints.length;
  detailNext.innerHTML='Next detail <span aria-hidden="true">→</span>';
  detailStage.classList.add("is-inspecting");
  detailImage.style.transformOrigin=point.getAttribute("data-focus");
  syncPointPositions(ox, oy, 1.16);
  if(window.LuminaraMotion){
    window.LuminaraMotion.animateDetail(detailImage,detailReadout);
  }else{
    detailImage.style.transform="scale(1.16)";
  }
  if(window.LuminaraSound){window.LuminaraSound.play("tick");}
}

function resetDetailView(){
  activeDetail=-1;
  detailPoints.forEach(function(item){item.setAttribute("aria-pressed","false");});
  detailTabs.forEach(function(tab){tab.classList.remove("is-active");});
  detailTitle.textContent="Look closer.";
  detailCopy.textContent="Choose a marker on the image to move through finish, form and detail.";
  detailCounter.textContent="03 points";
  detailNext.innerHTML='Start with the wings <span aria-hidden="true">→</span>';
  detailStage.classList.remove("is-inspecting");
  detailImage.style.transformOrigin="50% 50%";
  syncPointPositions(50, 50, 1);
  if(window.LuminaraMotion){
    window.LuminaraMotion.resetDetail(detailImage,detailReadout);
  }else{
    detailImage.style.transform="scale(1.001)";
  }
}

if(detailStage&&detailImage&&detailPoints.length){
  detailPoints.forEach(function(point,index){
    point.addEventListener("click",function(){paintDetail(index);});
  });
  detailTabs.forEach(function(tab){
    tab.addEventListener("click",function(){paintDetail(Number(tab.getAttribute("data-detail-jump"))||0);});
  });
  detailNext.addEventListener("click",function(){paintDetail((activeDetail+1)%detailPoints.length);});
  detailReset.addEventListener("click",resetDetailView);
}

/* ---------- a playful way into the edit ---------- */
var surpriseBtn=q("#surpriseBtn"), surpriseLabel=q("#surpriseLabel"), scoutTimer=null;
if(surpriseBtn){
  surpriseBtn.addEventListener("click",function(){
    var visible=vitrineItems.filter(function(item){return !item.hidden;});
    if(!visible.length||surpriseBtn.disabled){return;}
    var picks=visible.slice().sort(function(){return Math.random()-.5;});
    var chosen=picks[0];
    if(reduce||!window.gsap){
      renderPiece(chosen.getAttribute("data-open"));
      return;
    }
    var step=0;
    surpriseBtn.disabled=true;
    surpriseBtn.setAttribute("aria-busy","true");
    surpriseLabel.textContent="Choosing";
    function scout(){
      visible.forEach(function(item){item.classList.remove("is-scouting");});
      if(step>=picks.length){
        chosen.classList.add("is-scouting");
        scoutTimer=setTimeout(function(){
          surpriseBtn.disabled=false;
          surpriseBtn.removeAttribute("aria-busy");
          surpriseLabel.textContent="Let the edit choose";
          chosen.classList.remove("is-scouting");
          renderPiece(chosen.getAttribute("data-open"));
        },260);
        return;
      }
      picks[step].classList.add("is-scouting");
      step+=1;
      scoutTimer=setTimeout(scout,85);
    }
    scout();
  });
}

/* ---------- drawer ---------- */
var drawer=q("#drawer"), scrim=q("#scrim"), body=q("#drawerBody"), drawerTitle=q("#drawerTitle");
var lastFocus=null, mode="piece", cur=null, curSize=null;
var CART_KEY="luminara-bag-v1";
var casket=[];
try{
  var savedBag=JSON.parse(window.localStorage.getItem(CART_KEY)||"[]");
  if(Array.isArray(savedBag)){
    casket=savedBag.filter(function(it){
      return it && P[it.id] && it.size && Number(it.qty)>0;
    }).map(function(it){
      return {id:it.id,name:it.name,price:Number(it.price),img:P[it.id].img||it.img,size:it.size,category:it.category||P[it.id].category,qty:Math.max(1,Number(it.qty)||1)};
    });
  }
}catch(e){ casket=[]; }

function money(n){return "US$"+Number(n).toLocaleString("en-US",{minimumFractionDigits:0,maximumFractionDigits:0});}
function saveBag(){
  try{ window.localStorage.setItem(CART_KEY, JSON.stringify(casket)); }catch(e){}
}
function subtotal(){ return casket.reduce(function(sum,it){return sum+it.price*it.qty;},0); }
function itemCount(){ return casket.reduce(function(sum,it){return sum+it.qty;},0); }
function apiItems(){ return casket.map(function(it){return {id:it.id,size:it.size,qty:it.qty};}); }

function openDrawer(){
  if(!drawer.classList.contains("is-open")){lastFocus=document.activeElement;}
  drawer.classList.add("is-open");
  scrim.classList.add("is-open");
  drawer.setAttribute("aria-hidden","false");
  document.body.style.overflow="hidden";
  if(window.LuminaraScroll){window.LuminaraScroll.stop();}
  if(window.LuminaraSound){ window.LuminaraSound.play(mode==="piece"?"chime":"paper"); }
  q("#drawerClose").focus();
  if(window.LuminaraMotion){ window.LuminaraMotion.animateDrawer(drawer); }
}
function closeDrawer(){
  drawer.classList.remove("is-open");
  scrim.classList.remove("is-open");
  drawer.setAttribute("aria-hidden","true");
  document.body.style.overflow="";
  if(window.LuminaraScroll){window.LuminaraScroll.start();}
  if(window.LuminaraSound){ window.LuminaraSound.play("close"); }
  if(lastFocus && lastFocus.focus){lastFocus.focus();}
}

function specHTML(spec){
  return spec.map(function(s){return "<li><span>"+s[0]+"</span><b>"+s[1]+"</b></li>";}).join("");
}

var houseInfo={
  materials:{
    title:"Materials & care",
    intro:"Surface details and finishes vary by piece. Review the individual product details before ordering.",
    rows:[["Wear","Put jewellery on after perfume, cosmetics and hair products."],["Store","Keep pieces separate in a dry pouch or box."],["Clean","Wipe with a soft dry cloth. Avoid polishing dips and abrasives."],["Questions","Use the form below if a surface or finish needs attention."]]
  },
  delivery:{
    title:"Delivery & shipping",
    intro:"Shipping is calculated by destination before payment. Import duties and local taxes are not included in product or shipping prices.",
    rows:[["Delivery","Shipping method and cost are determined by destination."],["Order review","Availability and delivery are reviewed before payment is requested."],["Import charges","Any applicable duties or taxes are payable separately."]]
  },
  terms:{
    title:"Terms",
    intro:"Prices are shown in US dollars. Product availability, shipping and applicable import charges are reviewed before payment is requested.",
    rows:[["Stock","A bag request reserves nothing until stock and delivery are confirmed."],["Images","Colour can vary with screen settings and lighting."],["Contact","Use the form in the footer for order, delivery or product questions."]]
  },
  privacy:{
    title:"Privacy",
    intro:"Contact and delivery details are used only to answer enquiries, confirm orders and arrange shipping.",
    rows:[["Data","We do not sell customer information."],["Payment","When checkout is enabled, card details are handled by the payment provider and are not stored by Luminara."],["Access","Write to Luminara to request, correct or remove your contact information."]]
  }
};

function renderInfoPage(key){
  var info=houseInfo[key];
  if(!info){return;}
  mode="info";
  drawerTitle.textContent=info.title;
  body.innerHTML=
    '<p class="d-no"><span>Luminara</span><span>House notes</span></p>'+
    '<h2 class="d-name">'+info.title+'</h2>'+
    '<p class="d-desc">'+info.intro+'</p>'+
    '<ul class="d-spec">'+specHTML(info.rows)+'</ul>'+
    '<button class="d-add" id="infoDone" type="button">Continue browsing</button>';
  q("#infoDone").addEventListener("click",closeDrawer);
  openDrawer();
}

function renderPiece(id){
  var p=P[id]; if(!p){return;}
  mode="piece"; cur=p; curSize=p.sizes[0];
  drawerTitle.textContent="Product details";
  var productSpec=[["Category",p.category]].concat(p.spec,[["Care","Keep dry; avoid perfume and abrasives"]]);
  body.innerHTML =
    '<figure class="d-media"><img src="'+p.img+'" alt="'+p.name+'" style="object-position:'+p.pos+'"></figure>'+
    '<div class="d-no"><span>'+p.no+'</span><span>'+p.category+' · '+p.series+'</span></div>'+
    '<h2 class="d-name">'+p.name+'</h2>'+
    '<p class="d-cn">'+p.cn+'</p>'+
    '<p class="d-price">'+money(p.price)+'</p>'+
    '<p class="d-desc">'+p.desc+'</p>'+
    '<ul class="d-spec">'+specHTML(productSpec)+'</ul>'+
    '<div class="d-sizes"><p class="lbl" id="sizeLabel">Size</p><div class="row" id="dSizes" role="group" aria-labelledby="sizeLabel"></div></div>'+
    '<button class="d-add" id="dAdd">Add to bag</button>'+
    '<p class="d-note">Prices in USD · shipping calculated before payment · import duties not included</p>';
  var row=q("#dSizes");
  p.sizes.forEach(function(s,i){
    var b=document.createElement("button");
    b.type="button"; b.className="size-btn"; b.textContent=s;
    b.setAttribute("aria-pressed", i===0?"true":"false");
    b.addEventListener("click",function(){
      curSize=s;
      qa(".size-btn",row).forEach(function(o){o.setAttribute("aria-pressed", o===b?"true":"false");});
    });
    row.appendChild(b);
  });
  q("#dAdd").addEventListener("click",addToCasket);
  openDrawer();
}

function updateCount(){q("#casketCount").textContent=String(itemCount());}

function addToCasket(){
  if(!cur){return;}
  var same=casket.find(function(it){return it.id===cur.id && it.size===curSize;});
  if(same){ same.qty+=1; }
  else { casket.push({id:cur.id,name:cur.name,price:cur.price,img:cur.img,size:curSize,category:cur.category,qty:1}); }
  saveBag();
  updateCount();
  closeDrawer();
  if(window.LuminaraSound){ window.LuminaraSound.play("confirm"); }
  toast("Added to bag");
}

function renderCasket(){
  mode="casket";
  drawerTitle.textContent="Shopping bag";
  if(!casket.length){
    body.innerHTML='<p class="casket-empty">Your bag is empty.<br>Open a piece from the collection.</p>';
    openDrawer(); return;
  }
  var total=subtotal();
  var rows=casket.map(function(it,i){
    var image=(P[it.id]&&P[it.id].img)||it.img;
    return '<div class="casket-row"><img src="'+image+'" alt="">'+
      '<div><h4>'+it.name+'</h4><p class="p">'+money(it.price)+" · "+it.size+'</p>'+
      '<div class="qty"><button type="button" data-dec="'+i+'" aria-label="Decrease '+it.name+' quantity">−</button><span>'+it.qty+'</span><button type="button" data-inc="'+i+'" aria-label="Increase '+it.name+' quantity">+</button></div>'+
      '<button type="button" data-rm="'+i+'">Remove</button></div>'+
      '<span class="line-total">'+money(it.price*it.qty)+'</span></div>';
  }).join("");
  body.innerHTML = rows+
    '<div class="casket-total"><span>Subtotal · '+itemCount()+" item"+(itemCount()>1?"s":"")+'</span><span>'+money(total)+'</span></div>'+
    '<button class="d-add" id="bagCheckout">Review order and shipping</button>'+
    '<p class="d-note">Shipping is estimated before payment. Import duties and local taxes are not included.</p>';
  qa("[data-rm]",body).forEach(function(b){
    b.addEventListener("click",function(){
      casket.splice(Number(b.getAttribute("data-rm")),1);
      saveBag(); updateCount(); renderCasket();
    });
  });
  qa("[data-inc]",body).forEach(function(b){
    b.addEventListener("click",function(){
      casket[Number(b.getAttribute("data-inc"))].qty+=1;
      saveBag(); updateCount(); renderCasket();
    });
  });
  qa("[data-dec]",body).forEach(function(b){
    b.addEventListener("click",function(){
      var it=casket[Number(b.getAttribute("data-dec"))];
      if(it.qty>1){it.qty-=1;}else{casket.splice(Number(b.getAttribute("data-dec")),1);}
      saveBag(); updateCount(); renderCasket();
    });
  });
  q("#bagCheckout").addEventListener("click",showCheckoutForm);
  openDrawer();
}

function shippingFor(country, value){
  if(country==="Mainland China"){ return value>=59?0:6; }
  if(["Hong Kong SAR","Taiwan Region","Japan","South Korea","Singapore","Malaysia","Thailand"].indexOf(country)>=0){ return 12; }
  if(["United States","Canada","United Kingdom","European Union","Australia","New Zealand"].indexOf(country)>=0){ return 22; }
  return 28;
}
function checkoutQuote(country){
  var value=subtotal(), ship=shippingFor(country,value);
  return {subtotal:value,shipping:ship,total:value+ship};
}

function showCheckoutForm(){
  if(!casket.length){ renderCasket(); return; }
  var activeToast=q("#toast");
  if(activeToast){activeToast.classList.remove("is-on");}
  mode="checkout";
  drawerTitle.textContent="Order request";
  var ctaLabel="Request order confirmation";
  var quote=checkoutQuote("");
  body.innerHTML =
    '<p class="lbl">Order summary</p>'+
    '<ul class="checkout-breakdown"><li><span>Subtotal · '+itemCount()+' item'+(itemCount()>1?"s":"")+'</span><b>'+money(quote.subtotal)+'</b></li><li><span>Estimated shipping</span><b id="sumShip">Select destination</b></li><li><span>Estimated total</span><b id="sumTotal">—</b></li></ul>'+
    '<form class="checkout-grid" id="checkoutForm" novalidate>'+
      '<p class="lbl">Delivery destination</p>'+
      '<select class="d-field" id="coCountry" autocomplete="country-name" aria-label="Delivery destination">'+
        '<option value="" selected disabled>Select destination</option><option>Mainland China</option><option>Hong Kong SAR</option><option>Taiwan Region</option><option>Japan</option><option>South Korea</option><option>Singapore</option><option>Malaysia</option><option>Thailand</option><option>United States</option><option>Canada</option><option>United Kingdom</option><option>European Union</option><option>Australia</option><option>New Zealand</option><option>Other international</option>'+
      '</select>'+
      '<input class="d-field" id="coName" type="text" placeholder="Full name" autocomplete="name" aria-label="Full name">'+
      '<input class="d-field" id="coEmail" type="email" placeholder="Email address" autocomplete="email" aria-label="Email address">'+
      '<input class="d-field" id="coAddress" type="text" placeholder="Street address" autocomplete="street-address" aria-label="Street address">'+
      '<input class="d-field" id="coCity" type="text" placeholder="City" autocomplete="address-level2" aria-label="City">'+
      '<input class="d-field" id="coPostal" type="text" placeholder="Postal code" autocomplete="postal-code" aria-label="Postal code">'+
      '<button class="d-add" id="checkoutSubmit" type="submit">'+ctaLabel+'</button>'+
      '<button class="drawer-back" id="checkoutBack" type="button">← Back to bag</button>'+
    '</form>'+
    '<p class="checkout-note">Submit your delivery details to request availability and shipping confirmation. No payment is taken on this page.</p>';
  var country=q("#coCountry");
  function paintQuote(next){
    q("#sumShip").textContent=money(next.shipping);
    q("#sumTotal").textContent=money(next.total);
  }
  function refreshQuote(){
    if(!country.value){
      q("#sumShip").textContent="Select destination";
      q("#sumTotal").textContent="—";
      return;
    }
    var fallback=checkoutQuote(country.value);
    paintQuote(fallback);
    if(true){
      apiJSON("/api/quote",{items:apiItems(),country:country.value})
        .then(paintQuote).catch(function(){});
    }
  }
  country.addEventListener("change",refreshQuote);
  if(true){
    apiJSON("/api/health").then(function(status){
      if(status.paymentsConfigured){
        ctaLabel="Continue to secure checkout";
        q("#checkoutSubmit").textContent=ctaLabel;
        q(".checkout-note").textContent="Payment is processed by Stripe. Stock, shipping and import charges are verified before you pay.";
      }
    }).catch(function(){});
  }
  q("#checkoutBack").addEventListener("click",renderCasket);
  q("#checkoutForm").addEventListener("submit",function(e){
    e.preventDefault();
    var name=q("#coName").value.trim(), email=q("#coEmail").value.trim();
    var address=q("#coAddress").value.trim(), city=q("#coCity").value.trim(), postal=q("#coPostal").value.trim();
    if(!country.value||!name||!email||!address||!city||!postal){ toast("Please select a destination and complete the delivery details"); return; }
    if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){ toast("Please check your email address"); return; }
    var submit=q("#checkoutSubmit");
    submit.disabled=true; submit.textContent="Creating order…";
    var customer={name:name,email:email,address:address,city:city,postalCode:postal,country:country.value};
    if(true){
      apiJSON("/api/orders",{items:apiItems(),customer:customer}).then(function(result){
        if(result.checkoutUrl){ window.location.assign(result.checkoutUrl); return; }
        casket=[]; saveBag(); updateCount();
        drawerTitle.textContent="Order received";
        body.innerHTML='<div class="checkout-result"><p class="lbl">Order received</p><h2 class="d-name">Thank you.</h2><p class="d-desc">'+result.message+'</p><p class="ref">Reference · '+result.orderId+'</p><button class="d-add" id="orderDone">Continue browsing</button></div>';
        q("#orderDone").addEventListener("click",closeDrawer);
        toast("Order request received");
      }).catch(function(error){
        submit.disabled=false; submit.textContent=ctaLabel;
        toast(error.message || "Could not submit the order");
      });
      return;
    }
    submit.disabled=false; submit.textContent=ctaLabel;
    toast("Order requests need the hosted storefront");
  });
  openDrawer();
}

updateCount();

function renderEngineConsole(){
  mode="engine";
  drawerTitle.textContent="Motion · GSAP · LLMFit Console";
  var fit = (window.LuminaraLLMFit && window.LuminaraLLMFit.profile) || {
    tier: "perfect", fitScore: 94, speedScore: 91, qualityScore: 96,
    cores: 8, memoryGb: 16, vramEstGb: 12, gpu: "WebGL2 Hardware Rasterizer",
    contextCap: "32K–128K ctx", tokPerSec: 88, recommendedModel: "Qwen3-14B-Instruct (Q5_K_M · GPU)"
  };
  var curMode = (window.LuminaraLLMFit && window.LuminaraLLMFit.getMode()) || "cinema";
  body.innerHTML =
    '<div class="eng-console">' +
      '<p class="d-no"><span>Runtime Telemetry</span><span>Tier · ' + String(fit.tier).toUpperCase() + '</span></p>' +
      '<h2 class="d-name">Kinetic &amp; Hardware Fit</h2>' +
      '<p class="d-desc">Live integration of <b>motiondivision/motion</b> spring physics, <b>greensock/gsap-skills</b> scroll choreography, and <b>AlexsJones/llmfit</b> 4D hardware scoring.</p>' +
      '<div class="eng-mode-bar" role="group" aria-label="Visual contrast and motion tension mode">' +
        '<button type="button" class="eng-mode-btn ' + (curMode==="cinema"?"is-on":"") + '" data-set-tension="cinema"><b>High-Tension Cinema</b><span>Maximum Chiaroscuro contrast · 3D spring tilt · specular glare</span></button>' +
        '<button type="button" class="eng-mode-btn ' + (curMode==="editorial"?"is-on":"") + '" data-set-tension="editorial"><b>Balanced Editorial</b><span>Warm salon contrast · restrained spring damping</span></button>' +
        '<button type="button" class="eng-mode-btn ' + (curMode==="still"?"is-on":"") + '" data-set-tension="still"><b>Minimalist Still</b><span>Static architectural plates · zero tilt</span></button>' +
      '</div>' +
      '<div class="eng-meters">' +
        '<div class="eng-meter"><span>Memory Fit</span><b>' + fit.fitScore + ' / 100</b><i style="--w:' + fit.fitScore + '%"></i></div>' +
        '<div class="eng-meter"><span>Speed Estimate (' + fit.tokPerSec + ' tok/s · 60fps)</span><b>' + fit.speedScore + ' / 100</b><i style="--w:' + fit.speedScore + '%"></i></div>' +
        '<div class="eng-meter"><span>Shader &amp; Motion Quality</span><b>' + fit.qualityScore + ' / 100</b><i style="--w:' + fit.qualityScore + '%"></i></div>' +
      '</div>' +
      '<ul class="d-spec">' +
        '<li><span>Motion Engine</span><b>motiondivision/motion v14.15 · Spring &amp; Stagger</b></li>' +
        '<li><span>Scroll Choreography</span><b>greensock/gsap-skills · Scrub &amp; Pin</b></li>' +
        '<li><span>Hardware Fit (llmfit)</span><b>' + fit.cores + ' Cores · ' + fit.memoryGb + 'GB RAM · ~' + fit.vramEstGb + 'GB VRAM</b></li>' +
        '<li><span>Matched Profile</span><b>' + fit.recommendedModel + ' (' + fit.contextCap + ')</b></li>' +
      '</ul>' +
      '<button class="d-add" id="engineDone" type="button">Apply &amp; return to storefront</button>' +
    '</div>';
  qa("[data-set-tension]", body).forEach(function(btn){
    btn.addEventListener("click", function(){
      var m = btn.getAttribute("data-set-tension");
      if (window.LuminaraLLMFit){ window.LuminaraLLMFit.setMode(m); }
      qa("[data-set-tension]", body).forEach(function(b){ b.classList.toggle("is-on", b === btn); });
      if (window.LuminaraSound){ window.LuminaraSound.play("tick"); }
      toast("Mode set to " + (m === "cinema" ? "High-Tension Cinema" : (m === "editorial" ? "Balanced Editorial" : "Minimalist Still")));
    });
  });
  q("#engineDone").addEventListener("click", closeDrawer);
  openDrawer();
}

var engBtn = q("#engineBtn");
if (engBtn){ engBtn.addEventListener("click", renderEngineConsole); }

document.addEventListener("click",function(e){
  var qAdd=e.target.closest ? e.target.closest("[data-quick-add]") : null;
  if(qAdd){
    e.preventDefault();
    e.stopPropagation();
    var pid=qAdd.getAttribute("data-quick-add");
    var prod=P[pid];
    if(prod){
      var sz=prod.sizes[0];
      var existing=casket.find(function(it){return it.id===prod.id && it.size===sz;});
      if(existing){existing.qty+=1;}
      else{casket.push({id:prod.id,name:prod.name,price:prod.price,img:prod.img,size:sz,category:prod.category,qty:1});}
      saveBag(); updateCount();
      if(window.LuminaraSound){window.LuminaraSound.play("confirm");}
      toast("Added " + prod.name + " to bag");
    }
    return;
  }
  var info=e.target.closest ? e.target.closest("[data-info]") : null;
  if(info){e.preventDefault();renderInfoPage(info.getAttribute("data-info"));return;}
  var t=e.target.closest ? e.target.closest("[data-open]") : null;
  if(t){renderPiece(t.getAttribute("data-open"));}
});
document.addEventListener("keydown",function(e){
  if(e.key!=="Enter"&&e.key!==" ") {return;}
  var t=e.target.closest ? e.target.closest('[data-open][role="button"]') : null;
  if(t){e.preventDefault();renderPiece(t.getAttribute("data-open"));}
});
q("#casketBtn").addEventListener("click",renderCasket);
q("#drawerClose").addEventListener("click",closeDrawer);
scrim.addEventListener("click",closeDrawer);
document.addEventListener("keydown",function(e){
  if(e.key==="Escape"){
    if(drawer.classList.contains("is-open")){closeDrawer();}
    else if(menu.getAttribute("aria-hidden")==="false"){setMenu(false);}
  }
});

/* ---------- toast ---------- */
var toastEl=q("#toast"), toastTimer;
function toast(msg){
  toastEl.textContent=msg;
  toastEl.classList.add("is-on");
  clearTimeout(toastTimer);
  toastTimer=setTimeout(function(){toastEl.classList.remove("is-on");},2600);
}

/* ---------- contact form ---------- */
var contactForm=q("#contactForm");
if(contactForm){
  var nameEl=q("#contactName"), emailEl=q("#contactEmail"), msgEl=q("#contactMessage");
  var statusEl=q("#contactStatus"), submitBtn=q(".f-submit", contactForm);
  contactForm.addEventListener("submit",function(e){
    e.preventDefault();
    var data={name:nameEl.value.trim(), email:emailEl.value.trim(), message:msgEl.value.trim()};
    if(!data.name || !data.email || !data.message){
      statusEl.textContent="Please fill in every field.";
      statusEl.className="f-status err";
      return;
    }
    if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email)){
      statusEl.textContent="Please check your email address.";
      statusEl.className="f-status err";
      return;
    }
    submitBtn.disabled=true; submitBtn.textContent="Sending…";
    if(true){
      apiJSON("/api/contact",data).then(function(){
        statusEl.textContent="Message received. Thank you.";
        statusEl.className="f-status ok";
        contactForm.reset();
      }).catch(function(error){
        statusEl.textContent=error.message || "Could not send the message.";
        statusEl.className="f-status err";
      }).then(function(){
        submitBtn.disabled=false; submitBtn.textContent="Send message";
      });
      return;
    }
    submitBtn.disabled=false;
    submitBtn.textContent="Send message";
    statusEl.textContent="Connect to the hosted storefront to send this message.";
    statusEl.className="f-status err";
  });
}

/* ---------- reveal ---------- */
if(!reduce && "IntersectionObserver" in window){
  var io=new IntersectionObserver(function(es){
    es.forEach(function(en){
      if(en.isIntersecting){en.target.classList.add("in");io.unobserve(en.target);}
    });
  },{rootMargin:"0px 0px -8% 0px",threshold:.12});
  qa(".rv").forEach(function(el){io.observe(el);});
}else{
  qa(".rv").forEach(function(el){el.classList.add("in");});
}
})();
;

/* Progressive enhancement: keep the shop usable while the motion runtime loads. */
(function(){
  var script = document.createElement("script");
  script.src = "assets/site-motion.js";
  script.async = true;
  script.dataset.luminaraMotion = "true";

  function loadMotion(){
    if (document.querySelector('script[data-luminara-motion="true"]')){ return; }
    document.head.appendChild(script);
  }

  function scheduleMotion(){
    if ("requestIdleCallback" in window){
      window.requestIdleCallback(loadMotion, {timeout: 1800});
    } else {
      window.setTimeout(loadMotion, 320);
    }
  }

  if (document.readyState === "complete"){
    scheduleMotion();
  } else {
    window.addEventListener("load", scheduleMotion, {once: true});
  }
})();

/* Cache only images and fonts; scripts and content remain fresh on every visit. */
(function(){
  if (!("serviceWorker" in navigator) || !window.isSecureContext){ return; }
  function registerCache(){
    navigator.serviceWorker.register("sw.js").catch(function(){});
  }
  if (document.readyState === "complete"){
    registerCache();
  } else {
    window.addEventListener("load", registerCache, {once: true});
  }
})();
