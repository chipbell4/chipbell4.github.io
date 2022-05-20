---
layout: post
title: "Importing Files as Strings"
date: 2022-05-01 15:23:59
categories: javascript
---

## Overview
A lot of build tools have the ability to do "file transforms" where a file with a particularly non-JavaScript extension (like CSS or GLSL shaders) is converted into an "importable" JavaScript file.
This is a handy feature, but sometimes (actually _most_ times) I don't really want to use a large build tool to do that work.
So, I thought I'd share an approach I've used in the past to make a text file importable as an ES6 module.

## Some Goals
Let's define a few goals for this script:
- It should take an input file with any extension, and create a new file with a `.js` extension. So, `file.css` should become `file.css.js` for instance.
- It should preserve some metadata about the original file: When was the conversion done, what was the original path to the file, etc.
- It should probably avoid a bunch of unnecessary dependencies. We're avoiding the use of a build tool here, so this script should ideally be as portable as possible to maximize reuse with as little setup as possible.
- It will have a clever name. Because. Let's use `jsify` for now. Is that taken? Probably...

## Parsing inputs
Let's keep the arguments simple, and invocation should look something like this: `jsify path/to/file.css output/path`.
This should create file called `output/path/file.css.js`.

Here's some initial argument parsing to get that loaded
```javascript
#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

/**
 * A helper function to log and exit when a failure occurs
 */
function failWithUsageMessage() {
  console.log("Usage:\n  jsify path/to/input.ext output/directory");
  process.exit(0);
}

// Verify that the user provided the right number of args
if (process.argv.length < 4) {
  failWithUsageMessage();
}

// Get the absolute path to the inputs provided
const inputFile = path.resolve(process.argv[2]);
const outputDirectory = path.resolve(process.argv[3]);

// This array contains a list of any validation errors we found when attempting
// to check that the input file and output directory exist
let errors = [];

// confirm that the input file exists and is a file
const inputStats = fs.statSync(inputFile, { throwIfNoEntry: false });
if (inputStats === undefined) {
  errors.push(`Provided file ${process.argv[2]} doesn't exist`);
} else if (!inputStats.isFile()) {
  errors.push(`Provided file ${process.argv[2]} is not a file`);
}

// confirm that the output file exists and is a directory
const outputStats = fs.statSync(outputDirectory, { throwIfNoEntry: false });
if (outputStats === undefined) {
  errors.push(`Provided output directory ${process.argv[3]} doesn't exist`);
} else if (!outputStats.isDirectory()) {
  errors.push(
    `Provided output directory ${process.argv[3]} is not a directory`
  );
}

// if we encountered any errors, log them then bail out
if (errors.length > 0) {
  console.warn("Error:");
  errors.forEach((message) => console.warn("  " + message));
  failWithUsageMessage();
}

// TODO: More stuff to come!
console.log("Everything is valid: ", inputFile, outputDirectory);
```

Some highlights:
- We use `path.resolve` to get the absolute path to the file
- We verify the provided input file and output directory exist, and are the right type of file. We bail otherwise.

## Converting File Contents Into Exports
Now the fun part, converting the file into JavaScript.
For our example, we'll use a tiny HTML file. Here's out example file:
```html
<p class="greeting" id='abc'>Hello World!</p>
```

Note that this file has double-quotes and single-quotes in it.
So, we won't be able to read the contents and wrap it in a string directly.
However, there's a clever way to do this:

Let's do a quick conversion of that with a little usage of the `fs` module:
```javascript
const newFileName = path.basename(inputFile) + ".js";
const newFullPath = path.join(outputDirectory, newFileName);

const contents = fs.readFileSync(inputFile, { encoding: "utf8" });
const outputContents = `export const contents = ${JSON.stringify(contents)};`;
fs.writeFileSync(newFullPath, outputContents);
```

We first build an absolute path to our target directory/file.
We then read the file in, and convert it into a string a JavaScript code, _serializing the string as JSON_.
Lastly, we write the file out to the target file `newFullPath`.
The results look like this for the given HTML snippet above:
```javascript
export const contents = "<p class=\"greeting\" id='abc'>Hello World!</p>\n";
```

## Adding Metadata
Let's also add two pieces of metadata: The original file's path and when the file was created.
We'll update our snippet above:
```javascript
const contents = fs.readFileSync(inputFile, { encoding: "utf8" });
const outputContents = `
  export const contents = ${JSON.stringify(contents)};
  export const buildTime = new Date(${Date.now()});
  export const originalPath = "${inputFile}";
`;
fs.writeFileSync(newFullPath, outputContents);
```

## The Final Product
Okay, here's the final script!
```javascript
#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

/**
 * A helper function to log and exit when a failure occurs
 */
function failWithUsageMessage() {
  console.log("Usage:\n  jsify path/to/input.ext output/directory");
  process.exit(0);
}

// Verify that the user provided the right number of args
if (process.argv.length < 4) {
  failWithUsageMessage();
}

// Get the absolute path to the inputs provided
const inputFile = path.resolve(process.argv[2]);
const outputDirectory = path.resolve(process.argv[3]);

// This array contains a list of any validation errors we found when attempting
// to check that the input file and output directory exist
let errors = [];

// confirm that the input file exists and is a file
const inputStats = fs.statSync(inputFile, { throwIfNoEntry: false });
if (inputStats === undefined) {
  errors.push(`Provided file ${process.argv[2]} doesn't exist`);
} else if (!inputStats.isFile()) {
  errors.push(`Provided file ${process.argv[2]} is not a file`);
}

// confirm that the output file exists and is a directory
const outputStats = fs.statSync(outputDirectory, { throwIfNoEntry: false });
if (outputStats === undefined) {
  errors.push(`Provided output directory ${process.argv[3]} doesn't exist`);
} else if (!outputStats.isDirectory()) {
  errors.push(
    `Provided output directory ${process.argv[3]} is not a directory`
  );
}

// if we encountered any errors, log them then bail out
if (errors.length > 0) {
  console.warn("Error:");
  errors.forEach((message) => console.warn("  " + message));
  failWithUsageMessage();
}

// Build the target output path for the new importable file
const newFileName = path.basename(inputFile) + ".js";
const newFullPath = path.join(outputDirectory, newFileName);

// read the file contents
const contents = fs.readFileSync(inputFile, { encoding: "utf8" });

// Convert it into importable JS and write it out
const outputContents = `
  export const contents = ${JSON.stringify(contents)};
  export const buildTime = new Date(${Date.now()});
  export const originalPath = "${inputFile}";
`;
fs.writeFileSync(newFullPath, outputContents);
```

Nice!
This little helper script now takes any file you give it, and makes the files contents importable into JavaScript.
This can be helpful as a build step for converting static assets like templates, stylesheets, and shaders to be loaded at runtime with `import` statements rather than `fetch`.
Enjoy!
