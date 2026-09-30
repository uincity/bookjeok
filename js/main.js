// Book records are loaded from js/books.js before this script.
const grid = document.querySelector('#book-grid');
const resultCount = document.querySelector('#result-count');
const emptyState = document.querySelector('#empty-state');
const searchInput = document.querySelector('#book-search');
const sortButton = document.querySelector('#sort-button');
const dialog = document.querySelector('#book-dialog');
const yearFilters = document.querySelector('#year-filters');
const upcomingFeature = document.querySelector('#upcoming-feature');
const upcomingEmpty = document.querySelector('#upcoming-empty');
const discussionOnly = document.querySelector('#discussion-only');
const journalContent = document.querySelector('#journal-content');
let selectedYear = 'all';
let newestFirst = true;
let currentDay = '';
let discussionByBook = new Map();
const coverColors = ['#e5e7de','#e9e3d7','#e0e5dc','#e9e0d9','#e4e2d8','#dedfd6','#e9e1d6','#e2e3db'];

function dateKey(book) {
  return book.date.slice(0, 10).replaceAll('.', '-');
}

function seoulDayKey() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(new Date());
  const value = type => parts.find(part => part.type === type).value;
  return `${value('year')}-${value('month')}-${value('day')}`;
}

function weekday(book) {
  return new Date(`${dateKey(book)}T12:00:00Z`)
    .toLocaleDateString('en-US', { timeZone: 'UTC', weekday: 'long' }).toUpperCase();
}

function completedBooks() {
  return books.filter(book => !book.upcoming);
}

function renderYearFilters() {
  const completed = completedBooks();
  const years = [...new Set(completed.map(book => book.date.slice(0, 4)))].sort().reverse();
  if (selectedYear !== 'all' && !years.includes(selectedYear)) selectedYear = 'all';
  yearFilters.innerHTML = ['all', ...years].map(year => {
    const active = year === selectedYear;
    const label = year === 'all' ? `전체 <span>${completed.length}</span>` : year;
    return `<button type="button" class="filter-button${active ? ' active' : ''}" data-year="${year}" aria-pressed="${active}">${label}</button>`;
  }).join('');
}

function updateSchedule() {
  currentDay = seoulDayKey();
  const nextBook = books.filter(book => book.upcoming && dateKey(book) >= currentDay)
    .sort((a, b) => dateKey(a).localeCompare(dateKey(b)))[0];
  const pendingBook = books.filter(book => book.upcoming && dateKey(book) < currentDay)
    .sort((a, b) => dateKey(b).localeCompare(dateKey(a)))[0];

  document.querySelector('#selected-count').textContent = books.length;
  document.querySelector('#completed-count').textContent = completedBooks().length;
  document.querySelector('#issue-number').textContent = String(Math.max(...books.map(book => book.no))).padStart(3, '0');
  document.querySelector('#hero-issue-number').textContent = document.querySelector('#issue-number').textContent;
  document.querySelector('#copyright-year').textContent = currentDay.slice(0, 4);
  upcomingFeature.hidden = !nextBook;
  upcomingEmpty.hidden = Boolean(nextBook);

  if (nextBook) {
    const number = String(nextBook.no).padStart(2, '0');
    document.querySelector('#upcoming-title').innerHTML = '다음 장을 펼칠 시간<span class="heading-mark" aria-hidden="true">✳</span>';
    document.querySelector('#upcoming-intro').textContent = '이번에는 어떤 이야기가 기다리고 있을까요?';
    upcomingFeature.querySelector('.feature-kicker').innerHTML = `<span class="live-dot"></span> NEXT READ · ${nextBook.no}번째 모임`;
    upcomingFeature.querySelector('.feature-date').innerHTML = `${nextBook.date} <span>${weekday(nextBook)}</span>`;
    upcomingFeature.querySelector('h3').textContent = nextBook.title;
    upcomingFeature.querySelector('.feature-author').innerHTML = `${escapeHTML(nextBook.author)} <span>지음</span>`;
    upcomingFeature.querySelector('.feature-meta strong').textContent = nextBook.host;
    upcomingFeature.querySelector('.feature-button').dataset.book = nextBook.no;
    upcomingFeature.querySelector('img').src = nextBook.cover;
    upcomingFeature.querySelector('img').alt = `『${nextBook.title}』 책 표지`;
    upcomingFeature.querySelector('.feature-visual-caption').innerHTML = `BOOKJEOK BOOKJEOK<br>READING CLUB VOL. ${number}`;
  } else {
    document.querySelector('#upcoming-title').innerHTML = '다음 장을 고르는 시간<span class="heading-mark" aria-hidden="true">✳</span>';
    document.querySelector('#upcoming-intro').textContent = '새 일정이 정해지면 이곳에서 소개합니다.';
    document.querySelector('#upcoming-empty-title').textContent = pendingBook ? '예정일이 지난 책의 기록을 기다립니다.' : '다음 모임을 준비 중입니다.';
    document.querySelector('#upcoming-empty-description').textContent = pendingBook
      ? `${pendingBook.date} 모임 예정일이 지났습니다. 진행 여부가 확인되면 책장에 기록할게요.`
      : '새 일정이 정해지면 이곳에서 소개할게요.';
  }
  renderYearFilters();
  renderBooks();
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

function discussionHref(discussion) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(discussion.slug)
    ? `journal/${discussion.slug}/index.html` : null;
}

