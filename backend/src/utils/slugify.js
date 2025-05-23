// utils/slugify.js
module.exports = function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9 -]/g, '')   // Harf, rakam, tire ve boşluk dışındaki karakterleri kaldır
    .trim()
    .replace(/\s+/g, '-')          // Boşlukları tireye çevir
    .replace(/-+/g, '-');          // Çoklu tireleri teke indir
};
