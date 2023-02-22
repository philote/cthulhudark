let fs = require('fs');
console.log(JSON.parse(fs.readFileSync('./system.json', 'utf-8')).version);