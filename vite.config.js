import { defineConfig } from 'vite';
import { marked } from 'marked';

export default defineConfig({
    base: 'https://alvarobyrne.github.io/infinite-cube/',
    plugins: [
        {
            name: 'markdown-html',
            async transform(code, id) {
                if (/\.(md)$/.test(id)) {
                    // convert to html with `marked`
                    const html = await marked(code);
                    return {
                        // return the .js file we would want to import
                        code: `
                            export const html = ${JSON.stringify(html)};
                            export const md = ${JSON.stringify(code)};
                        `,
                        map: null,
                    };
                }
            },
        },
    ],
});