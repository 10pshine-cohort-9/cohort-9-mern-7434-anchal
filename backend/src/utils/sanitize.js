const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

const sanitizeNoteContent = (content) => {
    return DOMPurify.sanitize(content || '');
};

module.exports = {
    sanitizeNoteContent,
};