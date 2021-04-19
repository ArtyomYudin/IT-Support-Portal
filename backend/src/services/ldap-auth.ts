import jwt from 'jsonwebtoken';
import * as ldap from 'ldapjs';
import { ServerResponse } from 'http';
import { config } from 'dotenv';
config();

export function checkUserCredentials(reqBody: string, res: ServerResponse): any {
  const ldapClient = ldap.createClient({
    url: 'ldap://172.20.19.18:389',
  });

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
    // 'Access-Control-Max-Age': 2592000, // 30 days
  };

  const { email, password } = JSON.parse(reqBody);
  if (!reqBody || !email || !password) {
    res.statusCode = 400;
    res.statusMessage = JSON.stringify({ Error: true, Message: 'Bad Request: empty data' });
    Object.entries(headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    res.end();
  }
  ldapClient.bind(email, password, (err: any) => {
    if (err) {
      ldapClient.unbind();
      res.statusCode = 400;
      res.statusMessage = JSON.stringify({ Error: true, Message: 'wrong email/password combination' });
      Object.entries(headers).forEach(([key, value]) => {
        res.setHeader(key, value);
      });
      res.end();
    } else {
      // Sign JWT and send it to Client
      // const token = jwt.sign({ uid: user.get('_id') }, JWT_KEY, { expiresIn: '5m' });
      //return res.status(200).json({ data: { token } });
      console.log(email);
      const userToken = jwt.sign({ email }, process.env.JWT_SECRET!, {
        expiresIn: '1h',
        subject: 'IT-Support-Portal',
      });
      res.statusCode = 200;
      Object.entries(headers).forEach(([key, value]) => {
        res.setHeader(key, value);
      });
      res.end(
        JSON.stringify({
          //   id: userId,
          //   email: rows[0].email,
          //   firstName: rows[0].first_name,
          //   lastName: rows[0].last_name,
          //   accessRole: rows[0].access_role,
          token: userToken,
        }),
      );
      console.log('binding success');
    }
  });
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
