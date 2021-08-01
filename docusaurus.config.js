const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
  title: "Many disturbances",
  tagline: "Dinosaurs are cool",
  url: "https://your-docusaurus-test-site.com",
  baseUrl: "/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.ico",
  organizationName: "caperso", // Usually your GitHub org/user name.
  projectName: "mds", // Usually your repo name.
  themeConfig: {
    navbar: {
      title: "Many Disturbances",
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
          // Please change this to your repo.
          editUrl:
            "https://github.com/caperso",
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      },
    ],
  ],
};
