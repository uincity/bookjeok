import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
import vm from 'node:vm';

const root = resolve(import.meta.dirname, '..');
const read = path => readFileSync(join(root, path), 'utf8');
const escapeHTML = value => String(value).replace(/[&<>"']/g, character =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const e = escapeHTML;
const books = vm.runInNewContext(`${read('js/books.js')}\nbooks`);
const records = JSON.parse(read('data/discussions.json'));
const published = records.filter(record => record.status === 'published')
  .sort((a, b) => a.meetingDate.localeCompare(b.meetingDate));

function localPdf(record) {
  const pdf = record.pdf;
  if (pdf?.status !== 'available') return null;
  if (!/^assets\/discussions\/[a-z0-9-]+\.pdf$/.test(pdf.path)) {
    throw new Error(`Invalid PDF path for meeting ${record.meetingNo}`);
  }
  const file = join(root, pdf.path);
  if (!existsSync(file)) throw new Error(`PDF not found: ${pdf.path}`);
  const bytes = readFileSync(file);
  if (bytes.length !== pdf.sizeBytes || createHash('sha256').update(bytes).digest('hex') !== pdf.sha256) {
    throw new Error(`PDF size or hash changed: ${pdf.path}`);
  }
  if (!Number.isInteger(pdf.pageCount) || pdf.pageCount < 1) throw new Error('PDF page count is missing');
  return pdf;
}

function render(record, index) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(record.slug)) throw new Error('Invalid slug');
  const book = books.find(item => item.no === record.meetingNo);
  if (!book) throw new Error(`No book for meeting ${record.meetingNo}`);
  if (!/^images\/book-\d{2}\.jpg$/.test(book.cover)) throw new Error('Invalid cover path');
  const nextBook = record.nextBookNo == null ? null : books.find(item => item.no === record.nextBookNo);
  if (record.nextBookNo != null && !nextBook) throw new Error(`No next book for meeting ${record.meetingNo}`);
  const pdf = localPdf(record);
  const canonical = `https://uincity.github.io/bookjeok/journal/${record.slug}/index.html`;
  const pageTitle = `${record.editorialTitle} | 북적북적 ${record.meetingNo}번째 대화`;
  const pageDate = record.meetingDate.replaceAll('-', '.');
  const adjacent = [published[index - 1], published[index + 1]].filter(Boolean);

  const questions = record.questions.map((question, position) => {
    if (!/^[a-z0-9-]+$/.test(question.id)) throw new Error(`Invalid question id: ${question.id}`);
    return `<section class="journal-question" id="${question.id}">
      <span class="journal-question-number">QUESTION ${String(position + 1).padStart(2, '0')}</span>
      <h3>${e(question.title)}</h3><p>${e(question.body)}</p>
    </section>`;
  }).join('\n');

  const sourceNotes = record.questions.map(question =>
    `<li>${e(question.title)} — ${question.sourceSections.map(section => `${Number(section)}절`).join('·')}</li>`).join('');
  const views = record.differentViews.map(view =>
    `<div class="view-card"><span>${e(view.speaker)}</span><p>${e(view.body)}</p></div>`).join('');
  const sideStories = record.sideStories.map(story =>
    `<article><h3>${e(story.title)}</h3><p>${e(story.body)}</p></article>`).join('');
  const tags = record.tags.map(tag => `<span>${e(tag)}</span>`).join('');
  const summary = record.summary.map((line, position) =>
    `<li><span>${String(position + 1).padStart(2, '0')}</span><p>${e(line)}</p></li>`).join('');
  const remaining = record.remainingQuestions.map(question => `<li>${e(question)}</li>`).join('');
  const pdfSection = pdf ? `<div class="journal-pdf-actions">
    <a href="../../${e(pdf.path)}" target="_blank" rel="noopener noreferrer">전체 모임후기 PDF 열기 <span>새 탭 ↗</span></a>
    <a href="../../${e(pdf.path)}" download="${e(pdf.path.split('/').at(-1))}">PDF 다운로드 <span aria-hidden="true">↓</span></a>
  </div><p class="pdf-meta">원본 ${pdf.pageCount}쪽 · ${Math.round(pdf.sizeBytes / 1024)}KB</p>`
    : '<p class="pdf-unavailable">원본 PDF는 아직 공개되지 않았습니다.</p>';
  const nextSection = nextBook ? `<section class="next-section" aria-labelledby="next-title"><span class="section-label">06 / THE NEXT BOOK</span><h2 id="next-title">다음 책으로 이어지는 대화</h2><p>${e(record.nextBookTransition)}</p><div class="next-book-row"><div><strong>${e(nextBook.title)}</strong><span>${e(nextBook.author)} · ${e(nextBook.date)} 예정 · 진행 ${e(nextBook.host)}</span></div><a href="../../index.html?book=${nextBook.no}">다음 책 살펴보기 <span aria-hidden="true">↗</span></a></div></section>` : '';
  const adjacentLinks = adjacent.length ? `<nav class="journal-adjacent" aria-label="다른 대화 기록">${adjacent.map(other =>
    `<a href="../${e(other.slug)}/index.html">${e(other.meetingNo)}번째 대화 · ${e(other.editorialTitle)} →</a>`).join('')}</nav>` : '';

  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#f4f1e9">
  <title>${e(pageTitle)}</title>
  <meta name="description" content="${e(record.intro)}">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${e(pageTitle)}">
  <meta property="og:description" content="${e(record.intro)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="https://uincity.github.io/bookjeok/${e(book.cover)}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Gowun+Batang:wght@400;700&family=IBM+Plex+Mono:wght@400;500;600&family=Noto+Sans+KR:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../../css/style.css">
  <link rel="stylesheet" href="../../css/journal.css">
</head>
<body>
  <header class="journal-site-header"><a class="brand" href="../../index.html"><span class="brand-symbol" aria-hidden="true">✳</span><span>북적북적<span class="brand-period">.</span></span></a><a href="../../index.html#journal">모든 대화 기록 <span aria-hidden="true">↗</span></a></header>
  <main>
    <article>
      <header class="journal-hero">
        <nav class="breadcrumbs" aria-label="현재 위치"><a href="../../index.html">북적북적</a><span aria-hidden="true">/</span><a href="../../index.html#journal">대화 기록</a><span aria-hidden="true">/</span><span>${record.meetingNo}번째 모임</span></nav>
        <div class="journal-hero-grid"><div class="journal-hero-copy"><span class="section-label">VOL. ${String(record.meetingNo).padStart(2, '0')} / READING CONVERSATION</span>
          <h1>${e(record.editorialTitle)}</h1><p class="journal-lead">${e(record.intro)}</p>
          <div class="journal-hero-meta"><span><time datetime="${e(record.meetingDate)}">${e(pageDate)}</time></span><span>${record.durationMinutes}분의 대화</span><span>진행 ${e(book.host)}</span></div>
          <div class="journal-tags" aria-label="대화 주제">${tags}</div>
        </div><div class="journal-hero-cover"><img src="../../${e(book.cover)}" alt="${e(book.title)} 책 표지" width="500" height="741"><span>THE BOOK WE SHARED · NO. ${String(book.no).padStart(2, '0')}</span></div></div>
      </header>
      <div class="journal-body">
        <section class="summary-section" aria-labelledby="summary-title"><span class="section-label">01 / THE CONVERSATION</span><h2 id="summary-title">그날의 대화, 세 줄로</h2><ol>${summary}</ol></section>
        <section class="questions-section" aria-labelledby="questions-title"><span class="section-label">02 / QUESTIONS WE SHARED</span><h2 id="questions-title">함께 나눈 질문</h2><p class="section-explainer">대화의 주제를 읽기 편하도록 질문형으로 정리했습니다.</p>${questions}
          <details class="source-details"><summary>질문의 기록 출처</summary><ol>${sourceNotes}</ol><p>그 밖의 재독 이야기는 2절, 책 밖의 이야기는 1·2절을 참고했습니다.</p></details>
        </section>
        <section class="views-section" aria-labelledby="views-title"><span class="section-label">03 / TWO WAYS OF READING</span><h2 id="views-title">서로 달랐던 생각</h2><p class="section-explainer">다시 읽을까, 새로운 책을 만날까?</p><div class="view-grid">${views}</div><p>${e(record.differentViewsClosing)}</p></section>
        <section class="side-section" aria-labelledby="side-title"><span class="section-label">04 / BEYOND THE BOOK</span><h2 id="side-title">책 밖으로 이어진 이야기</h2><div class="side-grid">${sideStories}</div></section>
        <section class="remaining-section" aria-labelledby="remaining-title"><span class="section-label">05 / QUESTIONS TO CARRY</span><h2 id="remaining-title">모임 뒤에 남은 질문</h2><p class="section-explainer">그날의 대화에서 이어 생각해 볼 질문입니다.</p><ul>${remaining}</ul></section>
        ${nextSection}
        <section class="pdf-section" aria-labelledby="pdf-title"><span class="section-label">07 / THE ORIGINAL RECORD</span><h2 id="pdf-title">전체 기록</h2><p>대화의 자세한 흐름은 원본 모임후기에서 확인할 수 있습니다.</p>${pdfSection}<p class="editorial-note">${e(record.editorialNote)}</p></section>
        ${adjacentLinks}
      </div>
    </article>
  </main>
  <footer class="journal-footer"><a class="brand" href="../../index.html"><span class="brand-symbol" aria-hidden="true">✳</span><span>북적북적<span class="brand-period">.</span></span></a><a href="../../index.html#journal">대화 기록으로 돌아가기 ↑</a></footer>
</body>
</html>
`;
}

for (const [index, record] of published.entries()) {
  const directory = join(root, 'journal', record.slug);
  mkdirSync(directory, { recursive: true });
  const output = join(directory, 'index.html');
  writeFileSync(output, render(record, index), 'utf8');
  console.log(`Built ${output}`);
}
