const fs = require('fs');

let sw5 = fs.readdirSync(`${__dirname}/docs/shopware-5`);
let sw6 = fs.readdirSync(`${__dirname}/docs/shopware-6`);
sw5 = sw5.map((v) => 'shopware-5/' + v.replace('.md', ''));
sw6 = sw6.map((v) => 'shopware-6/' + v.replace('.md', ''));

module.exports = {
  someSidebar: {
    'Shopware 6': sw6,
    'Shopware 5': sw5
  },
};