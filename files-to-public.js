




const fs = require('fs');
const path = require('path');

function copyFiles(sourceDir, destinationDir) {
  // Create the destination directory if it doesn't exist
  if (!fs.existsSync(destinationDir)) {
    fs.mkdirSync(destinationDir, { recursive: true });
  }

  // Read the files in the source directory
  const files = fs.readdirSync(sourceDir);

  // Iterate over the files
  files.forEach((file) => {
    const sourcePath = path.join(sourceDir, file);
    

    // Get the file's stats
    const stats = fs.statSync(sourcePath);

    if (stats.isFile()) {
      // If it's a file, copy it to the destination directory
      fs.copyFileSync(sourcePath, `${destinationDir}/${file}`);
      console.log(`Copied file: ${sourcePath} to ${destinationDir}/${file}`);
    } else if (stats.isDirectory()) {
      // If it's a directory, recursively copy its contents
      copyFiles(sourcePath, destinationDir);
    }
  });
}

// Example usage:
const sourceDirectory = './dist';
const destinationDirectory = './public';

copyFiles(sourceDirectory, destinationDirectory);
