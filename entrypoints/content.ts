export default defineContentScript({
  matches: ['http://*/*', 'https://*/*', '*://*/*'],
  main() {},
});
