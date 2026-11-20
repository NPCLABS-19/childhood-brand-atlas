import {renderAssignment} from './assignment.js?v=20261120-v3';
import {extractions} from './amaira-extractions.js?v=20261120-v3';

const esc = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));

function colours() {
  return `<div class="intro"><h1>Amaira’s<br>colours.</h1><p>Eight colours sampled from her uploaded artwork. Paper and dark backgrounds excluded.</p></div>
    <div class="extracted-colours">${extractions.colors.map(colour => `<article class="extracted-colour"><button class="extracted-swatch" style="--sample:${colour.hex}" data-copy-colour="${colour.hex}" aria-label="Copy ${colour.name}, ${colour.hex}"></button><h2>${colour.name}</h2><div class="extraction-meta"><button data-copy-colour="${colour.hex}" aria-label="Copy ${colour.hex}">${colour.hex}</button><a href="#wip/amaira/question-${colour.question}">Question ${colour.question}</a></div></article>`).join('')}</div>
    <div class="section-end"><p class="note-line">Sampled from photographed and rendered artwork; these are working colour references. Select a swatch to copy its hex value.</p><a class="text-link" href="assignment/amaira/extracted/palette.svg" download="amaira-palette.svg">Download palette</a></div>`;
}

function patterns() {
  return `<div class="intro"><h1>Amaira’s<br>patterns.</h1><p>Five extracts from her shape study, keeping the original marks and paper texture.</p></div>
    <div class="extracted-patterns">${extractions.patterns.map(pattern => `<article><a class="pattern-image" href="${pattern.download}" target="_blank" rel="noopener"><img src="${pattern.src}" width="${pattern.width}" height="${pattern.height}" alt="${esc(pattern.description)}" loading="lazy"></a><div class="pattern-caption"><div><h2>${esc(pattern.name)}</h2><p>${esc(pattern.description)}</p></div><a class="text-link" href="${pattern.download}" download="amaira-${pattern.name.toLowerCase().replace(/[^a-z]+/g,'-')}.png">Download extract</a></div></article>`).join('')}</div>
    <div class="section-end"><p class="note-line">Direct crops from question 9. Crop coordinates and colour sampling regions are recorded with the research files.</p><a class="text-link" href="#wip/amaira/question-9">View the complete shape study</a></div>`;
}

export function renderWip(person = 'amaira', section = 'responses') {
  if (person !== 'amaira') return '<section class="error-view"><h1>Work not found.</h1><a class="text-link" href="#wip/amaira/responses">View Amaira’s work</a></section>';
  const question = /^question-(\d+)$/.exec(section);
  const selected = question ? 'responses' : section;
  const content = selected === 'colours' ? colours() : selected === 'patterns' ? patterns() : question ? renderAssignment('amaira', question[1]) : renderAssignment();
  return `<nav class="wip-people" aria-label="WIP contributors"><a href="#wip/amaira/responses" aria-current="page">Amaira</a></nav>
    <nav class="wip-tabs" aria-label="Amaira’s work">${[['responses','Responses'],['colours','Colours'],['patterns','Patterns']].map(([id,label])=>`<a href="#wip/amaira/${id}" ${id===selected?'aria-current="page"':''}>${label}</a>`).join('')}</nav>${content}`;
}

document.addEventListener('click', async event => {
  const button = event.target.closest('[data-copy-colour]');
  if (!button) return;
  const status = document.getElementById('status');
  try { await navigator.clipboard.writeText(button.dataset.copyColour); status.textContent = `${button.dataset.copyColour} copied.`; }
  catch { status.textContent = `Colour: ${button.dataset.copyColour}`; }
  setTimeout(() => { status.textContent = ''; }, 3000);
});
