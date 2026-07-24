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
        const slides = Array.isArray(plan?.slides) ? plan.slides.slice(0, 7) : [];
        return {
            title: String(plan?.title || 'Apresentação da leitura').slice(0, 120),
            subtitle: String(plan?.subtitle || 'Ideias essenciais do trecho selecionado').slice(0, 220),
            slides: slides.map((slide, index) => ({
                title: String(slide?.title || `Ideia ${index + 1}`).slice(0, 120),
                kicker: String(slide?.kicker || 'Conceito-chave').slice(0, 80),
                bullets: (Array.isArray(slide?.bullets) ? slide.bullets : [])
                    .slice(0, 5)
                    .map(item => String(item).slice(0, 240)),
                visual: ['orbit', 'flow', 'steps', 'pulse'].includes(slide?.visual) ? slide.visual : 'pulse'
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
.closing{text-align:center}.closing h2{max-width:900px}.credit{margin-top:3rem;color:#64748b;font-size:.72rem}.controls{position:fixed;right:24px;bottom:24px;z-index:20;display:flex;gap:.6rem}.controls button{border:1px solid var(--mira-border);background:rgba(15,23,42,.88);color:var(--mira-text);width:46px;height:46px;border-radius:50%;cursor:pointer;font-size:1.2rem}.controls button:hover{background:var(--mira-primary);color:#06202a}
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
<div class="controls"><button id="prev" aria-label="Slide anterior">↑</button><button id="next" aria-label="Próximo slide">↓</button></div>
<script>
(function(){const slides=[...document.querySelectorAll('.slide')],progress=document.getElementById('progress');let current=0;function go(delta){current=Math.max(0,Math.min(slides.length-1,current+delta));slides[current].scrollIntoView({behavior:'smooth'});}document.getElementById('prev').onclick=()=>go(-1);document.getElementById('next').onclick=()=>go(1);addEventListener('scroll',()=>{const max=document.documentElement.scrollHeight-innerHeight;progress.style.width=(max?scrollY/max*100:0)+'%';current=slides.reduce((best,slide,index)=>Math.abs(slide.offsetTop-scrollY)<Math.abs(slides[best].offsetTop-scrollY)?index:best,0)});addEventListener('keydown',event=>{if(['ArrowDown','ArrowRight','PageDown'].includes(event.key)){event.preventDefault();go(1)}if(['ArrowUp','ArrowLeft','PageUp'].includes(event.key)){event.preventDefault();go(-1)}if(event.key.toLowerCase()==='f'){document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen()}})})();
<\/script>
</body>
</html>`;
    }

    window.MiraPresentation = { createDeck, normalizePlan, primaryColor: CYAN };
})();
