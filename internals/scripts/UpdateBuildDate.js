#!/usr/bin/env node
console.log("dasssssssss");
var packageJson = require("../../package.json");

function add(a, b) {
    return parseInt(a)+parseInt(b);
}

if(!process.argv[2] || !process.argv[3]) {
    console.log('Insufficient number of arguments! Give two numbers please!');
}

else {
    console.log('The sum of', process.argv[2], 'and', process.argv[3], 'is', add(process.argv[2], process.argv[3]));
} 

console.log(packageJson.buildDate);
packageJson.buildDate = "asdasda";
console.log(packageJson.buildDate);
var fs = require("fs");
fs.writeFile("../../package.json",packageJson,(err) => console.log(err));