// 독서모임 기록: 새 모임을 추가할 때 아래 배열에 책 정보를 한 항목 더 넣으면 됩니다.
const books = [
  { no: 1, date: '2025.07.16.', title: '어떻게 죽을 것인가', author: '아툴 가완디', host: 'J.M.C', cover: 'images/book-01.jpg', source: 'https://www.aladin.co.kr/shop/wproduct.aspx?ItemId=59964079' },
  { no: 2, date: '2025.08.20.', title: '곰스크로 가는 기차', author: '프리츠 오르트만', host: 'P.M.S', cover: 'images/book-02.jpg', source: 'https://www.aladin.co.kr/shop/wproduct.aspx?ItemId=173768726' },
  { no: 3, date: '2025.09.24.', title: '종이동물원', author: '켄 리우', host: 'K.I.H', cover: 'images/book-03.jpg', source: 'https://goldenbough.minumsa.com/book/2641/' },
  { no: 4, date: '2025.10.29.', title: '그녀를 지키다', author: '장바티스트 앙드레아', host: 'P.E.J', cover: 'images/book-04.jpg', source: 'https://www.yes24.com/product/goods/143753016' },
  { no: 5, date: '2025.12.10.', title: '넥서스', author: '유발 노아 하라리', host: 'K.B.N.R', cover: 'images/book-05.jpg', source: 'https://www.aladin.co.kr/shop/wproduct.aspx?ItemId=349172323' },
  { no: 6, date: '2025.12.30.', title: '고맙습니다', author: '올리버 색스', host: 'J.D.S', cover: 'images/book-06.jpg', source: 'https://www.aladin.co.kr/shop/wproduct.aspx?ItemId=84012438' },
  { no: 7, date: '2026.01.21.', title: '불안', author: '알랭 드 보통', host: 'H.B.R', cover: 'images/book-07.jpg', source: 'https://www.aladin.co.kr/shop/wproduct.aspx?ItemId=248825061' },
  { no: 8, date: '2026.02.25.', title: 'I의 비극', author: '요네자와 호노부', host: 'M.J.H', cover: 'images/book-08.jpg', source: 'https://www.aladin.co.kr/shop/wproduct.aspx?ItemId=336431851' },
  { no: 9, date: '2026.03.25.', title: '이병한의 아메리카 탐문', author: '이병한', host: 'J.M.C', cover: 'images/book-09.jpg', source: 'https://www.yes24.com/product/goods/149659712' },
  { no: 10, date: '2026.04.22.', title: '인간은 무엇으로 사는가', author: '레프 톨스토이', host: 'P.M.S', cover: 'images/book-10.jpg', source: 'https://minumsa.minumsa.com/book/35430/', note: '표지 이미지는 「사람은 무엇으로 사는가」 판본입니다. 모임 기록의 제목은 제공해주신 내용 그대로 표기했습니다.' },
  { no: 11, date: '2026.05.20.', title: '대온실 수리 보고서', author: '김금희', host: 'P.E.J', cover: 'images/book-11.jpg', source: 'https://www.changbi.com/BookDetail?bookid=4442' },
  { no: 12, date: '2026.06.18.', title: '설자은, 금성으로 돌아오다', author: '정세랑', host: 'J.D.S', cover: 'images/book-12.jpg', source: 'https://www.aladin.co.kr/shop/wproduct.aspx?ItemId=326492603' },
  { no: 13, date: '2026.07.22.', title: '인어 사냥', author: '차인표', host: 'K.B.N.R', cover: 'images/book-13.jpg', source: 'https://www.aladin.co.kr/shop/wproduct.aspx?ItemId=302751355' },
  { no: 14, date: '2026.08.26.', title: '프로젝트 헤일메리', author: '앤디 위어', host: 'P.C.S', cover: 'images/book-14.jpg', source: 'https://www.aladin.co.kr/shop/wproduct.aspx?ItemId=271229410' },
  { no: 15, date: '2026.09.30.', title: '존중받지 못하는 자들을 위한 정치학', author: '프랜시스 후쿠야마', host: 'P.E.J', cover: 'images/book-15.jpg', source: 'https://www.aladin.co.kr/shop/wproduct.aspx?ItemId=237694997', upcoming: true }
];

