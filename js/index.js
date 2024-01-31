/**
 * hello and wellcome
 */

import {
    error,
    mouseMove,
    completePreload
} from "./utils.js";

window.sounds = [];

window.addEventListener('load', () => {

    const tickleFinger = document.createElement('div');
    tickleFinger.setAttribute('id', 'tickleFinger');
    document.body.append(tickleFinger);
    window.addEventListener('mousemove', e => mouseMove(e, tickleFinger));
    // window.addEventListener('touchmove', e => mouseMove(e, tickleFinger));

    try {
        fetch('./php/preload.php')
            .then(res => res.json())
            .then(files => {
                const filesLength = files.length;
                const progress = document.createElement('div');
                progress.setAttribute('id', 'progress');
                document.body.append(progress);
                if (filesLength > 0) {
                    let preloadCounter = 0;
                    const evaluatePreload = () => {
                        preloadCounter++;
                        progress.innerText = Math.round(preloadCounter / filesLength * 100) + '%';
                        if (preloadCounter == filesLength) {
                            setTimeout(() => { progress.innerText = '106%' }, 50);
                            setTimeout(() => progress.remove(), 100);
                            completePreload();
                        }
                    }
                    // preload the fakin files
                    for (const p of files) {
                        const path = p.substr(1);  // this dir goes with an extra .
                        if (path.includes('.mp3')) {
                            let file = new Audio(path);
                            file.preload;
                            file.addEventListener('canplaythrough', evaluatePreload);
                            file.load(evaluatePreload);
                            window.sounds = [...window.sounds, file];
                        } else if (path.includes('.png') || path.includes('.gif')) {
                            let file = new Image();
                            file.src = path;
                            file.addEventListener('load', evaluatePreload);
                        } else {
                            evaluatePreload();
                        }
                    }
                } else {
                    error('No images to load');
                }
            }).catch(e => {
                error('Error while reading preload list.', e);
            });
    } catch (e) {
        error('No preload list found.', e);
    }
});
