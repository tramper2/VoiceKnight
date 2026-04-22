import { VoiceCommand } from '../utils/VoiceCommand.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    create() {
        // 씬이 재시작될 때마다 모든 상태를 초기화
        this.voiceCommand = null;
        this.player = null;
        this.ground = null;
        this.obstacles = null;
        this.enemies = null;
        this.projectiles = null;
        this.score = 0;
        this.scoreText = null;
        this.gameSpeed = 30;   // 기본 이동 속도 (초기값 10x 감소)
        this.isGameOver = false;
        this.lastObstacleTime = -9999;
        this.lastEnemyTime = -9999;
        this.canJump = true;
        this.enemyParts = []; // [{ body, leftEye, rightEye, nose }, ...]

        const { width, height } = this.cameras.main;

        // 배경 (패럴랙스 효과를 위한 여러 레이어)
        this.createBackground();

        // 바닥 (Road) 기준선: height - 120
        const groundTop = height - 120;
        
        // 물리적인 바닥 생성 (정적 객체)
        this.ground = this.add.rectangle(width / 2, groundTop + 30, width * 3, 60, 0x2d3748);
        this.ground.setAlpha(0); // 물리용이므로 투명하게 (시각적 바닥은 아래에서 따로 생성)
        this.physics.add.existing(this.ground, true); // true = static body

        // 시각적인 길(Road) 표현
        this.groundVisual = this.add.rectangle(0, groundTop, width * 3, 120, 0x2d3748).setOrigin(0, 0);
        // 길 위에 선 하나 그어서 더 명확하게 표현 (옵션)
        this.add.rectangle(0, groundTop, width * 3, 4, 0x4a5568).setOrigin(0, 0);

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

        // 키보드 입력 (음성 인식 보조/대체용)
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);

        // UI
        this.createUI();

        // 충돌 감지 (바닥과 플레이어)
        this.physics.add.collider(this.player, this.ground, () => {
            if (!this.canJump) {
                this.canJump = true;
            }
        });

        this.physics.add.overlap(this.player, this.obstacles, this.hitObstacle, null, this);
        this.physics.add.overlap(this.projectiles, this.enemies, this.destroyEnemy, null, this);
        this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);

        // Scene 종료 시 정리
        this.events.on('shutdown', this.shutdown, this);
    }

    shutdown() {
        if (this.voiceCommand) {
            this.voiceCommand.destroy();
            this.voiceCommand = null;
        }
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
        const groundTop = height - 120;
        const playerH = 60;
        
        // 길(groundTop) 보다 10px 위에서 시작해서 확실히 착지하게 함
        const startY = groundTop - playerH / 2 - 10; 

        this.player = this.add.rectangle(100, startY, 40, playerH, 0x667eea);
        this.physics.add.existing(this.player);
        
        // 물리 설정
        this.player.body.setGravityY(1000); // 중력을 좀 더 주어 묵직하게 착지
        this.player.body.setCollideWorldBounds(true);
        this.player.body.setMaxVelocityY(800);
        this.player.body.setDragX(0);

        // 플레이어 눈 (방향 표시) - player 중심에서 상대 위치로
        this.playerEye = this.add.circle(100 + 15, startY - 15, 5, 0xffffff);
        // 플레이어 무기
        this.playerWeapon = this.add.rectangle(100 + 30, startY - 5, 20, 8, 0xffd93d);
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

        // 종료 버튼
        const exitButton = this.add.rectangle(width - 40, 30, 60, 30, 0xe53e3e)
            .setInteractive({ useHandCursor: true })
            .setOrigin(0.5);

        const exitText = this.add.text(width - 40, 30, 'EXIT', {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        exitButton.on('pointerover', () => {
            exitButton.setFillStyle(0xc53030);
            exitButton.setScale(1.1);
        });

        exitButton.on('pointerout', () => {
            exitButton.setFillStyle(0xe53e3e);
            exitButton.setScale(1);
        });

        exitButton.on('pointerdown', () => {
            this.exitGame();
        });

        // 마이크 상태
        this.micIcon = this.add.circle(width - 120, 40, 15, 0xff6b6b);
        this.micIcon.setStrokeStyle(2, 0xffffff);

        // 음성 피드백 텍스트
        this.voiceFeedback = this.add.text(width / 2, 100, '', {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#48bb78',
            fontStyle: 'bold'
        }).setOrigin(0.5).setAlpha(0);
    }

    exitGame() {
        this.isGameOver = true;
        // shutdown 이벤트에서 voiceCommand 정리됨
        this.time.delayedCall(300, () => {
            this.scene.start('MainMenuScene');
        });
    }

    handleVoiceCommand(command) {
        if (this.isGameOver) return;

        const onGround = this.player.body.blocked.down;

        if (command === 'jump') {
            if (this.canJump || onGround) {
                this.player.body.setVelocityY(-550);
                this.canJump = false;
                this.showVoiceFeedback('점프!');
                this.player.setFillStyle(0x818cf8);
                this.time.delayedCall(200, () => this.player.setFillStyle(0x667eea));
            }
        } else if (command === 'attack') {
            this.fireProjectile();
            this.showVoiceFeedback('공격!');
            this.playerWeapon.setFillStyle(0xffffff);
            this.time.delayedCall(100, () => this.playerWeapon.setFillStyle(0xffd93d));
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
        const px = this.player.x + 30;
        const py = this.player.y - 10;

        const projectile = this.add.rectangle(px, py, 20, 8, 0xffd93d);

        // 그룹 먼저 추가 → physics 추가 → velocity 설정 순서 중요
        this.projectiles.add(projectile);
        this.physics.add.existing(projectile);
        projectile.body.setAllowGravity(false);
        projectile.body.setVelocityX(700);

        this.time.delayedCall(3000, () => {
            if (projectile && projectile.active) {
                projectile.destroy();
            }
        });
    }

    spawnObstacle() {
        const { width, height } = this.cameras.main;
        // 장애물 스폰 간격: 10~15초 (매우 여유롭게)
        const spawnDelay = Phaser.Math.Between(10000, 15000);

        if (this.time.now - this.lastObstacleTime > spawnDelay) {
            const spawnX = width + 50;
            const groundTop = height - 120;

            const obstacle = this.add.rectangle(spawnX, groundTop - 26, 40, 52, 0xe53e3e);

            this.obstacles.add(obstacle);
            this.physics.add.existing(obstacle);
            obstacle.body.setAllowGravity(false);
            obstacle.body.setImmovable(true);
            obstacle.body.setDrag(0, 0); // 공기 저항 제거
            obstacle.body.setFriction(0, 0); // 마찰 제거
            obstacle.body.setVelocityX(-this.gameSpeed);

            this.lastObstacleTime = this.time.now;
        }
    }

    spawnEnemy() {
        const { width, height } = this.cameras.main;
        // 적 스폰 간격: 20~30초 (매우 여유롭게)
        const spawnDelay = Phaser.Math.Between(20000, 30000);

        if (this.time.now - this.lastEnemyTime > spawnDelay) {
            const groundTop = height - 120;
            const enemyY = groundTop - 25;
            const ex = width + 50;

            const enemy = this.add.circle(ex, enemyY, 25, 0x9f7aea);

            this.enemies.add(enemy);
            this.physics.add.existing(enemy);
            enemy.body.setAllowGravity(false);
            enemy.body.setImmovable(true);
            enemy.body.setDrag(0, 0);
            enemy.body.setFriction(0, 0);
            enemy.body.setVelocityX(-this.gameSpeed * 0.85);

            // 얼굴 장식
            const leftEye  = this.add.circle(ex - 10, enemyY - 8, 5, 0xffffff);
            const rightEye = this.add.circle(ex - 10, enemyY + 8, 5, 0xffffff);
            const pupilL   = this.add.circle(ex - 12, enemyY - 8, 2, 0x1a1a2e);
            const pupilR   = this.add.circle(ex - 12, enemyY + 8, 2, 0x1a1a2e);
            const nose     = this.add.circle(ex - 18, enemyY,     3, 0xff6b6b);

            this.enemyParts.push({ body: enemy, leftEye, rightEye, pupilL, pupilR, nose });

            this.lastEnemyTime = this.time.now;
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

        // 적 얼굴 장식도 함께 제거
        const idx = this.enemyParts.findIndex(p => p.body === enemy);
        if (idx !== -1) {
            const { leftEye, rightEye, pupilL, pupilR, nose } = this.enemyParts[idx];
            leftEye.destroy();
            rightEye.destroy();
            pupilL.destroy();
            pupilR.destroy();
            nose.destroy();
            this.enemyParts.splice(idx, 1);
        }

        enemy.destroy();
        this.score += 50;
        this.scoreText.setText('Score: ' + Math.floor(this.score));
    }

    gameOver() {
        if (this.isGameOver) return; // 중복 호출 방지
        this.isGameOver = true;

        // 게임 오버 효과
        this.cameras.main.shake(200, 0.01);

        this.time.delayedCall(500, () => {
            this.scene.start('GameOverScene', { score: this.score });
        });
    }

    update(time, delta) {
        if (this.isGameOver) return;

        const { width, height } = this.cameras.main;

        // 바닥 접지 상태 체크 (더 정확한 점프 가능 여부 판별)
        if (this.player.body.blocked.down || this.player.body.touching.down) {
            this.canJump = true;
        }

        // 키보드 입력 처리 (음성 인식 보조/대체용)
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey) || Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
            if (this.canJump) {
                this.player.body.setVelocityY(-500);
                this.canJump = false;
                this.showVoiceFeedback('점프!');
            }
        }

        if (Phaser.Input.Keyboard.JustDown(this.attackKey)) {
            this.fireProjectile();
            this.showVoiceFeedback('공격!');
        }

        // 배경 패럴랙스 (속도 증가)
        const bgSpeed1 = 1 + this.score * 0.001;
        const bgSpeed2 = 2 + this.score * 0.002;

        this.bg1.x -= bgSpeed1;
        this.bg2.x -= bgSpeed1;
        this.bg3.x -= bgSpeed2;
        this.bg4.x -= bgSpeed2;

        if (this.bg1.x <= -width) this.bg1.x = width;
        if (this.bg2.x <= -width) this.bg2.x = width;
        if (this.bg3.x <= -width) this.bg3.x = width;
        if (this.bg4.x <= -width) this.bg4.x = width;

        // 플레이어 달리기 애니메이션 (위치 왔다갔다)
        const runBob = Math.sin(time / 100) * 2;
        this.playerEye.setPosition(this.player.x + 15, this.player.y - 15 + runBob);
        this.playerWeapon.setPosition(this.player.x + 30, this.player.y - 5 + runBob);

        // 장애물/적 스폰
        this.spawnObstacle();
        this.spawnEnemy();

        // 모든 활성 객체의 속도를 현재 gameSpeed에 맞춰 실시간 동기화 (겹침 방지)
        this.obstacles.children.entries.forEach(obstacle => {
            if (obstacle.active && obstacle.body) {
                obstacle.body.setVelocityX(-this.gameSpeed);
            }
        });

        this.enemies.children.entries.forEach(enemy => {
            if (enemy.active && enemy.body) {
                enemy.body.setVelocityX(-this.gameSpeed * 0.85);
            }
        });

        // 화면 밖 객체 제거
        this.enemyParts = this.enemyParts.filter(parts => {
            const { body, leftEye, rightEye, pupilL, pupilR, nose } = parts;

            // 적이 파괴됐거나 화면 밖으로 나간 경우 정리
            if (!body.active || body.x < -50) {
                leftEye.destroy();
                rightEye.destroy();
                pupilL.destroy();
                pupilR.destroy();
                nose.destroy();
                if (body.active) body.destroy();
                return false; // 배열에서 제거
            }

            // 적 이동에 따라 얼굴 장식 위치 갱신
            const ex = body.x;
            const ey = body.y;
            leftEye.setPosition(ex - 10, ey - 8);
            rightEye.setPosition(ex - 10, ey + 8);
            pupilL.setPosition(ex - 12, ey - 8);
            pupilR.setPosition(ex - 12, ey + 8);
            nose.setPosition(ex - 18, ey);
            return true;
        });

        // 화면 밖 장애물 제거
        this.obstacles.children.entries.slice().forEach(obstacle => {
            if (obstacle.active && obstacle.x < -50) obstacle.destroy();
        });

        // 점수 증가
        this.score += 0.1;
        this.scoreText.setText('Score: ' + Math.floor(this.score));

        // 속도 점진적 증가 로직 제거 (일정한 속도 30 유지)
    }
}
