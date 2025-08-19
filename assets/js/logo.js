class Grid {
    constructor(selector, m, n) {
        this.cells = [];

        const container = document.querySelector(selector);
        container.innerHTML = "";

        container.style.display = 'grid';
        container.style.gridTemplateColumns = `repeat(${m}, 1fr)`;
        container.style.gridTemplateRows = `repeat(${n}, 1fr)`;
        container.style.width = '75px';

        for (let row = 0; row < n; row++) {
            const gridRow = [];
            for (let col = 0; col < m; col++) {
                const cell = document.createElement('div');
                cell.style.aspectRatio = '1 / 1';
                cell.style.width = '100%';
                cell.style.height = '100%';
                cell.style.boxSizing = 'border-box';
                container.appendChild(cell);

                gridRow.push(cell);
            }
            this.cells.push(gridRow);
        }
    }

    color(x, y, color) {
        this.cells[x][y].style.background = color;
    }

    render(palette, mapping) {
        for (let x = 0; x < mapping[0].length; x++) {
            for (let y = 0; y < mapping.length; y++) {
                const color = palette[mapping[y][x]];
                this.color(y, x, color);
            }
        }
    }
}

function* sweep(left, right) {
    let paletteSize = -Infinity;
    for (const row of left) {
        for (const val of row) {
            if (val > paletteSize) paletteSize = val;
        }
    }
    for (const row of right) {
        for (const val of row) {
            if (val > paletteSize) paletteSize = val;
        }
    }
    
    for (let frameIndex = 0; frameIndex <= left.length + left[0].length; frameIndex++) {
        let frame = left.map(row => [...row]);

        for (let i = 0; i < left.length; i++) {
            for (let j = 0; j < left[i].length; j++) {
                if ((i + j) < frameIndex) {
                    frame[i][j] = right[i][j];
                }
            }
        }

        yield frame;
    }

    // make sure we render the final result
    //yield right;
}

function* hold(image, frames) {
    for (let i = 0; i < frames; i++) {
        yield image;
    }
}

function* chainAnimations(animations) {
    for (const animation of animations) {
        for (const frame of animation) {
            yield frame;
        }
    }
}

function* logoAnimation(logoNoShadow, logoWithShadow) {
    while (true) {
        yield* sweep(logoNoShadow, logoWithShadow);
        yield* sweep(logoWithShadow, logoNoShadow);
        yield* hold(logoNoShadow, 5000);
    }
}

const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;

const palette = {
    0: "rgba(0, 0, 0, 0)",
    1: isDarkMode ? "#fff" : "rgb(34, 34, 34)",
    2: isDarkMode ? "rgba(250, 250, 250, 0.655)" : "rgba(0, 0, 0, 0.55)",
}


const logoNoShadow = [
    [0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,],
    [0,1,1,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,],
    [1,0,1,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,],
    [1,0,1,0,0,0,0,0,1,1,1,0,0,1,1,1,1,0,0,1,0,1,1,1,1,0,0,0,0,0,0,0,],
    [0,1,1,0,0,0,0,1,0,0,0,1,0,1,0,0,0,1,0,1,0,1,0,0,0,1,0,0,0,0,0,0,],
    [0,0,1,1,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,1,0,1,0,0,0,1,0,0,0,0,0,0,],
    [0,0,1,0,1,0,0,1,0,0,0,0,0,1,0,0,0,1,0,1,0,1,0,0,0,1,0,0,0,0,0,0,],
    [1,0,1,0,1,0,0,1,0,0,0,1,0,1,0,0,0,1,0,1,0,1,0,0,0,1,0,0,0,0,0,0,],
    [0,1,1,1,0,0,0,0,1,1,1,0,0,1,0,0,0,1,0,1,0,1,1,1,1,0,0,0,0,0,0,0,],
    [0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,],
]

const logoWithShadow = [
    [0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,],
    [0,1,1,1,0,0,0,0,0,0,0,0,0,1,2,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,],
    [1,2,1,2,1,0,0,0,0,0,0,0,0,1,2,2,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,],
    [1,2,1,2,2,2,0,0,1,1,1,0,0,1,1,1,1,0,0,1,0,1,1,1,1,0,0,0,0,0,0,0,],
    [0,1,1,2,2,2,2,1,2,2,2,1,0,1,2,2,2,1,0,1,2,1,2,2,2,1,0,0,0,0,0,0,],
    [0,0,1,1,2,2,2,1,2,2,2,2,2,1,2,2,2,1,2,1,2,1,2,2,2,1,2,0,0,0,0,0,],
    [0,0,1,2,1,2,2,1,2,2,2,2,2,1,2,2,2,1,2,1,2,1,2,2,2,1,2,2,0,0,0,0,],
    [1,0,1,2,1,2,2,1,2,2,2,1,2,1,2,2,2,1,2,1,2,1,2,2,2,1,2,2,2,0,0,0,],
    [0,1,1,1,2,2,2,2,1,1,1,2,2,1,2,2,2,1,2,1,2,1,1,1,1,2,2,2,2,2,0,0,],
    [0,0,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,0,],
    [0,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,2,],
]

const grid = new Grid(".logo", logoWithShadow[0].length, logoWithShadow.length);

const frameGenerator = logoAnimation(logoNoShadow, logoWithShadow);

const renderer = () => {
    const next = frameGenerator.next();
    grid.render(palette, next.value);
    requestAnimationFrame(renderer);
};
requestAnimationFrame(renderer);