function discussionPdfHref(discussion) {
  const pdf = discussion.pdf;
  return pdf?.status === 'available' && /^assets\/discussions\/[a-z0-9-]+\.pdf$/.test(pdf.path)
    ? pdf.path : null;
}

function discussionSearchText(discussion) {
  if (!discussion) return '';
  return [discussion.editorialTitle, discussion.keyQuestion, discussion.intro,
    ...discussion.tags, ...discussion.summary,
    ...discussion.questions.flatMap(question => [question.title, question.body]),
    ...discussion.differentViews.flatMap(view => [view.speaker, view.body]),
    ...discussion.sideStories.flatMap(story => [story.title, story.body]),
    ...discussion.remainingQuestions, discussion.nextBookTransition]
    .join(' ').toLocaleLowerCase();
}

function renderJournal() {
  const published = [...discussionByBook.values()].sort((a, b) => b.meetingDate.localeCompare(a.meetingDate));
  document.querySelector('#journal-count').textContent = `공개된 대화 기록 ${published.length}건`;
  if (!published.length) {
    journalContent.innerHTML = '<p class="journal-loading">공개된 대화 기록이 아직 없습니다.</p>';
    return;
  }
  const latest = published[0];
  const book = books.find(item => item.no === latest.meetingNo);
  const href = discussionHref(latest);
  journalContent.innerHTML = `<article class="journal-feature">
    <div class="journal-feature-copy"><span class="editorial-kicker">VOL. ${String(latest.meetingNo).padStart(2, '0')} · ${escapeHTML(latest.meetingDate)} · ${escapeHTML(book.title)}</span>
      <h3>${escapeHTML(latest.editorialTitle)}</h3><p>${escapeHTML(latest.intro)}</p>
      <div class="journal-tags" aria-label="대화 주제">${latest.tags.map(tag => `<span>${escapeHTML(tag)}</span>`).join('')}</div>
      <a class="journal-read-link" href="${href}">그날의 대화 읽기 <span aria-hidden="true">→</span></a>
    </div>
    <div class="journal-feature-art"><img src="${escapeHTML(book.cover)}" alt="${escapeHTML(book.title)} 책 표지" width="500" height="741" loading="lazy">
      <p>${escapeHTML(latest.keyQuestion)}</p><span>BOOKJEOK BOOKJEOK · READING JOURNAL</span>
    </div>
  </article>${published.length > 1 ? `<div class="journal-more">${published.slice(1, 3).map(discussion => {
    const linkedBook = books.find(item => item.no === discussion.meetingNo);
    return `<article><span>${escapeHTML(discussion.meetingDate)} · ${escapeHTML(linkedBook.title)}</span><h3>${escapeHTML(discussion.editorialTitle)}</h3><a href="${discussionHref(discussion)}">대화 기록 읽기 →</a></article>`;
  }).join('')}</div>` : ''}`;
}