const grid = document.querySelector('#book-grid');
const resultCount = document.querySelector('#result-count');
const emptyState = document.querySelector('#empty-state');
const searchInput = document.querySelector('#book-search');
const sortButton = document.querySelector('#sort-button');
const dialog = document.querySelector('#book-dialog');
const yearFilters = document.querySelector('#year-filters');
const upcomingFeature = document.querySelector('#upcoming-feature');
const upcomingEmpty = document.querySelector('#upcoming-empty');
let selectedYear = 'all';
let newestFirst = true;
let currentDay = '';
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

function cardMarkup(book) {
  const number = String(book.no).padStart(2, '0');
  return `<article class="book-card">
    <button class="book-cover-button" type="button" data-book="${book.no}" aria-label="${escapeHTML(book.title)} 자세히 보기" style="background:${coverColors[(book.no - 1) % coverColors.length]}">
      <span class="card-index">NO. ${number}</span><img src="${book.cover}" alt="${escapeHTML(book.title)} 책 표지" loading="lazy" width="500" height="740"><span class="card-arrow" aria-hidden="true">↗</span>
    </button>
    <p class="book-meta">${book.date} <span>·</span> VOL. ${number}</p>
    <button class="book-title" type="button" data-book="${book.no}">${escapeHTML(book.title)}</button>
    <p class="book-author">${escapeHTML(book.author)} 지음</p>
    <div class="book-card-footer"><span>이야기를 이끈 사람</span><strong>${escapeHTML(book.host)}</strong></div>
  </article>`;
}

function renderBooks() {
  const term = searchInput.value.trim().toLocaleLowerCase();
  const matching = completedBooks().filter(book => (selectedYear === 'all' || book.date.startsWith(selectedYear)) && [book.title, book.author, book.host].some(value => value.toLocaleLowerCase().includes(term)));
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
  document.querySelector('#dialog-content').innerHTML = `<div class="dialog-layout">
    <div class="dialog-image"><img src="${book.cover}" alt="${escapeHTML(book.title)} 책 표지" width="500" height="740"></div>
    <div class="dialog-info"><span class="dialog-kicker">BOOKJEOK BOOKJEOK · VOL. ${number}${isUpcoming ? ' · NEXT READ' : ''}</span>
      <h2 id="dialog-title">${escapeHTML(book.title)}</h2><p class="dialog-author">${escapeHTML(book.author)} 지음</p>
      <dl><div><dt>모임 날짜</dt><dd>${book.date}${isUpcoming ? ' (예정)' : ''}</dd></div><div><dt>발제자 · 진행자</dt><dd>${escapeHTML(book.host)}</dd></div><div><dt>모임 순번</dt><dd>${number}번째 책</dd></div></dl>
      ${book.note ? `<p class="dialog-note">${escapeHTML(book.note)}</p>` : ''}
      <a class="dialog-source" href="${book.source}" target="_blank" rel="noopener noreferrer">책 정보 보러 가기 <span aria-hidden="true">↗</span></a>
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
sortButton.addEventListener('click', () => {
  newestFirst = !newestFirst;
  sortButton.innerHTML = `${newestFirst ? '최신순' : '오래된순'} <span aria-hidden="true">${newestFirst ? '↓' : '↑'}</span>`;
  sortButton.setAttribute('aria-label', `현재 ${newestFirst ? '최신순' : '오래된순'}, 클릭하여 정렬 변경`);
  renderBooks();
});
document.querySelector('#reset-button').addEventListener('click', () => {
  searchInput.value = '';
  document.querySelector('[data-year="all"]').click();
});
document.addEventListener('click', event => {
  const trigger = event.target.closest('[data-book]');
  if (trigger) openBook(Number(trigger.dataset.book));
});
dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
updateSchedule();
setInterval(() => { if (seoulDayKey() !== currentDay) updateSchedule(); }, 60_000);
