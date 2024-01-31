import {
    begin,
    cheer,
    getSound,
    isNumber,
    randInRange,
    randomFrom,
} from "./utils.js";

const frameRule = 80; // in ms
const step = 40; // step in time in ms

const distance = 0.5; // step in distance
const escapeRate = 2; // faster escaping then returning
const returnRate = 1;
const fireRate = 1;

const cowboys = [];

const cowboyTypes = [
    {
        name: 'joe',
        difficulty: 5000,
        spawnPer: 5
    }, {
        name: 'andy',
        difficulty: 3500,
        spawnPer: 11
    }, {
        name: 'frank',
        difficulty: 2000,
        spawnPer: 23
    }
];

let gameEnded;
let firing;
let zIndex;
let i;

// globals default state
const defaultGlobals = () => {
    if (cowboys.length > 0) {
        for (const c of cowboys) { c !== null && c.cowboy?.remove(); }
        cowboys.length = 0;
    }
    gameEnded = false;
    firing = false;
    zIndex = 1;
    i = 1;
}


// create new cowboys
const spawnNewCowboy = i => {
    let p = 0;
    for (const c of cowboyTypes) {
        if (i % (c.spawnPer * 10) == 0) {
            cowboys.push(new Cowboy(cowboys.length, undefined, p));
        }
        p++;
    }
};

// somebody shot! evaluate lost
window.addEventListener('shotsFired', e => {
    firing = true;
    const whoFired = cowboys[e.detail.id];
    const opositSide = whoFired.side == 'r' ? 'l' : 'r';
    const enemyCowboys = cowboys.filter(c => {
        if (c === null) {
            return false;
        }
        return c?.side == opositSide ?? false;
    });
    const missedShot = _ => {
        getSound('miss1').play();
        firing = false;
    };
    const gameOver = _ => {
        gameEnded = true;

        setTimeout(() => {
            getSound('harmonica2').play();
            cheer(`IT'S OVER`, '<p>💀 Blood has been spilled.</p>-- Return to saloon with shame --', begin);
        }, 1000);
    };

    // what happenes?
    if (enemyCowboys.length > 0) {
        // somebody stands on the other side = blood will be spilled
        randomFrom(enemyCowboys).killed();
        whoFired.bang(); // stay in bang state to know who fired
        getSound('mainTheme').pause();
        !gameEnded && gameOver();
    } else {
        // nobody on the other side = empty shot, reset timer
        whoFired.reset();
        missedShot();
    }
});

// somebody escaped! evaluate win
window.addEventListener('escaped', e => {
    cowboys[e.detail.id] = null;
    getSound('horseAway').play();

    // win scenario?
    if (cowboys.filter(c => c !== null).length == 0) {
        gameEnded = true;

        getSound('mainTheme').pause();
        getSound('yeehaw2').play();

        cheer('YOU DID IT!', `<p>🤠 Thats the spirit.<br>✌️ Tickle Town is saved!</p>-- Return to saloon and rest your fingers --`, begin);
    }
});

export const game = () => {

    console.log('lets play');
    defaultGlobals();

    getSound('mainTheme', true, true, 0.75).play();

    // game begins
    while (cowboys.length < 4) {
        const c = cowboys.length;
        cowboys.push(new Cowboy(c, c % 2 ? 'l' : 'r'));
    }

    // rendering loop
    // shut up, just... shut, up
    const update = async () => {
        if (gameEnded) {
            return;
        }

        if (!firing) {
            for (const c of cowboys) {
                c !== null && c.update();
            }
        }

        spawnNewCowboy(i++);

        // shut up, it works
        await new Promise((r) => setTimeout(r, frameRule));
        requestAnimationFrame(update);
    }

    update();
}

class Cowboy {

    constructor(id, side, type, escapeDistance) {
        this.id = id;
        this.side = side ? side : ['l', 'r'].at(Math.random() < 0.5 ? 0 : 1);
        this.type = isNumber(type) && type < cowboyTypes.length ? type : randInRange(0, cowboyTypes.length);
        this.timeoutFire = cowboyTypes[this.type].difficulty;
        this.name = cowboyTypes[this.type].name;
        this.escapeDistance = isNumber(escapeDistance) ? escapeDistance : randInRange(20, 40);
        this.escaping = this.escapeDistance - this.escapeDistance / 10; // initial position
        this.firing = 0;
        this.tickle = false;
        this.walk = randInRange(0, 5); // how likely to make step
        this.tickleSound = getSound(this.name, true, false);
        this.cowboy = this.createCowboyBody();

        const spawnSound = getSound('guitar1');
        spawnSound.play();

        this.update();
    }

