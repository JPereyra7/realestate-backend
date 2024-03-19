// const { userslogin } = require('sequelize');
// const bcrypt = require("bcrypt");

// async function createAccount(req, res) {
//     const { username, password, passwordIgen } = req.body;
//     const existingUser = await userslogin.findOne({
//         where: {
//             username: req.body.username,
//         },
//     });
//     if (existingUser) {
//         return res.status(401).send("User already exists");
//     }
//     if (password !== passwordIgen) {
//         res.status(401).json({ Error: "Password did not match" });
//         return;
//     } else {
//         const hashedPassword = await bcrypt.hash(password, 10);
//         await userslogin.create({
//             username: username,
//             password: hashedPassword,
//             passwordIgen: hashedPassword,
//         });
//     }
//     res.status(201).json({ Success: "Account created successfully ✅" });
// }

// module.exports = {
//     createAccount,
// }