const { program } = require("../node_modules/commander");
const fs = require("fs");
const path = require("path");

const getDefaultEndpoint = () => {
  const date = new Date();
  return `${date.getFullYear()}${date.getMonth() + 1}${date.getDate()}`;
};

const defaultUrl = "https://github.com/caperso";
const defaultAuthor = "Yao";
const defaultAuthorTitle = "senior developer";
const defaultAvatar =
  "https://avatars.githubusercontent.com/u/34877623?s=400&u=8da3f1b8199cdbd5591ea229149fa663f2011065&v=4";

const standardMarkdownTemplate = (payload) => {
  const {
    name,
    title,
    author,
    authorTitle,
    authorPage,
    avatar,
    tags = [],
  } = payload;

  const template = `
    ---
    slug: ${name || getDefaultEndpoint()} 
    title: ${title || "Untitled"} 
    author: ${author || defaultAuthor} 
    author_title: ${authorTitle || defaultAuthorTitle}
    author_url: ${authorPage || defaultUrl}
    author_image_url: ${avatar || defaultAvatar} 
    tags: [${tags.join()}]
    ---
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
  fs.writeFileSync(path.resolve(targetPath, `${name}.md`), content);

  console.log(`Success: Templated markdown generated!`);
  process.exit(0);
}

const targetPath = path.resolve(process.cwd(), "./blog/in-progress");

// create(targetPath, { name: "test" });

program
  .command("g")
  .description("Generate a template Markdown")
  .option("-n", "--name <name>", "Filename")
  .action(function (cmd) {
    const { name } = cmd;
    console.log(111);
    try {
      fs.accessSync(targetPath);
      create(targetPath, { name });
    } catch (e) {
      console.error(e);
    }
  });
