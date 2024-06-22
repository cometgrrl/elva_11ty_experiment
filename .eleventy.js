// @param {import("@11ty/eleventy/src/UserConfig")} eleventyConfig 

// Imports --------------------------------------------

import { EleventyI18nPlugin, EleventyHtmlBasePlugin, EleventyRenderPlugin } from '@11ty/eleventy';
import fs from 'fs';
import markdownIt from 'markdown-it';
import markdownItIns from 'markdown-it-ins';
import markdownItMark from 'markdown-it-mark';
import markdownItSub from 'markdown-it-sub';
import markdownItSup from 'markdown-it-sup';
import path from 'path';
import pluginRSS from '@11ty/eleventy-plugin-rss';
import pluginSyntaxHighlight from '@11ty/eleventy-plugin-syntaxhighlight';
import pluginEmbedEverything from 'eleventy-plugin-embed-everything';

// Local ---------------------------------------------

// Plugins
import drafts from './_11ty/plugins/drafts.cjs';

// Transforms
import transformCSS from './_11ty/transforms/css.js';
import transformHTML from './_11ty/transforms/html.js';
import transformJS from './_11ty/transforms/js.js';

// Shortcodes
import image from './_11ty/shortcodes/image.js';

// Filters
import base64 from './_11ty/filters/base64.js';
import cdnify from './_11ty/filters/cdnify.js';
import { formatDate } from './_11ty/filters/dates.js';
import languageFilter from './_11ty/filters/language.js';
import mimetype from './_11ty/filters/mimetype.js';
import random from './_11ty/filters/random.js';
import readingTime from './_11ty/filters/readingtime.js';
import sort from './_11ty/filters/sort.js';
import translate from './_11ty/filters/translate.js';
import where from './_11ty/filters/where.js';

// Languages
import locales from './content/_data/locales.js';

// 11ty -----------------------------------------------

