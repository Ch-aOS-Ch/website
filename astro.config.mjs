import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import tailwindcss from '@tailwindcss/vite';
import mkdocsIntegration, { remarkMkdocsAdmonitions, vitePluginMkdocsAdmonitions } from './src/plugins/remark-mkdocs.mjs';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chaosDark, chaos } from './src/themes/index.mjs';

const siteArgIndex = process.argv.indexOf('--site');
const cliSite = siteArgIndex !== -1 ? process.argv[siteArgIndex + 1] : undefined;
const site = cliSite ?? process.env.PUBLIC_SITE_URL ?? 'https://Ch-aOS-Ch.github.io';

const baseArgIndex = process.argv.indexOf('--base');
const cliBase = baseArgIndex !== -1 ? process.argv[baseArgIndex + 1] : undefined;
const base = cliBase ?? process.env.ASTRO_BASE ?? process.env.PUBLIC_BASE_PATH ?? '/Ch-aOS';
const cleanBase = base === '/' ? '' : base.replace(/\/$/, '');

export default defineConfig({
  site,
  base,
  markdown: {
    remarkPlugins: [remarkMkdocsAdmonitions],
    shikiConfig: {
      themes: {
        dark: chaosDark,
        light: chaos,
      },
    },
  },
  vite: {
    plugins: [tailwindcss(), vitePluginMkdocsAdmonitions()],
  },
  integrations: [
    mkdocsIntegration(),
    starlight({
      title: 'Ch-aOS',
      favicon: '/favicon.svg',
      logo: {
        src: './src/assets/logo.svg',
      },
      description: 'Unified Fleet Management, Pelago IaC & Plug-and-Play Souls Ecosystem',
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/Ch-aOS-Ch/Ch-aOS' },
      ],
      customCss: ['./src/styles/global.css'],
      head: [
        {
          tag: 'script',
          attrs: {
            src: `${cleanBase}/code-shader.js?v=2.5`,
            defer: true,
          },
        },
      ],
      expressiveCode: {
        themes: [chaosDark, chaos],
        styleOverrides: {
          codeCommentFontStyle: 'italic',
        },
      },
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            { label: 'Introduction', slug: 'introduction' },
            { label: 'Getting Started', slug: 'getting-started' },
            { label: 'Core Concepts', slug: 'core-concepts' },
            { label: 'The Chopping Board', slug: 'chopping-board' },
            { label: 'Glossary', slug: 'glossary' },
            { label: 'Contributing', slug: 'contributing' },
          ],
        },
        {
          label: 'Commands',
          items: [
            { label: 'chaos apply', slug: 'commands/apply' },
            { label: 'chaos explain', slug: 'commands/explain' },
            { label: 'chaos management', slug: 'commands/management' },
            { label: 'chaos provision', slug: 'commands/provision' },
            { label: 'chaos ramble', slug: 'commands/ramble' },
            { label: 'chaos secrets', slug: 'commands/secrets' },
            { label: 'chaos styx', slug: 'commands/styx' },
            { label: 'chaos team', slug: 'commands/team' },
          ],
        },
        {
          label: 'Advanced',
          items: [
            { label: 'Fleet Management', slug: 'advanced/fleet' },
            { label: 'Boats for your Fleet', slug: 'advanced/boats' },
            { label: 'Pelago IaC', slug: 'advanced/pelago' },
            { label: 'Pyinfra Connectors', slug: 'advanced/connectors' },
            { label: 'Secret Providers', slug: 'advanced/providers' },
            { label: 'Logbook', slug: 'advanced/logbook' },
            { label: 'Composability', slug: 'advanced/composability' },
            {
              label: 'SDK',
              items: [
                { label: 'Overview', slug: 'advanced/sdk/overview' },
                { label: 'Orchestration', slug: 'advanced/sdk/orchestration' },
                { label: 'Fleet Management', slug: 'advanced/sdk/fleet' },
                { label: 'Interfaces and Flags', slug: 'advanced/sdk/interfaces_and_flags' },
                { label: 'Secrets', slug: 'advanced/sdk/secrets' },
                { label: 'Ramble', slug: 'advanced/sdk/ramble' },
                {
                  label: 'Reference',
                  items: [{ autogenerate: { directory: 'advanced/sdk/reference' } }],
                }
              ]
            }
          ]
        },
        {
          label: 'Souls',
          items: [
            { label: 'Provider Souls', slug: 'souls/provider-plugins' },
            { label: 'Registry', slug: 'souls/styx' },
            { label: 'Development', slug: 'souls/development' },
            { label: 'Connector Development', slug: 'souls/connectors' },
            { label: 'Roles', slug: 'souls/roles' },
            { label: 'Isles', slug: 'souls/isles' },
            { label: 'Limani', slug: 'souls/limani' },
          ]
        }
      ],
    }),
  ],
});
