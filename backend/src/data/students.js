// Accounts that can sign in. There is no database and no sign-up page: the demo
// account below is shared with evaluators directly (not shown on the website).
// Only a bcrypt HASH of each password is stored here, never the password itself.
//
// To add an account or change a password, make a new hash with:
//   node -e "console.log(require('bcryptjs').hashSync('NEW-PASSWORD', 10))"
export const students = [
  {
    _id: 'demo-student',
    name: 'Demo Student',
    registrationNumber: '12345678',
    program: 'B.Tech CSE (Demo)',
    passwordHash: '$2b$10$piaidaGsT4ukRtF0bjof2O7AaWyKx2E.3O94Q.8wNBDkDM7TDJW6O',
  },
];
