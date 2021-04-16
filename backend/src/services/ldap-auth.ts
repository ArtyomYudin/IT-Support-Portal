// import jwt from 'jsonwebtoken';
import * as ldap from 'ldapjs';

export function checkUserCredentials(reqBody: string, res: any): any {
  const postReq = {
    email: JSON.parse(reqBody).email,
    password: JSON.parse(reqBody).password,
  };

  const ldapClient = ldap.createClient({
    url: 'ldap://172.20.19.18:389',
  });

  ldapClient.bind('cn=root', 'secret', err => {
    ldapClient.unbind();
    console.log('binding failed', err);
  });

  return null;
}

/*
const login = async (req, res) => {
  const { username, password } = req.body;
  // Check if empty request body
  if (!req.body || !username || !password) return res.status(400).json({ error: { message: 'Bad Request: empty data' } });
  // Check login info
  const user = await User.findOne({ username });
  if (!user) return res.status(401).json({ error: { message: 'Invalid Username' } });
  const isValidPassword = crypto.pbkdf2Sync(password, SALT, 1000, 64, 'sha512').toString('hex') === user.password;
  if (!isValidPassword) return res.status(401).json({ error: { message: 'Invalid Password' } });
  // Sign JWT and send it to Client
  const token = jwt.sign({ uid: user.get('_id') }, JWT_KEY, { expiresIn: '5m' });
  return res.status(200).json({ data: { token } });
};
*/
