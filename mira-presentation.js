/*
 * Derived presentation renderer inspired by MIRA's aula-capitulo template.
 * Required Notice: Copyright © 2026 Sandeco — MIRA (mira-animator)
 * License: PolyForm Noncommercial 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */
(function () {
    'use strict';

    const CYAN = '#22d3ee';

    function escapeHTML(value) {
        return String(value ?? '')
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    function normalizePlan(plan) {
        const supportedVisuals = ['orbit', 'flow', 'steps', 'pulse', 'grid', 'compare', 'timeline', 'quote'];
        const slides = Array.isArray(plan?.slides) ? plan.slides.slice(0, 10) : [];
        return {
            title: String(plan?.title || 'Apresentação da leitura').slice(0, 120),
            subtitle: String(plan?.subtitle || 'Ideias essenciais do trecho selecionado').slice(0, 220),
            slides: slides.map((slide, index) => ({
                title: String(slide?.title || `Ideia ${index + 1}`).slice(0, 120),
                kicker: String(slide?.kicker || 'Conceito-chave').slice(0, 80),
                bullets: (Array.isArray(slide?.bullets) ? slide.bullets : [])
                    .slice(0, 4)
                    .map(item => String(item).slice(0, 150)),
                visual: supportedVisuals.includes(slide?.visual) ? slide.visual : 'pulse'
            })),
            closing: String(plan?.closing || 'Continue explorando, conectando e ensinando o que aprendeu.').slice(0, 240)
        };
    }

    function renderVisual(slide, index) {
        const labels = slide.bullets.slice(0, 4);
        if (slide.visual === 'flow') {
            return `<div class="flow">${labels.map((label, itemIndex) =>
                `<div class="flow-node" style="--delay:${itemIndex * 0.25}s"><b>${itemIndex + 1}</b><span>${escapeHTML(label)}</span></div>`
            ).join('<i class="flow-line"></i>')}</div>`;
        }
        if (slide.visual === 'steps') {
            return `<div class="steps">${labels.map((label, itemIndex) =>
                `<div class="step" style="--level:${itemIndex};--delay:${itemIndex * 0.2}s"><span>${escapeHTML(label)}</span></div>`
            ).join('')}</div>`;
        }
        if (slide.visual === 'orbit') {
            return `<div class="orbit" data-orbit="${index}">
                <div class="orbit-core">${escapeHTML(slide.title)}</div>
                ${labels.map((label, itemIndex) => `<div class="satellite" style="--i:${itemIndex};--total:${Math.max(labels.length, 1)}">${escapeHTML(label)}</div>`).join('')}
            </div>`;
        }
        if (slide.visual === 'grid') {
            return `<div class="idea-grid">${labels.map((label, itemIndex) =>
                `<article style="--delay:${itemIndex * 0.14}s"><b>0${itemIndex + 1}</b><span>${escapeHTML(label)}</span></article>`
            ).join('')}</div>`;
        }
        if (slide.visual === 'compare') {
            const sides = labels.slice(0, 2);
            return `<div class="compare">${sides.map((label, itemIndex) =>
                `<article class="compare-side side-${itemIndex}"><b>${itemIndex === 0 ? 'ANTES' : 'DEPOIS'}</b><span>${escapeHTML(label)}</span></article>`
            ).join('<div class="versus">×</div>')}</div>`;
        }
        if (slide.visual === 'timeline') {
            return `<div class="timeline">${labels.map((label, itemIndex) =>
                `<article style="--delay:${itemIndex * 0.2}s"><b>${itemIndex + 1}</b><span>${escapeHTML(label)}</span></article>`
            ).join('')}</div>`;
        }
        if (slide.visual === 'quote') {
            return `<blockquote class="visual-quote"><span>“</span><p>${escapeHTML(labels[0] || slide.title)}</p></blockquote>`;
        }
        return `<div class="pulse-visual"><div class="pulse-ring"></div><div class="pulse-core">${escapeHTML(slide.kicker)}</div></div>`;
    }

    function createDeck(planInput, options = {}) {
        const plan = normalizePlan(planInput);
        const primary = options.primary || CYAN;
        const sourceLabel = String(options.sourceLabel || 'Lumina Reader AI');
        const contentSlides = plan.slides.length ? plan.slides : [{
            title: 'Ideia central',
            kicker: 'Síntese',
            bullets: ['O conteúdo foi transformado em uma apresentação visual.'],
            visual: 'pulse'
        }];

        const slideHTML = contentSlides.map((slide, index) => `
<!-- SLIDE -->
<section class="slide content-slide">
  <div class="copy">
    <p class="kicker">${escapeHTML(slide.kicker)}</p>
    <h2>${escapeHTML(slide.title)}</h2>
    <ul>${slide.bullets.map(item => `<li>${escapeHTML(item)}</li>`).join('')}</ul>
  </div>
  <div class="visual-card">${renderVisual(slide, index)}</div>
</section>`).join('');

        return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHTML(plan.title)} — MIRA</title>
<style>
:root{--mira-primary:${primary};--mira-bg:#020617;--mira-surface:#0f172a;--mira-text:#f8fafc;--mira-soft:#a5b4c7;--mira-border:rgba(34,211,238,.22);--mira-glow:rgba(34,211,238,.22)}
*{box-sizing:border-box}html{scroll-behavior:smooth;scroll-snap-type:y mandatory}body{margin:0;background:var(--mira-bg);color:var(--mira-text);font-family:Inter,ui-sans-serif,system-ui,sans-serif;overflow-x:hidden}
#progress{position:fixed;z-index:20;inset:0 auto auto 0;height:4px;width:0;background:linear-gradient(90deg,var(--mira-primary),#67e8f9);box-shadow:0 0 18px var(--mira-primary);transition:width .2s}
.slide{min-height:100vh;scroll-snap-align:start;display:grid;place-items:center;padding:clamp(2rem,6vw,6rem);position:relative;overflow:hidden}
.slide:before{content:"";position:absolute;width:65vw;height:65vw;border-radius:50%;background:radial-gradient(circle,var(--mira-glow),transparent 68%);filter:blur(8px);animation:breathe 5s ease-in-out infinite}
.hero{text-align:center}.hero .inner,.closing .inner{position:relative;z-index:1;max-width:1000px}.eyebrow,.kicker{color:var(--mira-primary);font-weight:800;letter-spacing:.18em;text-transform:uppercase;font-size:.78rem}
h1{font-size:clamp(3rem,8vw,7rem);line-height:.98;margin:.35em 0;text-wrap:balance}h2{font-size:clamp(2.2rem,5vw,4.8rem);line-height:1.02;margin:.2em 0 .45em;text-wrap:balance}
.subtitle{font-size:clamp(1rem,2vw,1.45rem);line-height:1.6;color:var(--mira-soft);max-width:760px;margin:auto}
.content-slide{grid-template-columns:minmax(0,1fr) minmax(360px,1fr);gap:clamp(2rem,6vw,6rem);align-items:center}.content-slide>*{position:relative;z-index:1}
ul{list-style:none;padding:0;margin:2rem 0 0;display:grid;gap:1rem}li{color:var(--mira-soft);font-size:clamp(1rem,1.5vw,1.25rem);line-height:1.5;padding-left:1.4rem;position:relative}li:before{content:"";position:absolute;left:0;top:.65em;width:.55rem;height:.55rem;border-radius:50%;background:var(--mira-primary);box-shadow:0 0 12px var(--mira-primary)}
.visual-card{width:100%;aspect-ratio:16/10;border:1px solid var(--mira-border);border-radius:24px;background:rgba(15,23,42,.72);backdrop-filter:blur(14px);box-shadow:0 30px 80px rgba(0,0,0,.4),0 0 45px var(--mira-glow);display:grid;place-items:center;padding:2rem}
.pulse-visual{position:relative;display:grid;place-items:center;width:70%;aspect-ratio:1}.pulse-core,.orbit-core{z-index:2;width:150px;height:150px;border-radius:50%;display:grid;place-items:center;text-align:center;padding:1rem;color:#06202a;background:var(--mira-primary);font-weight:900;box-shadow:0 0 45px var(--mira-primary)}.pulse-ring{position:absolute;width:55%;aspect-ratio:1;border:2px solid var(--mira-primary);border-radius:50%;animation:pulse 2.4s ease-out infinite}
.orbit{width:100%;height:100%;position:relative;display:grid;place-items:center}.orbit:before{content:"";position:absolute;width:72%;height:58%;border:1px dashed rgba(103,232,249,.35);border-radius:50%;animation:spin 18s linear infinite}.satellite{position:absolute;width:112px;min-height:58px;border-radius:14px;border:1px solid var(--mira-border);background:#111e33;display:grid;place-items:center;text-align:center;padding:.6rem;color:var(--mira-soft);font-size:.75rem;transform:rotate(calc(360deg / var(--total) * var(--i))) translateX(190px) rotate(calc(-360deg / var(--total) * var(--i)));animation:float 3s ease-in-out infinite alternate}
.flow{width:100%;display:flex;align-items:center;justify-content:center}.flow-node{flex:1;display:grid;place-items:center;text-align:center;gap:.8rem;animation:rise .7s both;animation-delay:var(--delay)}.flow-node b{width:54px;height:54px;border-radius:50%;display:grid;place-items:center;color:#06202a;background:var(--mira-primary);box-shadow:0 0 24px var(--mira-primary)}.flow-node span{color:var(--mira-soft);font-size:.74rem}.flow-line{height:2px;flex:.35;background:linear-gradient(90deg,var(--mira-primary),transparent);animation:shimmer 1.5s infinite}
.steps{width:85%;height:75%;display:flex;align-items:flex-end}.step{flex:1;height:calc(28% + var(--level) * 18%);border:1px solid var(--mira-border);background:linear-gradient(180deg,rgba(34,211,238,.25),rgba(15,23,42,.75));display:grid;place-items:start center;padding:1rem .5rem;border-radius:10px 10px 0 0;animation:grow .8s both;animation-delay:var(--delay)}.step span{font-size:.72rem;text-align:center;color:var(--mira-soft)}
.idea-grid{width:100%;display:grid;grid-template-columns:repeat(2,1fr);gap:1rem}.idea-grid article{min-height:130px;border:1px solid var(--mira-border);border-radius:18px;padding:1.2rem;background:linear-gradient(145deg,rgba(34,211,238,.14),rgba(15,23,42,.8));display:grid;gap:.6rem;align-content:center;animation:rise .7s both;animation-delay:var(--delay)}.idea-grid b{color:var(--mira-primary);font-size:.75rem}.idea-grid span{color:var(--mira-soft);line-height:1.35}
.compare{width:100%;display:grid;grid-template-columns:1fr auto 1fr;align-items:stretch;gap:1rem}.compare-side{min-height:250px;border:1px solid var(--mira-border);border-radius:22px;padding:1.5rem;display:grid;place-items:center;text-align:center;gap:1rem;background:rgba(15,23,42,.78);animation:float 2.8s ease-in-out infinite alternate}.compare-side b{color:var(--mira-primary);font-size:.72rem;letter-spacing:.16em}.compare-side span{color:var(--mira-soft);font-size:1.05rem;line-height:1.4}.side-1{animation-delay:-1.4s}.versus{align-self:center;width:42px;height:42px;border-radius:50%;display:grid;place-items:center;background:var(--mira-primary);color:#06202a;font-weight:900}
.timeline{width:100%;display:grid;gap:1.2rem;position:relative}.timeline:before{content:"";position:absolute;left:22px;top:22px;bottom:22px;width:2px;background:linear-gradient(var(--mira-primary),transparent)}.timeline article{position:relative;display:grid;grid-template-columns:46px 1fr;align-items:center;gap:1rem;animation:rise .7s both;animation-delay:var(--delay)}.timeline b{z-index:1;width:46px;height:46px;border-radius:50%;display:grid;place-items:center;background:var(--mira-primary);color:#06202a}.timeline span{padding:1rem 1.2rem;border:1px solid var(--mira-border);border-radius:14px;color:var(--mira-soft);background:rgba(15,23,42,.82)}
.visual-quote{margin:0;position:relative;max-width:90%;text-align:center}.visual-quote>span{display:block;color:var(--mira-primary);font:900 8rem/0.65 Georgia,serif;animation:breathe 3s ease-in-out infinite}.visual-quote p{font-size:clamp(1.5rem,3vw,2.5rem);line-height:1.25;text-wrap:balance;margin:1rem 0;color:var(--mira-text)}
.closing{text-align:center}.closing h2{max-width:900px}.credit{margin-top:3rem;color:#64748b;font-size:.72rem}.controls{position:fixed;right:24px;bottom:24px;z-index:20;display:flex;gap:.6rem}.controls button{border:1px solid var(--mira-border);background:rgba(15,23,42,.88);color:var(--mira-text);width:46px;height:46px;border-radius:50%;cursor:pointer;font-size:1.2rem}.controls button:hover{background:var(--mira-primary);color:#06202a}
.video-panel{position:fixed;z-index:30;inset:auto 50% 24px auto;transform:translateX(50%);max-width:min(92vw,620px);padding:1rem 1.2rem;border:1px solid var(--mira-border);border-radius:18px;background:rgba(2,6,23,.94);box-shadow:0 20px 70px rgba(0,0,0,.55);display:none;align-items:center;gap:1rem;color:var(--mira-soft);backdrop-filter:blur(18px)}.video-panel.show{display:flex}.video-panel strong{display:block;color:var(--mira-text);margin-bottom:.2rem}.video-panel small{line-height:1.35}.video-panel button{border:0;border-radius:12px;padding:.8rem 1rem;background:var(--mira-primary);color:#06202a;font-weight:900;white-space:nowrap;cursor:pointer}.video-panel button:disabled{opacity:.55;cursor:wait}.recording .controls,.recording .video-panel{display:none!important}.recording .slide{scroll-snap-align:none}
@keyframes breathe{50%{transform:scale(1.12);opacity:.72}}@keyframes pulse{0%{transform:scale(.55);opacity:1}100%{transform:scale(1.7);opacity:0}}@keyframes spin{to{transform:rotate(360deg)}}@keyframes float{to{margin-top:-14px}}@keyframes rise{from{opacity:0;transform:translateY(30px)}}@keyframes grow{from{height:0;opacity:0}}@keyframes shimmer{50%{opacity:.25}}
@media(max-width:850px){.content-slide{grid-template-columns:1fr;padding:2rem 1.25rem}.visual-card{max-height:45vh}.satellite{transform:rotate(calc(360deg / var(--total) * var(--i))) translateX(125px) rotate(calc(-360deg / var(--total) * var(--i)));width:90px}.slide{scroll-snap-align:none}}
</style>
</head>
<body>
<div id="progress"></div>
<!-- SLIDE -->
<section class="slide hero"><div class="inner"><p class="eyebrow">MIRA · Apresentação da leitura</p><h1>${escapeHTML(plan.title)}</h1><p class="subtitle">${escapeHTML(plan.subtitle)}</p></div></section>
${slideHTML}
<!-- SLIDE -->
<section class="slide closing"><div class="inner"><p class="eyebrow">Para levar com você</p><h2>${escapeHTML(plan.closing)}</h2><p class="credit">Gerado por ${escapeHTML(sourceLabel)} com MIRA · Tema ciano<br>Required Notice: Copyright © 2026 Sandeco — MIRA (mira-animator) · PolyForm Noncommercial 1.0.0</p></div></section>
<div class="controls"><button id="record" aria-label="Transformar apresentação em vídeo" title="Transformar em vídeo">●</button><button id="prev" aria-label="Slide anterior">↑</button><button id="next" aria-label="Próximo slide">↓</button></div>
<div id="video-panel" class="video-panel"><div><strong>Transformar apresentação em vídeo</strong><small>Escolha “Esta guia” na captura. Cada slide ficará 4 segundos e o vídeo será baixado automaticamente.</small></div><button id="start-video">Gravar vídeo</button></div>
<script>
(function(){
const slides=[...document.querySelectorAll('.slide')],progress=document.getElementById('progress'),videoPanel=document.getElementById('video-panel'),startVideoButton=document.getElementById('start-video');let current=0;
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function showSlide(index,behavior='smooth'){current=Math.max(0,Math.min(slides.length-1,index));slides[current].scrollIntoView({behavior,block:'start'});}
function go(delta){showSlide(current+delta);}
function videoMime(){const types=['video/mp4;codecs=avc1','video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'];return types.find(type=>window.MediaRecorder&&MediaRecorder.isTypeSupported(type))||'';}
function downloadVideo(blob,mime){const ext=mime.includes('mp4')?'mp4':'webm',link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download=${JSON.stringify(String(plan.title || 'apresentacao').replace(/[^\p{L}\p{N}_-]+/gu, '_').slice(0, 70) || 'apresentacao')}+'_MIRA.'+ext;link.click();setTimeout(()=>URL.revokeObjectURL(link.href),4000);}
async function recordVideo(){
 if(!navigator.mediaDevices?.getDisplayMedia||!window.MediaRecorder){alert('A gravação de vídeo exige Chrome ou Edge atualizado.');return;}
 startVideoButton.disabled=true;startVideoButton.textContent='Escolha esta guia…';
 let stream;
 try{
  stream=await navigator.mediaDevices.getDisplayMedia({video:{frameRate:30},audio:false,preferCurrentTab:true,selfBrowserSurface:'include'});
  const mime=videoMime(),chunks=[],recorder=new MediaRecorder(stream,mime?{mimeType:mime,videoBitsPerSecond:8000000}:undefined);
  recorder.ondataavailable=event=>{if(event.data?.size)chunks.push(event.data);};
  const finished=new Promise((resolve,reject)=>{recorder.onstop=resolve;recorder.onerror=event=>reject(event.error||new Error('Falha na gravação'));});
  document.body.classList.add('recording');showSlide(0,'auto');await wait(700);recorder.start(250);
  for(let index=0;index<slides.length;index++){showSlide(index,index?'smooth':'auto');await wait(index?4500:4000);}
  recorder.stop();stream.getTracks().forEach(track=>track.stop());await finished;
  downloadVideo(new Blob(chunks,{type:recorder.mimeType||mime||'video/webm'}),recorder.mimeType||mime||'video/webm');
 }catch(error){if(error.name!=='NotAllowedError')alert('Não foi possível gerar o vídeo: '+error.message);}
 finally{stream?.getTracks().forEach(track=>track.stop());document.body.classList.remove('recording');startVideoButton.disabled=false;startVideoButton.textContent='Gravar vídeo';videoPanel.classList.remove('show');}
}
document.getElementById('prev').onclick=()=>go(-1);document.getElementById('next').onclick=()=>go(1);document.getElementById('record').onclick=()=>videoPanel.classList.toggle('show');startVideoButton.onclick=recordVideo;
addEventListener('scroll',()=>{const max=document.documentElement.scrollHeight-innerHeight;progress.style.width=(max?scrollY/max*100:0)+'%';current=slides.reduce((best,slide,index)=>Math.abs(slide.offsetTop-scrollY)<Math.abs(slides[best].offsetTop-scrollY)?index:best,0)});
addEventListener('keydown',event=>{if(['ArrowDown','ArrowRight','PageDown'].includes(event.key)){event.preventDefault();go(1)}if(['ArrowUp','ArrowLeft','PageUp'].includes(event.key)){event.preventDefault();go(-1)}if(event.key.toLowerCase()==='f'){document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen()}});
if(location.hash==='#video')videoPanel.classList.add('show');
})();
<\/script>
</body>
</html>`;
    }

    window.MiraPresentation = { createDeck, normalizePlan, primaryColor: CYAN };
})();
