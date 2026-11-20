import {assignment} from './assignment-responses.js';

const esc = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const dateLabel = value => new Intl.DateTimeFormat('en-GB', {day:'numeric', month:'long', year:'numeric', timeZone:'Asia/Kolkata'}).format(new Date(value));
const route = (response, item) => `#wip/${response.id}/question-${item.number}`;
const ranking = text => `<ol class="assignment-ranking">${text.split('\n').filter(Boolean).map(line => `<li>${esc(line.replace(/^\d+\.\s*/, ''))}</li>`).join('')}</ol>`;

function entry(response, item) {
  const file = item.files[0];
  return `<article class="assignment-entry">
    <a class="assignment-preview" href="${route(response, item)}" aria-label="View question ${item.number}: ${esc(item.title)}">
      ${file ? `<img src="${file.preview}" alt="${esc(file.alt)}" width="${file.previewWidth}" height="${file.previewHeight}" loading="lazy" decoding="async">` : item.text ? ranking(item.text) : '<p class="assignment-empty">No response submitted.</p>'}
    </a>
    <h2><a href="${route(response, item)}">${item.number}. ${esc(item.title)}</a></h2>
    <div class="assignment-entry-meta"><span>${file ? 'Image response' : item.text ? 'Written response' : 'Unanswered'}</span><a href="${route(response, item)}">View response</a></div>
  </article>`;
}

function overview() {
  return `<div class="intro assignment-intro"><h1>Amaira’s<br>responses.</h1><p>${assignment.responseCount} submission · ${dateLabel(assignment.responses[0].date)}<br>Imported ${dateLabel(assignment.importedAt)}</p></div>
    ${assignment.responses.map(response => {
      const images = response.items.reduce((total, item) => total + item.files.length, 0);
      const answered = response.items.filter(item => item.text || item.files.length).length;
      return `<section aria-labelledby="submission-${response.id}">
        <div class="assignment-submission"><h2 id="submission-${response.id}">Creative assignment</h2><p>${images} images · ${answered} of ${response.items.length} questions answered</p></div>
        <div class="assignment-grid">${response.items.map(item => entry(response, item)).join('')}</div>
      </section>`;
    }).join('')}
    <div class="section-end"><p class="note-line">Submitted artwork and written answers, kept with the original questions. Open a response to read the full prompt or download its image.</p><a class="text-link" href="assignment-responses.json" download="creative-assignment-responses.json">Download all responses</a></div>`;
}

function detail(response, item) {
  const files = item.files;
  const previous = response.items[item.number - 2];
  const next = response.items[item.number];
  return `<div class="assignment-detail">
    <div class="assignment-wayfinding"><a class="text-link" href="#wip/amaira/responses">All responses</a><span>${esc(response.name)} · ${dateLabel(response.date)} · Question ${item.number} of ${response.items.length}</span></div>
    <h1>${esc(item.title)}</h1>
    <div class="assignment-detail-layout">
      <div class="assignment-artwork">${files.length ? files.map(file => `<figure><a href="${file.original}" target="_blank" rel="noopener" aria-label="Open full-size image for ${esc(item.title)}"><img src="${file.original}" alt="${esc(file.alt)}" width="${file.width}" height="${file.height}" decoding="async" fetchpriority="high"></a><figcaption>${esc(file.name)}</figcaption></figure>`).join('') : item.text ? `<div class="assignment-text-art">${ranking(item.text)}</div>` : '<div class="assignment-text-art"><p class="assignment-empty">No response submitted.</p></div>'}</div>
      <section class="assignment-question" aria-labelledby="assignment-question-title">
        <h2 id="assignment-question-title">The question</h2><p>${esc(item.prompt)}</p>
        <div class="assignment-answer"><h2>The response</h2>${item.text ? `<p class="assignment-written">${esc(item.text)}</p>${item.number === 11 ? '<p class="note-line">No explanation was supplied for the first choice.</p>' : ''}` : files.length ? '<p>Submitted as an image.</p>' : '<p>No written answer or attachment was submitted.</p>'}</div>
        ${files.map(file => `<div class="assignment-file-actions"><a class="text-link" href="${file.original}" target="_blank" rel="noopener">View full-size image</a><a class="text-link" href="${file.original}" download="${esc(file.name)}">Download submitted file</a></div>`).join('')}
      </section>
    </div>
    <nav class="assignment-pagination" aria-label="Assignment questions">${previous ? `<a href="${route(response, previous)}">Previous: ${esc(previous.title)}</a>` : '<span></span>'}${next ? `<a href="${route(response, next)}">Next: ${esc(next.title)}</a>` : '<a href="#wip/amaira/responses">Back to all responses</a>'}</nav>
  </div>`;
}

export function renderAssignment(responseId, questionNumber) {
  if (!responseId && !questionNumber) return overview();
  const response = assignment.responses.find(item => item.id === responseId);
  const item = response?.items.find(item => String(item.number) === questionNumber);
  if (!response || !item) return '<section class="error-view"><h1>Response not found.</h1><p>Choose a question from the assignment.</p><a class="text-link" href="#wip/amaira/responses">View all responses</a></section>';
  return detail(response, item);
}
