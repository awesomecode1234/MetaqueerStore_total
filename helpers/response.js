module.exports = function(res)
{
	let module = {};
	
	module.payload = function(success, code, msg, data)
	{
		var dt = new Date( );
		return JSON.stringify
		({
			"result":
			{
				"success": success,
				"message": msg,
				"data": data,
				//"code": code
			} ,
			//"code": 200 ,
            "code": code,
			"time": dt.getTime( )
		});
	};
	
	module.timeout = function(code, msg, data)
	{
		var dt = new Date( );
		return JSON.stringify
		({
			"result":
			{
				"success": false ,
				"message": msg ,
				"data": data ,
				//"code": code
			} ,
			//"code": 408 ,
            "code": code,
			"time": dt.getTime( )
		});
	};
	
	module.notFound = function(msg, data)
	{
		var dt = new Date( );
		return JSON.stringify
		( {
			"result":
			{
				"success": false,
				"message": msg,
				"data": data
			} ,
			"code": 404 ,
			"time": dt.getTime( )
		} );
	};
	
	module.output = function(data, code, headers)
	{
		if(headers && code)
		{
			res.header('Content-Type', headers);
			res.status(code).send(data);
		}
		else if(code)
		{
			res.status(code).end(data);
		}
		else
		{
			res.end(data);
		}
	};
	
	module.type = '';
	
	return module;
};