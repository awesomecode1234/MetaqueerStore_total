require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const reqHandler = require('./helpers/request')();
const responseCodes = require('./config/response_codes.json');

Database = require('./helpers/database');

app.set('trust proxy', 1);
//app.get('/ip', (request, response) => response.send(request.ip));
//app.get('/x-forwarded-for', (request, response) => response.send(request.headers['x-forwarded-for']));

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => 
{
  const errors = validationResult(req);
  if (!errors.isEmpty()) 
  {
      let result = req.resHandler.payload(false, 400, res.response_codes['400'], { errors: errors.array() });
      return req.resHandler.output(result, 200, 'application/json');
  }
  next();
};

const dbConfig = 
{
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

// Create a new instance of the Database class
const db = new Database(dbConfig);

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json());

app.use((req, res, next) => 
{
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, UUID');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS')
  {
    res.sendStatus(200);
  } 
  else 
  {
    next();
  }
});

app.use((req, res, next) => 
{
  if (req.method === 'OPTIONS') 
  {
    next(); // Skip the redirect for OPTIONS requests
  } 
  else if (req.path.substr(-1) !== '/' && req.path.length > 1) 
  {
    const query = req.url.slice(req.path.length);
    res.redirect(307, req.path + '/' + query);
  } 
  else 
  {
    next();
  }
});

// various listeners
app.use((req, res, next) => 
{
  //res.reqHandler = reqHandler;
  res.response_codes = responseCodes;
  //req.db = db;
  req.session = Math.random().toString(36).substring(2 , 12);
	req.logger = require('./helpers/logger')(req.session);
	req.resHandler = require('./helpers/response')(res);
	req.logger.request('Started processing ' + req.method + 
    ' request from ' + req.socket.remoteAddress + ' => ' + req.url);
	res.on('finish', function() 
	{
		req.logger.request('Finished processing ' + req.method + 
      ' request from ' + req.socket.remoteAddress + ' => ' + req.url);
	});
	res.on('timeout', function() 
	{
		req.logger.error( 'Request timeout ' + 
			req.socket.remoteAddress + ' => ' + req.url );
    let result = req.resHandler.timeout(408, responseCodes['408'], {});
		res.header('Content-Type', 'application/json');
		res.status(408).send(result);
	} );
	res.on('close', function() 
	{
		req.logger.simple('Closed connection');
	});
	next();
});

