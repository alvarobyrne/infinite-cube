export class ThemeManager {
    constructor() {
        this.currentTheme = 'dark'; // Default to dark
        this.isTransparent = false;
        this.listeners = [];

        this.themes = {
            light: {
                css: {
                    '--background-color': '#f6f6f6',
                    '--text-color': '#3d3d3d',
                    '--title-background-color': '#efefef',
                    '--title-text-color': '#3d3d3d',
                    '--widget-color': '#eaeaea',
                    '--hover-color': '#f0f0f0',
                    '--focus-color': '#fafafa',
                    '--number-color': '#07aacf',
                    '--string-color': '#8da300',
                },
                colors: {
                    background: 0xf6f6f6,
                    block: {
                        primary: 0x3d3d3d,
                        secondary: 0x8da300,
                        tertiary: 0x07aacf
                    },
                    dimensionLine: {
                        width: 'orange', // W
                        height: 'green', // H
                        depth: 'blue',   // D
                        text: 'black',
                        default: 'gray'
                    },
                    text: 0x000000,
                    palette: {
                        red: '#cc0000',
                        green: '#00cc00',
                        blue: '#0000cc',
                        yellow: '#cccc00', // Darker yellow for light background
                        magenta: '#cc00cc',
                        cyan: '#00cccc',
                        orange: '#cc6600',
                        white: 'black', // Invert for light theme contrast against background? Or keep standard? Using 'black' for 'white' lines feels semantic invert.
                        black: 'white',
                        gray: 'gray'
                    }
                }
            },
            dark: {
                css: {
                    '--background-color': '#1f1f1f',
                    '--text-color': '#ebebeb',
                    '--title-background-color': '#111111',
                    '--title-text-color': '#ebebeb',
                    '--widget-color': '#424242',
                    '--hover-color': '#4f4f4f',
                    '--focus-color': '#595959',
                    '--number-color': '#2cc9ff',
                    '--string-color': '#a2db3c',
                },
                colors: {
                    background: 0x1f1f1f,
                    block: {
                        primary: 0xebebeb,
                        secondary: 0xa2db3c,
                        tertiary: 0x2cc9ff
                    },
                    dimensionLine: {
                        width: 'cyan',   // W
                        height: 'magenta', // H
                        depth: 'yellow', // D
                        text: 'white',
                        default: 'white'
                    },
                    text: 0xffffff,
                    palette: {
                        red: 'red',
                        green: 'green',
                        blue: 'blue',
                        yellow: 'yellow',
                        magenta: 'magenta',
                        cyan: 'cyan',
                        orange: 'orange',
                        white: 'white',
                        black: 'black',
                        gray: 'gray'
                    }
                }
            }
        };
    }

    get colors() {
        return this.themes[this.currentTheme].colors;
    }

    setTheme(themeName) {
        if (!this.themes[themeName]) {
            console.warn(`Theme '${themeName}' not found.`);
            return;
        }

        this.currentTheme = themeName;
        this.applyStyles();

        // Notify listeners
        this.notifyListeners();
    }

    setTransparency(isTransparent) {
        this.isTransparent = isTransparent;
        this.applyStyles();
    }

    applyStyles() {
        const theme = this.themes[this.currentTheme];
        const css = { ...theme.css };

        if (this.isTransparent && css['--background-color']) {
            // Append 00 to the background color to make it transparent
            // Assuming the color is a hex string
            let color = css['--background-color'];
            if (color.length === 7) { // #RRGGBB
                color += '00';
            } else if (color.length === 9) { // #RRGGBBAA
                color = color.substring(0, 7) + '00';
            }
            css['--background-color'] = color;
        }

        this._injectStyles(css);
    }

    _injectStyles(css) {
        if (!this.styleElement) {
            this.styleElement = document.createElement('style');
            document.head.appendChild(this.styleElement);
        }

        let rules = '';
        for (const [key, value] of Object.entries(css)) {
            rules += `\t${key}: ${value};\n`;
        }

        // Apply to .lil-gui for specific overrides
        let styleString = `.lil-gui {\n${rules}}\n`;

        // Apply to body for global app theming
        styleString += `body {\n${rules}}\n`;

        this.styleElement.innerHTML = styleString;
    }


    subscribe(callback) {
        this.listeners.push(callback);
    }

    notifyListeners() {
        this.listeners.forEach(callback => callback(this.currentTheme));
    }
}

export const themeManager = new ThemeManager();