export default async function(eleventyConfig) {

    // Global Settings --------------------------------

    eleventyConfig.addGlobalData('settings', {
        // these get merged with content/_data/settings.js
        url: process.env.URL || process.env.CF_PAGES_URL || 'http://localhost:8080',
        isProduction: process.env.NODE_ENV === 'production',
        isStaging: (process.env.URL && process.env.URL.includes('github.io')) || (process.env.CF_PAGES_URL && process.env.CF_PAGES_URL.includes('pages.dev')) || false
    });

    // Watch Targets ----------------------------------

    eleventyConfig.addWatchTarget('./content/assets');

    // Layouts ----------------------------------------

    eleventyConfig.addLayoutAlias('base', 'base.njk');
    eleventyConfig.addLayoutAlias('rss', 'rss.njk');
    eleventyConfig.addLayoutAlias('rssxsl', 'rss.xsl.njk');
    eleventyConfig.addLayoutAlias('json', 'json.njk');
    eleventyConfig.addLayoutAlias('manifest', 'manifest.njk');
    eleventyConfig.addLayoutAlias('home', 'home.njk');
    eleventyConfig.addLayoutAlias('page', 'page.njk');
    eleventyConfig.addLayoutAlias('post', 'post.njk');
    eleventyConfig.addLayoutAlias('posts', 'posts.njk');

    // Virtual Templates ------------------------------

    const cssTemplate = fs.readFileSync(path.resolve('theme/css/', 'bundle.njk'), 'utf-8');
    const jsTemplate = fs.readFileSync(path.resolve('theme/js/', 'bundle.njk'), 'utf-8');
    const robotsTemplate = fs.readFileSync(path.resolve('_11ty/templates/', 'robots.njk'), 'utf-8');
    const sitemapTemplate = fs.readFileSync(path.resolve('_11ty/templates/', 'sitemap.njk'), 'utf-8');

    eleventyConfig.addTemplate('css-bundle.njk', cssTemplate);
    eleventyConfig.addTemplate('js-bundle.njk', jsTemplate);
    eleventyConfig.addTemplate('robots.njk', robotsTemplate);
    eleventyConfig.addTemplate('sitemap.njk', sitemapTemplate);

    const feedTemplate = fs.readFileSync(path.resolve('_11ty/templates/', 'feed.njk'), 'utf-8');
    const feedXSLTemplate = fs.readFileSync(path.resolve('_11ty/templates/', 'feed.xsl.njk'), 'utf-8');
    const feedJSONTemplate = fs.readFileSync(path.resolve('_11ty/templates/', 'feed.json.njk'), 'utf-8');
    const manifestTemplate = fs.readFileSync(path.resolve('_11ty/templates/', 'manifest.njk'), 'utf-8');

    for (let [key, local] of Object.entries(locales)) {
        eleventyConfig.addTemplate(key + '-feed.njk', feedTemplate, { lang: key });
        eleventyConfig.addTemplate(key + '-feed.xsl.njk', feedXSLTemplate, { lang: key });
        eleventyConfig.addTemplate(key + '-feed.json.njk', feedJSONTemplate, { lang: key });
        eleventyConfig.addTemplate(key + '-manifest.njk', manifestTemplate, { lang: key });
    }
    
    // Plugins ----------------------------------------

    await eleventyConfig.addPlugin(pluginRSS);
    eleventyConfig.addPlugin(drafts);
    eleventyConfig.addPlugin(EleventyHtmlBasePlugin);
    eleventyConfig.addPlugin(EleventyRenderPlugin);
    eleventyConfig.addPlugin(EleventyI18nPlugin, { defaultLanguage: 'en' });
    eleventyConfig.addPlugin(pluginSyntaxHighlight);
    eleventyConfig.addPlugin(pluginEmbedEverything, {
        use: ['twitter', 'youtube', 'vimeo'],
        twitter: {
            options: {
                embedClass: 'oembed oembed-twitter',
                doNotTrack: true
            }
        },
        vimeo: {
            options: {
                embedClass: 'oembed oembed-vimeo',
                //wrapperStyle
            }
        },
        youtube: {
            options: {
                embedClass: 'oembed oembed-youtube',
                modestBranding: true,
                lazy: true,
                lite: {
                    thumbnailQuality: 'maxresdefault',
                    css: {
                        inline: true
                    },
                    js: {
                        inline: true
                    }
                }
            }
        }
    });

    // Transforms -------------------------------------

    eleventyConfig.addPlugin(transformCSS);
    eleventyConfig.addPlugin(transformHTML);
    eleventyConfig.addPlugin(transformJS);

    // Shortcodes --------------------------------------

    eleventyConfig.addShortcode('version', () => `${+ new Date()}`);
    eleventyConfig.addShortcode('year', () => `${new Date().getFullYear()}`);
    eleventyConfig.addShortcode('build', () => `${new Date().toISOString().split('T')[0]}`);
    eleventyConfig.addShortcode('image', image);

    // Filters ----------------------------------------

    eleventyConfig.addFilter('base64', base64);
    eleventyConfig.addFilter('cdnify', cdnify);
    eleventyConfig.addFilter('formatDate', formatDate);
    eleventyConfig.addFilter('languageFilter', languageFilter);
    eleventyConfig.addFilter('mimetype', mimetype);
    eleventyConfig.addFilter('random', random);
    eleventyConfig.addFilter('readingTime', readingTime);
    eleventyConfig.addFilter('translate', translate);
    eleventyConfig.addFilter('sort', sort);
    eleventyConfig.addFilter('where', where);

    // Passthrough -------------------------------------

    eleventyConfig.addPassthroughCopy({'./content/assets/files': './assets/files'})
    eleventyConfig.addPassthroughCopy({'./content/assets/img': './assets/img'})
    eleventyConfig.addPassthroughCopy({'./theme/fonts': './assets/fonts'})

    // Markdown ----------------------------------------

    eleventyConfig.setLibrary('md', markdownIt({
        html: true,
        linkify: true,
        typographer: true
    }));

    eleventyConfig.amendLibrary('md', (mdLib) => {
        mdLib.use(markdownItIns);
        mdLib.use(markdownItMark);
        mdLib.use(markdownItSub);
        mdLib.use(markdownItSup);
    });

    // 11ty Settings -----------------------------------

    return {
        markdownTemplateEngine: 'njk',
        htmlTemplateEngine: 'njk',
        dataTemplateEngine: 'njk',
    
        // If your site deploys to a subdirectory, change `pathPrefix`
        pathPrefix: '/',

        dir: {
            input: 'content',
            output: 'dist',
            data: '_data',
            includes: '../theme/_includes',
            layouts: '../theme/_layouts'
        }
    }
}