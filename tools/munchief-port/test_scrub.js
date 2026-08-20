/* Harness for the ported chaos-banner scrub: stubs just enough DOM to prove
   the loop tracks scroll position, composes with the existing transform, and
   idles once the section leaves the viewport. */
const fs = require('fs');
const path = require('path');

const src = fs.readFileSync('D:/Github/munchief/assets/munchief-animations.js', 'utf8');
const start = src.indexOf('  function initChaosScrollScrub() {');
const end = src.indexOf('  function animateChaosFooterTransition() {');
const code = src.slice(start, end);

const content = { style: {} };
const image = { style: {} };
let rect = { top: 800, bottom: 2000, height: 1200 };
const banner = {
  getBoundingClientRect: () => rect,
  querySelector: (s) => (s.includes('content') ? content : image)
};

let observer = null;
const frames = [];

global.window = { innerHeight: 900, matchMedia: () => ({ matches: false }), addEventListener: () => {} };
global.document = { querySelectorAll: () => [banner] };
global.requestAnimationFrame = (f) => frames.push(f);
global.getComputedStyle = (el) => ({
  transform: el === content ? 'matrix(1, 0, 0, 1, -230, 0)' : 'none'
});
global.IntersectionObserver = class {
  constructor(cb) { this.cb = cb; observer = this; }
  observe() {}
};

var lenis = null;
eval('(function(){' + code + ' initChaosScrollScrub(); })()');

const step = () => { const f = frames.shift(); if (f) f(); };

console.log('on init (off screen) ->', image.style.transform);

observer.cb([{ isIntersecting: true }]);
step();
rect = { top: -200, bottom: 1000, height: 1200 };
step();
console.log('scrolled halfway     ->', content.style.transform, '||', image.style.transform);

rect = { top: -1100, bottom: 100, height: 1200 };
step();
console.log('nearly past          ->', content.style.transform, '||', image.style.transform);

observer.cb([{ isIntersecting: false }]);
step();
step();
console.log('after leaving view   -> queued frames:', frames.length, '(0 = loop idle)');
