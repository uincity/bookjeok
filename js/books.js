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
  { no: 15, date: '2026.09.30.', title: '존중받지 못하는 자들을 위한 정치학', author: '프랜시스 후쿠야마', host: 'P.E.J', cover: 'images/book-15.jpg', source: 'https://www.aladin.co.kr/shop/wproduct.aspx?ItemId=237694997' },
  { no: 16, date: '2026.10.28.', title: '다섯 개의 초대장', author: '프랭크 오스타세스키', host: 'J.M.C', cover: 'images/book-16.jpg', source: 'https://www.aladin.co.kr/shop/wproduct.aspx?ItemId=235784926', upcoming: true }
];
