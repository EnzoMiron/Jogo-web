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
let score = 0;
let scoreText;

let fruits;
let fruitTypes = [
    { key: 'morango', value: 5 },
    { key: 'cereja', value: 10 },
    { key: 'apple', value: 15 },
    { key: 'banana', value: 20 }
];

function criarPlacar(scene) {
    scoreText = scene.add.text(20, 20, 'Score: 0', {
        fontSize: '24px',
        fill: '#ffffff'
    });
}

function incrementarPlacar() {
    score += 1;
    scoreText.setText('Score: ' + score);
}

function preload() {
    this.load.image('walk1', 'assets/walk1.png');
    this.load.image('walk2', 'assets/walk2.png');
    this.load.image('chao', 'assets/chao.png');
    this.load.image('inimigo', 'assets/inimigo.png');

    this.load.image('morango', 'assets/morango.png');
    this.load.image('cereja', 'assets/cereja.png');
    this.load.image('apple', 'assets/apple.png');
    this.load.image('banana', 'assets/banana.png');
}

function create() {

    criarPlacar(this);

    // CHÃO
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

    // COLISÃO PLAYER + CHÃO
    this.physics.add.collider(player, ground);

    // INPUT (pulo)
    this.input.keyboard.on('keydown-SPACE', () => {
        if (player.body.touching.down && !isGameOver) {
            player.setVelocityY(-500);
        }
    });

    // ===== FRUTAS (CORRIGIDO) =====
    fruits = this.physics.add.group();

    this.physics.add.collider(fruits, ground);

    this.physics.add.overlap(player, fruits, collectFruit, null, this);

    // PRIMEIRO INIMIGO
    spawnEnemy(this);
}

function spawnFruit(scene) {
    let randomFruit = Phaser.Utils.Array.GetRandom(fruitTypes);

    let fruit = fruits.create(850, 250, randomFruit.key);

    fruit.setVelocityX(-speed);
    fruit.body.setAllowGravity(false);

    fruit.value = randomFruit.value;
}

function collectFruit(player, fruit) {
    fruit.destroy();

    score += fruit.value;
    scoreText.setText('Score: ' + score);
}

function update() {

    if (isGameOver) return;

    // mover chão
    ground.tilePositionX += speed * 0.016;

    // inimigo
    if (enemy) {
        enemy.setVelocityX(-speed);

        if (enemy.x < -50) {
            enemy.destroy();
            enemy = null;

            incrementarPlacar();
            speed += 20;

            spawnEnemy(this);
        }
    }

    // spawn aleatório de frutas
    if (Phaser.Math.Between(0, 1000) < 10) {
        spawnFruit(this);
    }

    // remover frutas fora da tela
    fruits.children.iterate((fruit) => {
        if (fruit && fruit.x < -50) {
            fruit.destroy();
        }
    });
}

function spawnEnemy(scene) {

    if (enemy) return;

    enemy = scene.physics.add.sprite(850, 300, 'inimigo');
    enemy.body.setAllowGravity(false);
    enemy.setVelocityX(-speed);

    enemy.body.setSize(32, 32);
    enemy.body.setOffset(16, 16);

    scene.physics.add.collider(enemy, ground);

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