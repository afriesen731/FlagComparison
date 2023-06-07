const path = require('path');



module.exports = {
    mode: 'development', // production or development (maybe other)
    entry: './src/index.js', // where webpack looks for js files
    output: {
        path: path.resolve(__dirname, 'dist'), // absolute path to output
        filename: 'bundle.js' // the name of the file to put the output into
    },
    watch: true // checks index.js for changes
}   