if (process.env.ENVIRONMENT === 'prod')
{
  // Apply the rate limiter to all requests
  app.use(rateLimit(
  {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Max 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later',
    handler: (req, res, next) => 
    {
      let result = req.resHandler.payload(false, 429, res.response_codes['429'], {});
      req.resHandler.output(result, 429, 'application/json');
    }
  }));
}
/*
** method: GET
** uri: /
*/
app.get('/', (req, res) => 
{
  let result = req.resHandler.payload(true, 200, "nft market api", {});
  req.resHandler.output(result, 200, 'application/json');
});
/*
** method: GET
** uri: /env
*/
app.get('/env', (req, res) => 
{
  let result = req.resHandler.payload(true, 200, "nft market api", { env: process.env.ENVIRONMENT });
  req.resHandler.output(result, 200, 'application/json');
});
/*
** method: GET
** uri: /user 
** params: email
*/
app.get('/user', reqHandler.checkAuthorization, async (req, res) => 
{
  if (req.user.email === null)
  {
    let result = req.resHandler.payload(false, 500, res.response_codes['500'], data);
    req.resHandler.output(result, 500, 'application/json');
  }
  try 
  {
    let data = await db.query('SELECT * from users WHERE email = ?', [req.user.email]);
    if (data.length == 0) // we should insert a new user
    {
      let insertQuery = 'INSERT INTO users (firstName, lastName, email, avatar, art_name, status) VALUES (?, ?, ?, ?, ?)';
      const randomNumber = Math.floor(Math.random() * 8) + 1;
      const avatarFilename = `${randomNumber}.jpg`;
      let userData = [req.user.firstname, req.user.lastname, req.user.email, avatarFilename, 'Anonymous', 1];
      try 
      {
        await db.query(insertQuery, userData);
        req.logger.msg('New user inserted successfully:', userData);
        data = await db.query('SELECT * from users WHERE email = ?', [req.user.email]);
      } 
      catch (error) 
      {
        req.logger.error('Error inserting user:', error);
        let result = req.resHandler.payload(false, 500, res.response_codes['500'], {});
        return req.resHandler.output(result, 500, 'application/json');
      }
    }
    if (data[0].status == 0)
    {
      let result = req.resHandler.payload(false, 601, res.response_codes['601'], {});
      return req.resHandler.output(result, 601, 'application/json');
    }
    if (data.length > 0)
    {
      //const sanitizedData = data.map(({ id, ...rest }) => rest);
      const sanitizedData = data.map(({ id, ...rest }) => ({ sid: id, ...rest }));
      let result = req.resHandler.payload(true, 200, "Success retrieving user data", sanitizedData);
      return req.resHandler.output(result, 200, 'application/json');
    }
    let result = req.resHandler.payload(false, 600, res.response_codes['600'], {});
    return req.resHandler.output(result, 200, 'application/json');
  } 
  catch (err) 
  {
    req.logger.error('Error retrieving user data:', err);
    let errorResult = req.resHandler.payload(false, 500, "Internal Server Error", {});
    return req.resHandler.output(errorResult, 500, 'application/json');
  } 
});
/*
** method: PUT
** uri: /user 
** params: firstname, lastname, description, phone
*/
app.put('/user', reqHandler.checkAuthorization, 
[
  body('firstname').notEmpty().withMessage('First name is required and cannot be empty'),
  body('lastname').notEmpty().withMessage('First name is required and cannot be empty')
], handleValidationErrors, async (req, res) => 
{
  const expectedParams = ['firstname', 'lastname', 'description', 'phone', 'avatar'];
  const userData = expectedParams.map(param => req.body[param] || '');
  userData.push(req.user.email); // Add req.user.email to userData
  const [firstname, lastname, description, phone, avatar] = userData;
  let sql = `UPDATE users SET firstname = ?, lastname = ?, description = ?, phone = ?, avatar = ? WHERE email LIKE ?`;  
  try 
  {
    await db.query(sql, userData);
    data = await db.query('SELECT * from users WHERE email = ?', [req.user.email]);
    const sanitizedData = data.map(({ id, ...rest }) => rest);
    let result = req.resHandler.payload(true, 200, 'User updated successfully', sanitizedData);
    return req.resHandler.output(result, 200, 'application/json');
  } 
  catch (error) 
  {
    req.logger.error('Error inserting user:', error);
    let result = req.resHandler.payload(false, 500, res.response_codes['500'], {});
    return req.resHandler.output(result, 500, 'application/json');
  }
});
/*
** method: GET
** uri: /user/details/:sid
*/
app.get('/user/details/:sid', async (req, res) => 
  {
    try 
    {
      const userData = await db.query('SELECT * FROM users WHERE id = ? AND status = ?', [req.params.sid, 1]);
      if (userData.length == 0)
      {
        let result = req.resHandler.payload(false, 600, res.response_codes['600'], {});
        return req.resHandler.output(result, 500, 'application/json');
      }
      const data =
      {
        sid: userData[0].id,
        avatar: userData[0].avatar,
        //description: userData[0].description,
        //date_inserted: listing[0].date_inserted
        art_name: ((userData[0].art_name) ? userData[0].art_name : 'Anonymous'),
        listings: {}
      }
      const listing = await db.query('SELECT * FROM listings WHERE user_id = ? AND status = ?', [userData[0].id, 1]);
      if (listing.length > 0) {
          data.listings = listing.map(listingItem => {
              const { id, ...rest } = listingItem;
              return rest;
          });
      }
      let result = req.resHandler.payload(true, 200, 'User listings data retrieved successfully', data);
      return req.resHandler.output(result, 200, 'application/json');
    }
    catch (error) 
    {
      req.logger.error('Error inserting listing:', error);
      let result = req.resHandler.payload(false, 500, res.response_codes['500'], {});
      return req.resHandler.output(result, 500, 'application/json');
    }
  });   
