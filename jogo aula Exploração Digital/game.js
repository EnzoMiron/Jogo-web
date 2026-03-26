const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 400,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 },
            debug: false
        }
    },
    scene: {
        preload,
        create,
        update
    }
};

const game = new Phaser.Game(config);

let player;
let ground;
let enemy = null;
let speed = 200;
let isGameOver = false;
let jumpSound;
let score = 0;
let scoreText;

function criarPlacar(scene) {
    // cria o texto na tela
    scoreText = scene.add.text(20, 20, 'Score: 0', {
        fontSize: '24px',
        fill: '#ffffff'
    });
}

function incrementarPlacar() {
    // aumenta o score
    score += 1;
    // atualiza o texto
    if (scoreText) {
        scoreText.setText('Score: ' + score);
    }
}

function preload() {
    this.load.image('walk1', 'assets/walk1.png');
    this.load.image('walk2', 'assets/walk2.png');
    this.load.image('chao', 'assets/chao.png');
    this.load.image('inimigo', 'assets/inimigo.png');
    //this.load.audio('pulo', 'assets/pulo.ogg');
}

function create() {

    criarPlacar(this);

    // CHÃO (tileSprite = move infinito)
    ground = this.add.tileSprite(400, 368, 800, 64, 'chao');

    this.physics.add.existing(ground, true);

    // PLAYER
    player = this.physics.add.sprite(100, 300, 'walk1');
    player.setCollideWorldBounds(true);
    player.setSize(50, 80);

    // ANIMAÇÃO
    this.anims.create({
        key: 'run',
        frames: [
            { key: 'walk1' },
            { key: 'walk2' }
        ],
        frameRate: 6,
        repeat: -1
    });

    player.play('run');

    // COLISÃO COM CHÃO
    this.physics.add.collider(player, ground);

    // INPUT
    this.input.keyboard.on('keydown-SPACE', () => {
        if (player.body.touching.down && !isGameOver) {
            player.setVelocityY(-500);
            jumpSound.play();
        }
    });

    // AUDIO
    //jumpSound = this.sound.add('pulo');

    // PRIMEIRO INIMIGO
    spawnEnemy(this);
}

function update() {

    if (isGameOver) return;

    // mover chão
    ground.tilePositionX += speed * 0.016;

    // mover inimigo
    if (enemy) {
        enemy.setVelocityX(-speed);

        // saiu da tela
        if (enemy.x < -50) {
            enemy.destroy();
            enemy = null;

            incrementarPlacar();

            // aumenta velocidade
            speed += 20;

            spawnEnemy(this);
        }
    }
}

function spawnEnemy(scene) {

    if (enemy) return;

    enemy = scene.physics.add.sprite(850, 300, 'inimigo');
    enemy.body.setAllowGravity(false);
    enemy.setVelocityX(-speed);

    // ajustar colisão
    enemy.body.setSize(32, 32);
    enemy.body.setOffset(16, 16);

    scene.physics.add.collider(enemy, ground);

    // COLISÃO COM PLAYER
    scene.physics.add.collider(player, enemy, () => {
        gameOver(scene);
    });
}

function gameOver(scene) {
    isGameOver = true;

    player.setTint(0xff0000);
    player.anims.stop();

    if (enemy) enemy.setVelocityX(0);
}