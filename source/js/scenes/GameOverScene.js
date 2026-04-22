export class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
        this.finalScore = 0;
    }

    init(data) {
        this.finalScore = Math.floor(data.score || 0);
    }

    create() {
        const { width, height } = this.cameras.main;

        // 반투명 배경
        this.add.rectangle(0, 0, width, height, 0x000000, 0.7).setOrigin(0);

        // 게임 오버 텍스트
        const gameOverText = this.add.text(width / 2, height / 3, 'GAME OVER', {
            fontSize: '64px',
            fontFamily: 'Arial',
            color: '#e53e3e',
            fontStyle: 'bold',
            stroke: '#000',
            strokeThickness: 6
        }).setOrigin(0.5);

        // 최종 점수
        this.add.text(width / 2, height / 2, `최종 점수: ${this.finalScore}`, {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // 다시 하기 버튼
        const retryButton = this.add.rectangle(width / 2, height / 2 + 100, 200, 60, 0x48bb78)
            .setInteractive({ useHandCursor: true })
            .setOrigin(0.5);

        const retryText = this.add.text(width / 2, height / 2 + 100, '다시 하기', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // 메인 메뉴 버튼
        const menuButton = this.add.rectangle(width / 2, height / 2 + 180, 200, 60, 0x718096)
            .setInteractive({ useHandCursor: true })
            .setOrigin(0.5);

        const menuText = this.add.text(width / 2, height / 2 + 180, '메인 메뉴', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // 버튼 이벤트
        retryButton.on('pointerover', () => {
            retryButton.setFillStyle(0x38a169);
            retryButton.setScale(1.05);
        });

        retryButton.on('pointerout', () => {
            retryButton.setFillStyle(0x48bb78);
            retryButton.setScale(1);
        });

        retryButton.on('pointerdown', () => {
            this.scene.start('GameScene');
        });

        menuButton.on('pointerover', () => {
            menuButton.setFillStyle(0x4a5568);
            menuButton.setScale(1.05);
        });

        menuButton.on('pointerout', () => {
            menuButton.setFillStyle(0x718096);
            menuButton.setScale(1);
        });

        menuButton.on('pointerdown', () => {
            this.scene.start('MainMenuScene');
        });

        // 게임 오버 애니메이션
        this.tweens.add({
            targets: gameOverText,
            scale: 1.1,
            duration: 800,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
    }
}
