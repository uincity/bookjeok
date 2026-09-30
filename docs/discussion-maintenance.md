# 대화 기록 운영 방법

사이트는 GitHub Pages에서 `main` 브랜치의 저장소 루트를 게시합니다. 정적 상세 페이지는 `data/discussions.json`을 원본으로 하여 생성하고, 생성된 HTML도 커밋 대상에 포함합니다. 기존 책 목록과 다음 모임은 `js/books.js`에서 관리합니다.

## 다음 기록 추가

1. 실제 모임이 진행되었다면 `js/books.js`에서 해당 책의 `upcoming: true`를 제거합니다. 다음 책을 선정했다면 같은 파일에 새 책 정보와 표지 파일을 추가합니다. 진행자는 실명 대신 영문 이니셜로 입력합니다.
2. 모임후기 PDF를 `assets/discussions/bookjeok-016-2026-10-28.pdf`처럼 순번과 날짜를 포함한 이름으로 **원본 그대로 복사**합니다. 원본은 `doc/` 등에 보관하고 공개 저장소에 올리지 않습니다.
3. `data/discussions.json`에 기록 객체를 추가합니다. 아래 예시는 필드 구조만 보여 주는 초안이며, 내용을 채우기 전에는 `status: "draft"`로 둡니다. 초안도 공개 저장소에 커밋하면 파일을 읽을 수 있으므로, 공개 전에는 완성된 기록만 이 파일에 추가하세요.
4. 내용 검토가 끝나면 `status`를 `published`로 바꾸고 `node scripts/build-journal.mjs`를 실행합니다. 이 명령은 `journal/<slug>/index.html`을 생성합니다. 같은 데이터로 다시 실행해도 같은 페이지를 만듭니다.
5. 메인·상세·PDF 링크를 로컬에서 확인한 뒤 `js/books.js`, `data/discussions.json`, 새 표지, 공개 PDF, 생성된 상세 HTML을 함께 커밋합니다. `main`에 푸시하면 기존 GitHub Pages 배포 방식으로 게시됩니다.

```json
{
  "meetingNo": 16,
  "slug": "016-five-invitations",
  "status": "draft",
  "meetingDate": "2026-10-28",
  "durationMinutes": 0,
  "editorialTitle": "실제 기록을 확인한 뒤 작성",
  "keyQuestion": "실제 기록을 확인한 뒤 작성",
  "intro": "실제 기록을 확인한 뒤 작성",
  "tags": [],
  "summary": [],
  "questions": [],
  "differentViews": [],
  "differentViewsClosing": "",
  "differentViewsSourceSections": [],
  "sideStories": [],
  "sideStoriesSourceSections": [],
  "remainingQuestions": [],
  "nextBookNo": 17,
  "nextBookTransition": "",
  "pdf": {
    "status": "missing",
    "path": null,
    "originalFilename": "북적북적 16번째 모임후기.pdf"
  },
  "editorialNote": "이 글은 모임 후기를 바탕으로 대화의 흐름을 정리한 요약입니다. 질문 제목은 편집 과정에서 재구성했으며, 참석자의 해석과 의견을 담고 있습니다."
}
```

`nextBookNo`는 그 모임에서 선정된 다음 책의 번호입니다. 선정된 책이 아직 없으면 `null`로 두세요. 과거 기록의 연결은 메인 화면의 현재 다음 모임이 바뀌어도 그대로 유지됩니다.

PDF를 아직 받지 못했다면 `pdf.status`는 `missing`, `pdf.path`는 `null`로 두세요. PDF를 받으면 파일을 위 경로에 복사하고 `status`를 `available`로 바꾼 뒤 `path`, 실제 `sizeBytes`, `pageCount`, SHA-256 `sha256`을 입력합니다. `node scripts/build-journal.mjs`는 PDF가 있다고 표시된 경우 파일과 용량·해시를 확인하며, 값이 다르면 생성을 중단합니다. PDF가 없으면 링크를 만들지 않습니다.

## 로컬 미리보기

프로젝트 루트에서 `python -m http.server 8000`을 실행한 뒤 `http://localhost:8000/`과 `http://localhost:8000/journal/015-identity/index.html`을 엽니다. 메인 화면은 `fetch()`로 대화 데이터를 읽으므로 `file://`로 직접 열지 말고 로컬 서버를 사용하세요. 로컬 서버는 미리보기용이며 배포에는 필요하지 않습니다.

웹 요약은 모임 후기에서 확인된 주제와 의견만 담으세요. 편집한 질문 제목을 발언의 직접 인용처럼 표시하거나, 참석자 의견을 검증된 사회 사실로 단정하지 마세요. 발언자 이니셜도 원문에 있을 때만 붙입니다.
