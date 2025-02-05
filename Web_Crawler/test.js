let key_words = ['ikea', 'crab'];
let url = "https://ikea is bad/f.sdsfs";
let is_pr = key_words.some(key => url.includes(key));
console.log(is_pr);