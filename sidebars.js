const fs = require('fs');

let sw6 = fs.readdirSync(`${__dirname}/docs/`);
sw6 = sw6.map((v) => '' + v.replace('.md', ''));

module.exports = {
  someSidebar: {
    'Shopware 6': sw6,
  },
};