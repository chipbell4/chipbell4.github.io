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

console.log("Hello world");
```

## Converting File Contents Into Exports

## Adding Metadata

## The Final Product

## Conclusion
