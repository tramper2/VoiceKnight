# 🎤 Voice Knight (보이스 나이트)

음성으로 제어하는 웹 기반 횡스크롤 액션 게임입니다. 사용자의 목소리를 실시간으로 분석하여 캐릭터를 조작하며 장애물을 피하고 적을 물리치는 새로운 경험을 제공합니다.

![Game Screen](https://via.placeholder.com/800x450.png?text=Voice+Knight+Gameplay+Preview)

## 🎮 게임 플레이 (Live Demo)
**[여기를 클릭하여 바로 플레이해보세요!](https://tramper2.github.io/VoiceKnight/)**

## ✨ 주요 기능
- **실시간 음성 인식**: Web Speech API를 활용하여 "점프", "공격" 등의 한국어 명령어를 즉각적으로 인식합니다.
- **물리 엔진 기반 액션**: Phaser 3 게임 엔진을 사용하여 부드러운 캐릭터 움직임과 물리 충돌을 구현했습니다.
- **무한 횡스크롤**: 시간이 지날수록 점수가 쌓이며, 일정한 속도로 다가오는 장애물을 피해야 합니다.
- **자동 배포**: GitHub Actions를 통해 `main` 브랜치 푸시 시 자동으로 최신 버전이 배포됩니다.

## ⌨️ 조작 방법
이 게임은 마이크 입력을 권장하지만, 테스트를 위한 키보드 조작도 지원합니다.

| 액션 | 음성 명령어 | 키보드 |
| :--- | :--- | :--- |
| **점프** | "점프", "뛰어", "jump" | `Space` / `↑` |
| **공격** | "공격", "발사", "빵", "attack" | `X` |

> **주의**: 크롬(Chrome)이나 엣지(Edge)와 같이 Web Speech API를 지원하는 브라우저에서 마이크 권한을 허용해야 음성 플레이가 가능합니다.

## 🛠 기술 스택
- **Game Engine**: Phaser 3
- **Language**: JavaScript (ES6+)
- **API**: Web Speech API (SpeechRecognition)
- **Deployment**: GitHub Pages & Actions

## 📂 프로젝트 구조
- `source/`: 게임 엔진 로직, 그래픽 데이터 및 유틸리티 포함
- `Doc/`: 기획서(PRD), 기술 설계서(TRD) 등 문서 파일
- `.github/`: 자동 배포를 위한 CI/CD 워크플로우

## 🚀 로컬 실행 방법
1. 저장소를 클론합니다.
   ```bash
   git clone git@github.com:tramper2/VoiceKnight.git
   ```
2. `source` 폴더에서 로컬 서버를 실행합니다. (예: Python 사용 시)
   ```bash
   cd source
   python3 -m http.server 8080
   ```
3. 브라우저에서 `localhost:8080`에 접속합니다.

---
Developed by Antigravity (Advanced Agentic Coding Assistant)
