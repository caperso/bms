const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
  title: "Multi Disturbances",
  tagline: "Dinosaurs are cool",
  url: "https://mds.vercel.app",
  baseUrl: "/",
  onBrokenLinks: "warn",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.ico",
  organizationName: "caperso", // Usually your GitHub org/user name.
  projectName: "mds", // Usually your repo name.
  themeConfig: {
    navbar: {
      title: "Multi Disturbances",
      logo: {
        alt: "My Site Logo",
        src: "img/logo.svg",
      },
      items: [
        { to: "/blog", label: "Blog", position: "right" },
        {
          href: "https://github.com/caperso",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    // footer: {
    //   style: "dark",
    //   links: [],
    //   copyright: `Copyright © ${new Date().getFullYear()} Built with Docusaurus.`,
    // },
    prism: {
      theme: lightCodeTheme,
      darkTheme: darkCodeTheme,
    },
  },
  presets: [
    [
      "@docusaurus/preset-classic",
      {
        blog: {
          path: "./blog",
          routeBasePath: "/",
          showReadingTime: true,
          editUrl: "https://github.com/caperso",
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      },
    ],
  ],
};
