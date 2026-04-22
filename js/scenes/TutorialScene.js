import { VoiceCommand } from '../utils/VoiceCommand.js';

export class TutorialScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TutorialScene' });
        this.voiceCommand = null;
        this.step = 0;
        this.jumpCompleted = false;
        this.attackCompleted = false;
        this.startButton = null;
        this.startButtonText = null;
        this.sceneActive = true;
    }

    create() {
        const { width, height } = this.cameras.main;

        // 배경
        this.add.rectangle(0, 0, width, height, 0x1a1a2e).setOrigin(0);

        // 음성 인식 초기화
        this.voiceCommand = new VoiceCommand();
        this.voiceCommand.init();
        this.voiceCommand.start();
        this.voiceCommand.setCommandCallback(this.handleVoiceCommand.bind(this));

        // 마이크 상태 표시
        this.micIcon = this.add.circle(width / 2, 60, 20, 0xff6b6b);
        this.micStatus = this.add.text(width / 2, 100, '마이크 준비중...', {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#a0aec0'
        }).setOrigin(0.5);

        this.voiceCommand.setStatusCallback((status) => {
            this.updateMicStatus(status);
        });

        // 튜토리얼 텍스트 컨테이너
        this.tutorialText = this.add.text(width / 2, height / 2, '', {
            fontSize: '28px',
            fontFamily: 'Arial',
            color: '#fff',
            align: 'center',
            lineSpacing: 15
        }).setOrigin(0.5);

        // 안내 문구
        this.instructionText = this.add.text(width / 2, height - 100, '', {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#ffd93d',
            align: 'center'
        }).setOrigin(0.5);

        // 진행 상태 표시
        this.showProgress();

        // Scene 종료 시 정리
        this.events.on('shutdown', this.shutdown, this);

        // 스킵 버튼
        const skipButton = this.add.text(width - 100, 30, 'SKIP >', {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#a0aec0'
        }).setInteractive({ useHandCursor: true });

        skipButton.on('pointerover', () => skipButton.setColor('#fff'));
        skipButton.on('pointerout', () => skipButton.setColor('#a0aec0'));
        skipButton.on('pointerdown', () => {
            this.cleanupAndStart('GameScene');
        });
    }

    cleanupAndStart(sceneKey) {
        this.sceneActive = false;
        if (this.voiceCommand) {
            this.voiceCommand.destroy();
        }
        // 음성 인식이 완전히 종료될 때까지 대기 후 씬 전환
        this.time.delayedCall(300, () => {
            this.scene.start(sceneKey);
        });
    }

    showProgress() {
        const steps = [
            { text: '"점프"라고 말해보세요', instruction: '마이크에 대고 크게 말해주세요', command: 'jump' },
            { text: '"공격"이라고 말해보세요', instruction: '마이크에 대고 크게 말해주세요', command: 'attack' },
            { text: '훈련 완료!', instruction: '게임을 시작하려면 아무 버튼이나 누르세요', command: null }
        ];

        if (this.step < steps.length) {
            this.tutorialText.setText(steps[this.step].text);
            this.instructionText.setText(steps[this.step].instruction);
        }
    }

    handleVoiceCommand(command) {
        if (this.step === 0 && command === 'jump') {
            this.jumpCompleted = true;
            this.step = 1;
            this.showSuccessEffect('점프 성공!');
            this.showProgress();
        } else if (this.step === 1 && command === 'attack') {
            this.attackCompleted = true;
            this.step = 2;
            this.showSuccessEffect('공격 성공!');
            this.showProgress();

            // 게임 시작 버튼 표시
            this.time.delayedCall(1000, () => {
                this.showStartButton();
            });
        }
    }

    showSuccessEffect(text) {
        const { width, height } = this.cameras.main;
        const successText = this.add.text(width / 2, height / 2 + 80, text, {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#48bb78',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: successText,
            alpha: 0,
            y: successText.y - 50,
            duration: 1000,
            onComplete: () => successText.destroy()
        });
    }

    updateMicStatus(status) {
        // Scene이 파괴되었는지 확인
        if (!this.sceneActive || !this.micIcon || !this.micStatus) {
            return;
        }

        const statusMap = {
            'listening': { color: 0x48bb78, text: '듣고 있어요' },
            'stopped': { color: 0xff6b6b, text: '일시 정지' },
            'not-supported': { color: 0xff6b6b, text: '지원되지 않음' },
            'permission-denied': { color: 0xff6b6b, text: '마이크 권한 필요' },
            'no-speech': { color: 0xffd93d, text: '소리가 들리지 않아요' }
        };

        const info = statusMap[status] || { color: 0xff6b6b, text: '알 수 없음' };
        this.micIcon.setFillStyle(info.color);
        this.micStatus.setText(info.text);
    }

    shutdown() {
        this.sceneActive = false;
        if (this.voiceCommand) {
            this.voiceCommand.destroy();
        }
    }

    showStartButton() {
        const { width, height } = this.cameras.main;

        this.startButton = this.add.rectangle(width / 2, height / 2 + 100, 200, 60, 0x667eea)
            .setInteractive({ useHandCursor: true })
            .setOrigin(0.5);

        this.startButtonText = this.add.text(width / 2, height / 2 + 100, '게임 시작', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.startButton.on('pointerover', () => {
            this.startButton.setFillStyle(0x5568d3);
            this.startButton.setScale(1.05);
        });

        this.startButton.on('pointerout', () => {
            this.startButton.setFillStyle(0x667eea);
            this.startButton.setScale(1);
        });

        this.startButton.on('pointerdown', () => {
            this.cleanupAndStart('GameScene');
        });
    }
}
