const bcrypt = require('bcrypt');


const salt1 = bcrypt.genSaltSync(10);
const encryptedPass1 = bcrypt.hashSync('swordfish', salt1);

console.log('swordfish ->' + encryptedPass1);



const salt2 = bcrypt.genSaltSync(10);

const encryptedPass2 = bcrypt.hashSync('swordfish', salt2);

console.log('salt  :' + salt2);
console.log('swordfish2  ->' + encryptedPass2);
