const jwt = require('jsonwebtoken');

module.exports = (req,res,next)=>{
    //req.get('field name') is used for getting the values of various fields in headers
    //example 

    const authHeader  = req.get('Authorization');
    if(!authHeader)
    {
        const error =  new Error('No auth headers provided dummy!');
        error.statusCode = 401;
        throw error;
    }
    const token = authHeader.split(' ')[1];
    let decodedToken;
    try{
        decodedToken = jwt.verify(token,'somesecret')
    }
    catch(err)
    {
        err.statusCode = 500;
        throw err;
    }
    if (!decodedToken)
    {
        const error = new Error('not authenticated you tryna hack mofo?');
        error.statusCode = 401;
        throw error;
    }

    req.userId = decodedToken.userId;
    next();
}