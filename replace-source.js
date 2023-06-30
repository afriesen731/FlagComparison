const fs = require('fs');
const path = require('path');
const {
  glob,
  globSync,
  globStream,
  globStreamSync,
  Glob,
} = require('glob')


function processHtmlFiles(directory) {
  // Use glob to get all HTML files in the directory
  const pattern =  `${directory}/*.html`;
  
  const htmlFiles = globSync(pattern);

  // console.log(pattern)

  htmlFiles.forEach((filePath) => {
    // Read the contents of the HTML file
    const contents = fs.readFileSync(filePath, 'utf8');
    // console.log(contents)
    // Replace the links or script tags with the filename as the replacement
    const updatedContents = contents.replace(/<link.*?href="..\/*\/(.*?)".*?>/g, (match, p1) => {
      const filename = path.basename(p1);
      const matchCopy = match.slice()
      let newRef = matchCopy.replace(/href="..\/*\/(.*?)"/g, `href="${filename}"`);
      return newRef;
    }).replace(/<script.*?src="..\/*\/(.*?)".*?><\/script>/g, (match, p1) => {
      const filename = path.basename(p1);
      const matchCopy = match.slice()
      let newRef = matchCopy.replace(/src="..\/*\/(.*?)"/g, `src="${filename}"`);
      return newRef;
    });

    // Write the updated contents back to the file
    fs.writeFileSync(filePath, updatedContents, 'utf8');

    console.log(`Processed file: ${filePath}`);
  });

  console.log('All HTML files processed successfully.');
}

// Example usage:
const directory = 'public';


processHtmlFiles(directory);
