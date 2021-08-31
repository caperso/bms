const { program } = require("../node_modules/commander");
const fs = require("fs");
const path = require("path");

const getDefaultDate = () => {
  const date = new Date();
  let month = date.getMonth() + 1;
  month = month < 10 ? `0${month}` : `month`;
  return `${date.getFullYear()}${month}${date.getDate()}`;
};

const defaultUrl = "https://github.com/caperso";
const defaultAuthor = "Yao";
const defaultAuthorTitle = "senior developer";
const defaultAvatar =
  "https://avatars.githubusercontent.com/u/34877623?s=400&u=8da3f1b8199cdbd5591ea229149fa663f2011065&v=4";
const defaultTitle = "Untitled";

const standardMarkdownTemplate = (payload) => {
  const {
    name,
    title = defaultTitle,
    author = defaultAuthor,
    authorTitle = defaultAuthorTitle,
    authorPage = defaultUrl,
    avatar = defaultAvatar,
    tags = [],
  } = payload;

  const template = `---\nslug: ${
    name || getDefaultDate()
  } \ntitle: ${title} \nauthor: ${author} \nauthor_title: ${authorTitle}\nauthor_url: ${authorPage}\nauthor_image_url: ${avatar} \ntags: [${tags.join()}]\n---
`;

  return template;
};

/**
 * create
 * @param {*} name
 * @param {*} styleType
 * @param {boolean} isMobx
 */
function create(targetPath, { name }) {
  //  generate file contents
  const content = standardMarkdownTemplate({ name });
  fs.writeFileSync(
    path.resolve(targetPath, `${getDefaultDate()}-${name}.md`),
    content
  );

  console.log(`Success: Templated markdown generated!`);
  process.exit(0);
}

const targetPath = path.resolve(process.cwd(), "./blog/in-progress");

program
  .command("g")
  .description("Generate a template Markdown")
  .option("-n, --filename <filename>", "Name of your new markdown")
  .action(function (cmd) {
    const { filename } = cmd;
    console.log(cmd);
    try {
      fs.accessSync(targetPath);
      create(targetPath, { name: filename });
    } catch (e) {
      console.error(e);
    }
  });

program.parse(process.argv);
