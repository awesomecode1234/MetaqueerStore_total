
require('dotenv').config();

const axios = require("axios");
module.exports = function()
{
	let module = {};
	
	module.checkAuthorization = async function(req, res, next) 
    {
        const token = req.headers.authorization;
        const uuid = req.headers.uuid;
        if (!token || !uuid) 
        {
            result = req.resHandler.payload(false, 401, res.response_codes['401'], {});
            res.header('Content-Type', 'application/json');
            return res.status(401).send(result);	
        }
        try 
        {
            req.logger.msg('Starting authorization request:', { token: token, uuid: uuid });
            const response = await axios.post(
                process.env.PARTICLE_AUTHORIZATION_URL,
                {
                    jsonrpc: "2.0",
                    id: 0,
                    method: "getUserInfo",
                    params: [uuid, token],
                },
                {
                    auth: {
                        username: process.env.PARTICLE_PROJECT_ID,
                        password: process.env.PARTICLE_CLIENT_KEY,
                    },
                }
            );
            //req.logger.msg('Authorization response:', response.data);
            if (response.data.hasOwnProperty('error'))
            {
                req.logger.error('Error validating token:', response.data.error);
                let result = req.resHandler.payload(false, 401, res.response_codes['401'], {});
                res.header('Content-Type', 'application/json');
                return res.status(401).send(result);	
            }
            req.user = { firstname: null, lastname: null, email: null };
            let result = response.data.result;
            for (const key in result) 
            {
                if (/email/i.test(key) && result[key] !== null) 
                {
                    req.user.email = result[key];
                    break;
                }
            }
            if (result.name !== null)
            {
                names = result.name.split(" ");
                req.user.firstname = names[0];
                if (names.length > 1)
                {
                    req.user.lastname = names[1];
                }
            }
            req.logger.msg('Userdata: ', req.user);
            next();	
        } 
        catch (error) 
        {
            req.logger.error('Request error validating token:', error);
            result = req.resHandler.payload(false, 500, res.response_codes['500'], {});
            res.header('Content-Type', 'application/json');
            return res.status(500).send(result);	
        } 
	};

    module.checkUserExists  = async function(req, res, next) 
    {

    };

	module.type = '';
	
	return module;
};