import { rotations, dicePips } from './data.js';

export function createDice() {
    const cube1 = document.getElementById('cube1');
    const cube2 = document.getElementById('cube2');
    const cubes = [cube1, cube2];
    const faces = ['front', 'back', 'right', 'left', 'top', 'bottom'];
    if (!cube1 || !cube2) {
        console.error("Dice cubes not found in DOM!");
        return;
    }
    cubes.forEach(cube => {
        cube.innerHTML = ''; // Clear
        faces.forEach((f, i) => {
            const faceDiv = document.createElement('div');
            faceDiv.className = `face ${f}`;
            dicePips[i].forEach(p => {
                const dot = document.createElement('div');
                dot.className = 'dot';
                dot.style.gridArea = `${Math.floor(p/3)+1} / ${(p%3)+1}`;
                faceDiv.appendChild(dot);
            });
            cube.appendChild(faceDiv);
        });
    });
}

export function animateDice(d1, d2, callback) {
    gsap.to(".cube", {
        duration: 0.8,
        rotationX: "+=1440",
        rotationY: "+=1440",
        rotationZ: "+=360",
        ease: "power2.inOut",
        onComplete: () => {
            gsap.set("#cube1", { rotationX: rotations[d1-1].x, rotationY: rotations[d1-1].y, rotationZ: 0 });
            gsap.set("#cube2", { rotationX: rotations[d2-1].x, rotationY: rotations[d2-1].y, rotationZ: 0 });
            if (callback) callback();
        }
    });
}