# Technical Requirements Document (TRD)

## 1. 기술 스택
* **Frontend:** Phaser 3 (Game Engine)
* **Voice Library:** Web Speech API (SpeechRecognition)
* **Deployment:** GitHub Pages

## 2. 주요 기능 요구사항
* **실시간 음성 분석:** 마이크 입력을 지속적으로 리스닝하며 "점프", "공격" 키워드 추출.
* **물리 엔진:** 캐릭터의 중력, 장애물과의 충돌 판정, 투사체 궤적 계산.
* **무한 횡스크롤:** 배경과 장애물이 왼쪽으로 지속 이동하며 난이도에 따라 속도 증가.

## 3. 비기능 요구사항
* **지연 시간(Latency):** 음성 인식 후 액션 실행까지 최대 500ms 이내 처리.
* **브라우저 호환성:** Chrome, Edge 등 Web Speech API를 지원하는 최신 브라우저 타겟.