async function loadDiscussions() {
  try {
    const response = await fetch('data/discussions.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const records = await response.json();
    discussionByBook = new Map(records.filter(record => record.status === 'published'
      && discussionHref(record) && books.some(book => book.no === record.meetingNo))
      .map(record => [record.meetingNo, record]));
    renderJournal();
    renderBooks();
  } catch (error) {
    document.querySelector('#journal-count').textContent = '대화 기록을 불러오지 못했습니다.';
    journalContent.innerHTML = '<p class="journal-loading">대화 기록을 불러오지 못했습니다. 잠시 후 다시 확인해 주세요.</p>';
    console.warn('Discussion records unavailable:', error);
  }
}

function cardMarkup(book) {
  const number = String(book.no).padStart(2, '0');
  const discussion = discussionByBook.get(book.no);
  return `<article class="book-card">
    <button class="book-cover-button" type="button" data-book="${book.no}" aria-label="${escapeHTML(book.title)} 자세히 보기" style="background:${coverColors[(book.no - 1) % coverColors.length]}">
      <span class="card-index">NO. ${number}</span>${discussion ? '<span class="card-discussion-badge">대화 기록</span>' : ''}<img src="${escapeHTML(book.cover)}" alt="${escapeHTML(book.title)} 책 표지" loading="lazy" width="500" height="740"><span class="card-arrow" aria-hidden="true">↗</span>
    </button>
    <p class="book-meta">${book.date} <span>·</span> VOL. ${number}</p>
    <button class="book-title" type="button" data-book="${book.no}">${escapeHTML(book.title)}</button>
    <p class="book-author">${escapeHTML(book.author)} 지음</p>
    ${discussion ? `<p class="book-discussion-question">${escapeHTML(discussion.keyQuestion)}</p><a class="book-discussion-link" href="${discussionHref(discussion)}">대화 기록 읽기 <span aria-hidden="true">→</span></a>` : ''}
    <div class="book-card-footer"><span>이야기를 이끈 사람</span><strong>${escapeHTML(book.host)}</strong></div>
  </article>`;
}

function renderBooks() {
  const term = searchInput.value.trim().toLocaleLowerCase();
  const matching = completedBooks().filter(book =>
    (selectedYear === 'all' || book.date.startsWith(selectedYear))
    && (!discussionOnly.checked || discussionByBook.has(book.no))
    && (!term || [book.title, book.author, book.host].some(value => value.toLocaleLowerCase().includes(term))
      || discussionSearchText(discussionByBook.get(book.no)).includes(term)));
  matching.sort((a, b) => newestFirst ? b.no - a.no : a.no - b.no);
  grid.innerHTML = matching.map(cardMarkup).join('');
  resultCount.textContent = `${matching.length}권의 책`;
  emptyState.hidden = matching.length !== 0;
}

function openBook(no) {
  const book = books.find(item => item.no === no);
  if (!book) return;
  const number = String(book.no).padStart(2, '0');
  const isUpcoming = book.upcoming && dateKey(book) >= seoulDayKey();
  const discussion = discussionByBook.get(book.no);
  const pdfHref = discussion && discussionPdfHref(discussion);
  document.querySelector('#dialog-content').innerHTML = `<div class="dialog-layout">
    <div class="dialog-image"><img src="${escapeHTML(book.cover)}" alt="${escapeHTML(book.title)} 책 표지" width="500" height="740"></div>
    <div class="dialog-info"><span class="dialog-kicker">BOOKJEOK BOOKJEOK · VOL. ${number}${isUpcoming ? ' · NEXT READ' : ''}</span>
      <h2 id="dialog-title">${escapeHTML(book.title)}</h2><p class="dialog-author">${escapeHTML(book.author)} 지음</p>
      <dl><div><dt>모임 날짜</dt><dd>${book.date}${isUpcoming ? ' (예정)' : ''}</dd></div><div><dt>발제자 · 진행자</dt><dd>${escapeHTML(book.host)}</dd></div><div><dt>모임 순번</dt><dd>${number}번째 책</dd></div></dl>
      ${book.note ? `<p class="dialog-note">${escapeHTML(book.note)}</p>` : ''}
      ${discussion ? `<div class="dialog-discussion"><span>그날의 대화</span><p>${escapeHTML(discussion.intro)}</p><a class="dialog-discussion-primary" href="${discussionHref(discussion)}">그날의 대화 읽기 →</a>${pdfHref ? `<a class="dialog-discussion-pdf" href="${pdfHref}" target="_blank" rel="noopener noreferrer" aria-label="전체 기록 PDF 새 탭에서 열기">전체 기록 PDF ↗ <span>새 탭</span></a>` : ''}</div>` : ''}
      <a class="dialog-source" href="${escapeHTML(book.source)}" target="_blank" rel="noopener noreferrer">책 정보 보러 가기 <span aria-hidden="true">↗</span></a>
    </div></div>`;
  dialog.showModal();
}

yearFilters.addEventListener('click', event => {
  const button = event.target.closest('.filter-button');
  if (!button) return;
  selectedYear = button.dataset.year;
  renderYearFilters();
  renderBooks();
});
searchInput.addEventListener('input', renderBooks);
discussionOnly.addEventListener('change', renderBooks);
sortButton.addEventListener('click', () => {
  newestFirst = !newestFirst;
  sortButton.innerHTML = `${newestFirst ? '최신순' : '오래된순'} <span aria-hidden="true">${newestFirst ? '↓' : '↑'}</span>`;
  sortButton.setAttribute('aria-label', `현재 ${newestFirst ? '최신순' : '오래된순'}, 클릭하여 정렬 변경`);
  renderBooks();
});
document.querySelector('#reset-button').addEventListener('click', () => {
  searchInput.value = '';
  discussionOnly.checked = false;
  document.querySelector('[data-year="all"]').click();
});
document.addEventListener('click', event => {
  const trigger = event.target.closest('[data-book]');
  if (trigger) openBook(Number(trigger.dataset.book));
});
dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
updateSchedule();
loadDiscussions().finally(() => {
  const requestedBook = Number(new URLSearchParams(location.search).get('book'));
  if (Number.isSafeInteger(requestedBook) && books.some(book => book.no === requestedBook)) openBook(requestedBook);
});
setInterval(() => { if (seoulDayKey() !== currentDay) updateSchedule(); }, 60_000);
