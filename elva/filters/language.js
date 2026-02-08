export default function languageFilter(collection, lang) {
    if (!Array.isArray(collection)) return [];
    if (!lang) lang = this.page.lang || this.ctx.lang;
    const filtered = collection.filter(item => item.page.lang == lang);
    return filtered;
}