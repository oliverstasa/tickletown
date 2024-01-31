import { game } from './game.js';

export const error = (name, body) => {
    const errorElement = document.createElement('div');
    errorElement.setAttribute('class', 'error');
    errorElement.innerHTML = `<h1>${name}</h1>${body}`;
    document.body.append(errorElement);
};

export const completePreload = () => {
    const door = document.createElement('div');
    door.setAttribute('id', 'door');
    door.classList.add('away');
    const door1 = document.createElement('div');
    const door2 = document.createElement('div');
    door1.classList.add('door', 'l');
    door2.classList.add('door', 'r');
    door.append(door1, door2);
    document.body.append(door);

    const info = document.createElement('div');
    info.setAttribute('id', 'info');
    info.addEventListener('click', () => {
        cheer('Game by', '<p>👨‍💻 Oliver + 🎨 Ester + 🔊 Ondra</p>-- CLOSE --');
    });
    hoverTickle(info);
    document.body.append(info);

    cheer('Continue', '', begin);
};

const cursorPos = e => {
    return {
        x: e.pageX || e.touches[0].pageX,
        y: e.pageY || e.touches[0].pageY
    }
};

export const mouseMove = (e, elem) => {
    const pos = cursorPos(e);
    const y = pos.y + window.scrollY;
    const x = pos.x + window.scrollX;
    elem.style.top = y + 'px';
    elem.style.left = x + 'px';
};

export const cheer = (name, body, action = false) => {
    const cheerElem = document.createElement('div');
    cheerElem.setAttribute('class', 'cheer');
    cheerElem.innerHTML = `<h1>${name}</h1>${body}`;
    cheerElem.addEventListener('click', () => {
        cheerElem.remove();
        if (action) {
            action();
        }
    });
    cheerElem.style.zIndex = document.querySelectorAll('.cheer').length + 9999;
    hoverTickle(cheerElem);
    document.body.append(cheerElem);
};

export const start = () => {
    const door = document.querySelector('#door');
    door.classList.add('away');

    getSound('menuMusic').pause();
    getSound('doorOpen').play();

    setTimeout(() => {
        door.classList.add('hidden');
        game();
    }, 1000);
};

export const begin = async () => {
    cactufy(randInRange(15, 30));

    const door = document.querySelector('#door');
    door.classList.remove('hidden');
    door.offsetHeight;
    door.classList.remove('away');

    getSound('doorClose').play();
    setTimeout(() => {
        getSound('menuMusic', true).play();
    }, 800);

    await new Promise((r) => setTimeout(r, 1000));

    cheer('Sheriff!', '<p>🤠 Cowboys are raging outside.<br>🌵 Luckily you got the Fastest Fingers™.<br>👆 Find a way to prevent bloodshed.</p>-- START --', start);
};

export const hoverTickle = elem => {
    elem.addEventListener('click', () => {
        document.body.classList.remove('tickle');
    });
    elem.addEventListener('mouseenter', () => {
        document.body.classList.add('tickle');
    });
    elem.addEventListener('mouseleave', () => {
        document.body.classList.remove('tickle');
    });
};

export const randomFrom = arr => {
    return arr[Math.floor(Math.random() * arr.length)];
};

export const isNumber = str => {
    return typeof str === 'number';
};

export const getSound = (s, loop = false, fromStart = true, volume = 1) => {
    const sounds = window.sounds.filter(a => a.src.includes(s));
    if (!sounds) {
        error('No sound!', sound);
    }
    const sound = sounds.length == 1 ? sounds[0] : randomFrom(sounds);
    if (loop) {
        sound.loop = true;
    }
    if (fromStart) {
        sound.currentTime = 0;
    }
    if (volume) {
        sound.volume = volume;
    }
    return sound;
};

export const randInRange = (a, b) => {
    return Math.floor(Math.random() * (b - a) + a);
}

export const cactufy = (seed) => {
    const items = ['cactus1', 'cactus2', 'skull1', 'dirt1', 'dirt2', 'dirt3', 'dirt4', 'bone1', 'bone2', 'bone3'];
    let s = 0;
    // remove old stuff
    for (const c of document.querySelectorAll('.item')) {
        c.remove();
    }
    while (s < seed) {
        const elem = document.createElement('div');
        elem.classList.add('item', randomFrom(items));
        elem.style.left = randInRange(0, 100) + 'vw';
        elem.style.top = randInRange(0, 100) + 'vh';
        elem.style.animationDelay = (-1) * randInRange(0, 20) + 's';
        document.body.append(elem);
        s++;
    }
};