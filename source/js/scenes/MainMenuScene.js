export class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
    }

    create() {
        const { width, height } = this.cameras.main;

        // 배경
        this.add.rectangle(0, 0, width, height, 0x1a1a2e).setOrigin(0);

        // 타이틀 텍스트
        const title = this.add.text(width / 2, height / 3, 'VOICE KNIGHT', {
            fontSize: '64px',
            fontFamily: 'Arial',
            color: '#667eea',
            fontStyle: 'bold',
            stroke: '#000',
            strokeThickness: 6
        }).setOrigin(0.5);

        // 부제
        this.add.text(width / 2, height / 3 + 60, '음성으로 조작하는 액션 게임', {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#a0aec0'
        }).setOrigin(0.5);

        // 게임 시작 버튼
        const startButton = this.add.rectangle(width / 2, height / 2 + 60, 200, 60, 0x667eea)
            .setInteractive({ useHandCursor: true })
            .setOrigin(0.5);

        const startText = this.add.text(width / 2, height / 2 + 60, 'GAME START', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // 버튼 호버 효과
        startButton.on('pointerover', () => {
            startButton.setFillStyle(0x5568d3);
            startButton.setScale(1.05);
        });

        startButton.on('pointerout', () => {
            startButton.setFillStyle(0x667eea);
            startButton.setScale(1);
        });

        startButton.on('pointerdown', () => {
            this.scene.start('TutorialScene');
        });

        // 도움말 텍스트
        const instructions = this.add.text(width / 2, height - 80, [
            '게임 조작법',
            '음성으로 "점프" - 장애물 회피',
            '음성으로 "공격" - 적 제거'
        ], {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#718096',
            align: 'center',
            lineSpacing: 8
        }).setOrigin(0.5);

        // 타이틀 애니메이션
        this.tweens.add({
            targets: title,
            y: title.y - 10,
            duration: 1500,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
    }
}
