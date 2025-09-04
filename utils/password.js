const bcrypt=require("bcrypt");
async function hashPassword(plainPasword) {
    const saltround=10;
    return await bcrypt.hash(plainPasword,saltround);
}
async function hashCompare(plainPasword,hash) {
    return await bcrypt.compare(plainPasword,hash);
}
module.exports={hashPassword,hashCompare};