    update() {
        // calc new position
        if (this.tickle) {
            this.firing = 0;
            this.escaping = this.escaping + escapeRate * distance;
        } else {
            this.firing = this.firing + fireRate * step;
            this.escaping = this.escaping > 0 ? (this.escaping - returnRate * distance) : 0;
        }

        // set position
        const pos = this.escapeDistance - this.escaping + 'vw';
        switch (this.side) {
            case 'l':
                this.cowboy.style.left = pos;
                break;
            case 'r':
                this.cowboy.style.right = pos;
                break;
        }

        // regres bar
        const bar = this.cowboy?.querySelector('.timeout .bar');
        if (bar) {
            bar.style.width = 100 - (100 / this.timeoutFire * this.firing) + '%';
        }

        // time to fire
        if (this.firing >= this.timeoutFire) {
            const e = new CustomEvent('shotsFired', { detail: { id: this.id } });
            window.dispatchEvent(e);
            this.bang();
            return;
        }

        // time to go home
        if (this.escaping >= this.escapeDistance) {
            const e = new CustomEvent('escaped', { detail: { id: this.id } });
            window.dispatchEvent(e);
            this.tickleStop();
            this.cowboy.remove();
            return;
        }

        // almost time to fire
        if (this.firing >= this.timeoutFire - this.timeoutFire / 8) {
            if (!this.cowboy.classList.contains('firing')) {
                this.cowboy.classList.add('firing');
                getSound('revolverCock').play();
            }
        } else if (this.cowboy.classList.contains('firing')) {
            this.cowboy.classList.remove('firing');
            const cock = getSound('revolverCock');
            cock.pause();
            cock.currentTime = 0;
            getSound('revolverReload').play();
        } else {
            this.walk++;
        }

        // walk
        if (this.walk % 5 == 0) {
            this.cowboy.classList.contains('step')
                ? this.cowboy.classList.remove('step')
                : this.cowboy.classList.add('step');
            this.walk = 0;
        }
    }

    createCowboyBody() {
        const cowboy = document.createElement('div');
        cowboy.classList.add('cowboy', this.side, this.name);
        cowboy.setAttribute('id', 'c' + this.id);
        cowboy.addEventListener('mouseenter', this.tickleStart);
        cowboy.addEventListener('mouseleave', this.tickleStop);
        /*
        cowboy.addEventListener('touchenter', this.tickleStart);
        cowboy.addEventListener('touchleave', this.tickleStop);
        */

        const body = document.createElement('div');
        body.classList.add('body');
        cowboy.append(body);

        const timeout = document.createElement('div');
        timeout.classList.add('timeout');
        const bar = document.createElement('div');
        bar.classList.add('bar');
        timeout.append(bar);
        cowboy.append(timeout);

        document.body.append(cowboy);
        cowboy.style.top = randInRange(0, 75) + 'vh';
        return cowboy;
    }

    tickleStart = _ => {
        this.tickle = true;
        this.tickleSound.currentTime = randInRange(0, this.tickleSound.duration);
        this.tickleSound.play();

        this.cowboy.classList.add('tickle');
        document.body.classList.add('tickle');

        zIndex++;
        this.cowboy.style.zIndex = zIndex;
    }

    tickleStop = _ => {
        this.tickle = false;
        this.tickleSound.pause();

        this.cowboy.classList.remove('tickle');
        document.body.classList.remove('tickle');
    }

    killed = e => {
        this.cowboy.classList.add('dead');
    }

    reset = e => {
        this.firing = 0;

        this.update();
    }

    bang = e => {
        const bang = document.createElement('div');
        bang.classList.add('bang');
        this.cowboy.append(bang);

        const shot = getSound('shot');
        shot.play();

        this.cowboy.classList.add('fired');
        setTimeout(() => {
            this.cowboy.classList.remove('fired');
            this.cowboy.querySelector('.bang').remove();
            shot.pause();
            shot.currentTime = 0;
        }, shot.duration * 1000 / 2);
    }

}