/*
** method: POST
** uri: /listing 
** params: nft_id
*/
app.post('/listing', reqHandler.checkAuthorization, 
[
  body('nft_id').notEmpty().withMessage('Nft id is required and cannot be empty'),
  body('address').notEmpty().withMessage('Wallet address cannot be empty'),
], handleValidationErrors, async (req, res) => 
{
  try 
  {
    await db.query('DELETE from listings WHERE nft_id = ?', [req.body.nft_id]);
    const userData = await db.query('SELECT * from users WHERE email = ?', [req.user.email]);
    await db.query('INSERT INTO listings (nft_id, user_id, address, status) VALUES (?, ?, ?, ?)', 
    [
      req.body.nft_id, 
      userData[0].id, 
      req.body.address, 
      1
    ]);
    let result = req.resHandler.payload(true, 200, 'Listing inserted successfully', { });
    return req.resHandler.output(result, 200, 'application/json');
  }
  catch (error) 
  {
    req.logger.error('Error inserting listing:', error);
    let result = req.resHandler.payload(false, 500, res.response_codes['500'], {});
    return req.resHandler.output(result, 500, 'application/json');
  }
});
/*
** method: GET
** uri: /listing/:id
*/
app.get('/listing/:id', async (req, res) => 
{
  const listingId = req.params.id;
  try 
  {
    const listing = await db.query('SELECT * FROM listings WHERE nft_id = ? AND status = ?', [listingId, 1]);
    if (listing.length == 0)
    {
      let result = req.resHandler.payload(false, 700, res.response_codes['700'], {});
      return req.resHandler.output(result, 700, 'application/json');
    }
    const userData = await db.query('SELECT * FROM users WHERE id = ? AND status = ?', [listing[0].user_id, 1]);
    if (userData.length == 0)
    {
      let result = req.resHandler.payload(false, 600, res.response_codes['600'], {});
      return req.resHandler.output(result, 600, 'application/json');
    }
    const data =
    {
      sid: userData[0].id,
      avatar: userData[0].avatar,
      //description: userData[0].description,
      //date_inserted: listing[0].date_inserted
      art_name: ((userData[0].art_name) ? userData[0].art_name : 'Anonymous'),
    }
    let result = req.resHandler.payload(true, 200, 'Listing data retrieved successfully', data);
    return req.resHandler.output(result, 200, 'application/json');
  } 
  catch (error) 
  {
    req.logger.error('Error inserting listing:', error);
    let result = req.resHandler.payload(false, 500, res.response_codes['500'], {});
    return req.resHandler.output(result, 500, 'application/json');
  }
});

// *** The 404 Route, last route ***
app.all('*', (req , res) => 
{
  let msg = 'No service is associated with the url => ' + req.url;
	req.logger.error(msg);
	let result = req.resHandler.notFound(msg, {});
	res.header('Content-Type', 'application/json');
  console.log(msg);
	res.status(404).send(result);	
});

app.use(function(err, req, res, next) 
{
	logger = require('./helpers/logger')(req.session);
	let error = (err.hasOwnProperty('stack')) ? err.stack.split("\n", 1).join("") : err;
	logger.error(((err.hasOwnProperty('stack')) ? err.stack : err));
	result = req.resHandler.payload(false, 500, responseCodes['500'], {});
	res.header('Content-Type', 'application/json');
	res.status(500).send(result);	
});

const port = process.env.SERVICE_PORT || 5000;
const host = process.env.SERVICE_ADDRESS || '0.0.0.0';
const timeout = parseInt(process.env.TIMEOUT);

app.listen(port, host, () => 
{
	let start_time = new Date( );
	console.log('\x1b[35m%s\x1b[0m', '[' + start_time.toString() + 
		        '] Node server running on http://' + host + ':' + port);
	
}).setTimeout(timeout);