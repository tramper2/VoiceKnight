import { VoiceCommand } from '../utils/VoiceCommand.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.voiceCommand = null;
        this.player = null;
        this.ground = null;
        this.obstacles = null;
        this.enemies = null;
        this.projectiles = null;
        this.score = 0;
        this.scoreText = null;
        this.gameSpeed = 300;
        this.isGameOver = false;
        this.lastObstacleTime = 0;
        this.lastEnemyTime = 0;
        this.canJump = true;
    }

    create() {
        const { width, height } = this.cameras.main;

        // 배경 (패럴랙스 효과를 위한 여러 레이어)
        this.createBackground();

        // 바닥
        this.ground = this.add.rectangle(0, height - 60, width * 3, 120, 0x2d3748).setOrigin(0, 1);
        this.physics.add.existing(this.ground, true);
        this.ground.body.setCollideWorldBounds(true);
        this.ground.body.immovable = true;

        // 플레이어
        this.createPlayer();

        // 장애물 그룹
        this.obstacles = this.physics.add.group();
        this.enemies = this.physics.add.group();
        this.projectiles = this.physics.add.group();

        // 음성 인식
        this.voiceCommand = new VoiceCommand();
        this.voiceCommand.init();
        this.voiceCommand.start();
        this.voiceCommand.setCommandCallback(this.handleVoiceCommand.bind(this));

        // UI
        this.createUI();

        // 충돌 감지
        this.physics.add.collider(this.player, this.ground, () => {
            this.canJump = true;
        });

        this.physics.add.overlap(this.player, this.obstacles, this.hitObstacle, null, this);
        this.physics.add.overlap(this.projectiles, this.enemies, this.destroyEnemy, null, this);
        this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);
    }

    createBackground() {
        const { width, height } = this.cameras.main;

        // 먼 산 (느리게 이동)
        this.bg1 = this.add.rectangle(0, height / 2, width * 2, height, 0x1a202c).setOrigin(0, 1);
        this.bg2 = this.add.rectangle(width, height / 2, width * 2, height, 0x1a202c).setOrigin(0, 1);

        // 중간 배경 (중간 속도)
        this.bg3 = this.add.rectangle(0, height / 2 + 50, width * 2, height - 100, 0x2d3748).setOrigin(0, 1);
        this.bg4 = this.add.rectangle(width, height / 2 + 50, width * 2, height - 100, 0x2d3748).setOrigin(0, 1);
    }

    createPlayer() {
        const { width, height } = this.cameras.main;

        // 플레이어 (간단한 사각형으로 대체)
        this.player = this.add.rectangle(100, height - 150, 40, 60, 0x667eea);
        this.physics.add.existing(this.player);
        this.player.body.setGravityY(800);
        this.player.body.setCollideWorldBounds(true);

        // 플레이어 눈 (방향 표시)
        this.playerEye = this.add.circle(115, height - 165, 5, 0xffffff);

        // 플레이어 무기
        this.playerWeapon = this.add.rectangle(130, height - 155, 20, 8, 0xffd93d);
    }

    createUI() {
        const { width } = this.cameras.main;

        // 점수
        this.scoreText = this.add.text(20, 20, 'Score: 0', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#fff',
            fontStyle: 'bold'
        });

        // 마이크 상태
        this.micIcon = this.add.circle(width - 40, 40, 15, 0xff6b6b);
        this.micIcon.setStrokeStyle(2, 0xffffff);

        // 음성 피드백 텍스트
        this.voiceFeedback = this.add.text(width / 2, 100, '', {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#48bb78',
            fontStyle: 'bold'
        }).setOrigin(0.5).setAlpha(0);
    }

    handleVoiceCommand(command) {
        if (this.isGameOver) return;

        const { height } = this.cameras.main;
        const playerY = this.player.y;

        if (command === 'jump' && this.canJump) {
            this.player.body.setVelocityY(-500);
            this.canJump = false;
            this.showVoiceFeedback('점프!');
        } else if (command === 'attack') {
            this.fireProjectile();
            this.showVoiceFeedback('공격!');
        }
    }

    showVoiceFeedback(text) {
        this.voiceFeedback.setText(text);
        this.voiceFeedback.setAlpha(1);

        this.tweens.add({
            targets: this.voiceFeedback,
            alpha: 0,
            y: this.voiceFeedback.y - 30,
            duration: 500,
            onComplete: () => {
                this.voiceFeedback.y = 100;
            }
        });
    }

    fireProjectile() {
        const { height } = this.cameras.main;
        const projectile = this.add.rectangle(
            this.player.x + 30,
            this.player.y - 10,
            20, 8, 0xffd93d
        );
        this.physics.add.existing(projectile);
        projectile.body.setVelocityX(600);

        this.projectiles.add(projectile);

        // 3초 후 제거
        this.time.delayedCall(3000, () => {
            if (projectile.active) {
                projectile.destroy();
            }
        });
    }

    spawnObstacle() {
        const { width, height } = this.cameras.main;
        const now = this.time.now;

        if (now - this.lastObstacleTime > Phaser.Math.Between(1500, 3000)) {
            const obstacleType = Phaser.Math.Between(0, 1);
            let obstacle;

            if (obstacleType === 0) {
                // 바닥 장애물
                obstacle = this.add.rectangle(width + 50, height - 75, 30, 50, 0xe53e3e);
            } else {
                // 공중 장애물
                obstacle = this.add.rectangle(width + 50, height - 200, 40, 40, 0xe53e3e);
            }

            this.physics.add.existing(obstacle);
            obstacle.body.setVelocityX(-this.gameSpeed);
            this.obstacles.add(obstacle);

            this.lastObstacleTime = now;
        }
    }

    spawnEnemy() {
        const { width, height } = this.cameras.main;
        const now = this.time.now;

        if (now - this.lastEnemyTime > Phaser.Math.Between(3000, 5000)) {
            const enemyY = Phaser.Math.Between(height - 250, height - 150);
            const enemy = this.add.circle(width + 30, enemyY, 25, 0x9f7aea);

            this.physics.add.existing(enemy);
            enemy.body.setVelocityX(-this.gameSpeed * 0.8);
            this.enemies.add(enemy);

            this.lastEnemyTime = now;
        }
    }

    hitObstacle() {
        this.gameOver();
    }

    hitEnemy() {
        this.gameOver();
    }

    destroyEnemy(projectile, enemy) {
        projectile.destroy();
        enemy.destroy();
        this.score += 50;
        this.scoreText.setText('Score: ' + this.score);
    }

    gameOver() {
        this.isGameOver = true;
        this.voiceCommand.stop();

        // 게임 오버 효과
        this.cameras.main.shake(200, 0.01);

        this.time.delayedCall(500, () => {
            this.scene.start('GameOverScene', { score: this.score });
        });
    }

    update(time, delta) {
        if (this.isGameOver) return;

        const { width, height } = this.cameras.main;

        // 배경 패럴랙스
        this.bg1.x -= 0.5;
        this.bg2.x -= 0.5;
        this.bg3.x -= 1;
        this.bg4.x -= 1;

        if (this.bg1.x <= -width) this.bg1.x = width;
        if (this.bg2.x <= -width) this.bg2.x = width;
        if (this.bg3.x <= -width) this.bg3.x = width;
        if (this.bg4.x <= -width) this.bg4.x = width;

        // 플레이어 위치 업데이트
        this.playerEye.setPosition(this.player.x + 15, this.player.y - 15);
        this.playerWeapon.setPosition(this.player.x + 30, this.player.y - 5);

        // 장애물/적 스폰
        this.spawnObstacle();
        this.spawnEnemy();

        // 화면 밖 객체 제거
        this.obstacles.children.entries.forEach(obstacle => {
            if (obstacle.x < -50) obstacle.destroy();
        });

        this.enemies.children.entries.forEach(enemy => {
            if (enemy.x < -50) enemy.destroy();
        });

        // 점수 증가
        this.score += 0.1;
        this.scoreText.setText('Score: ' + Math.floor(this.score));

        // 속도 점진적 증가
        this.gameSpeed = Math.min(600, 300 + this.score * 0.5);
    }
}
