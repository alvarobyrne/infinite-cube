export class ThemeManager {
    constructor() {
        this.currentTheme = 'dark'; // Default to dark
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
        const theme = this.themes[themeName];

        // Apply CSS variables to .lil-gui elements (or body if needed globally)
        // Since .lil-gui is usually appended to body or has a specific root, we can try setting on body 
        // which will cascade if variables are used.
        // The user request specified: .lil-gui { ... }
        // We can inject a style tag or set variables on the root.

        const root = document.querySelector('.lil-gui') || document.body;
        if (root) {
            Object.entries(theme.css).forEach(([key, value]) => {
                root.style.setProperty(key, value);
            });
        }

        // Also good to set on body just in case
        Object.entries(theme.css).forEach(([key, value]) => {
            document.body.style.setProperty(key, value);
        });


        // Notify listeners
        this.notifyListeners();
    }

    subscribe(callback) {
        this.listeners.push(callback);
    }

    notifyListeners() {
        this.listeners.forEach(callback => callback(this.currentTheme));
    }
}

export const themeManager = new ThemeManager();
