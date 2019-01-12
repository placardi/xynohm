const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const dom = new JSDOM();

dom.reconfigure({
  url: 'https://test.com/'
});

global.window = dom.window;
global.document = dom.window.document;
global.location = dom.window.location;
global.history = dom.window.history;
