/**
 * GALHARDO APP
 * Created By © Alex Galhardo  | August 2021-Present
 * aleexgvieira@gmail.com
 * https://github.com/AlexGalhardo
 * 
 * 
 *  http://localhost:3000/api/admin
 */


class APIAdminController {

	static async postAdminLogin(req, res, next) {
		const errors = validationResult(req);
		
		if(!errors.isEmpty()){
        	return res.status(422).json({ errors: errors.array() });
    	}

    	const { email, password } = req.body;

    	try {

    		if(!Users.emailIsAlreadyRegistred(email)){
    			return res.status(422).json({
	                error: "Email inválid!",
	            });
    		}

    		const admin = Users.getUserByEmail(email)
	        
	        const passwordIsValid = await Bcrypt.comparePassword(password, admin.password);
	        
	        if(!passwordIsValid){
	            return res.status(422).json({
	                error: "Incorrect password",
	            });
	        }

	        if(!admin.admin){
	        	return res.status(422).json({
	                error: "This user is NOT ADMIN!",
	            });
	        }

	        const JWT_TOKEN = jwt.sign(
	        	{admin_id:admin.id}, 
	        	process.env.JWT_SECRET,
	        	{ expiresIn: '1h' }
	        );

	        return res.json({
	            ADMIN_JWT_TOKEN: JWT_TOKEN
	        });

	    }
	    catch(err){
	        next(err);
	    }
	}

	static postAdminTest(req, res, next) {
		try {

			// if success, return admin data
	        const admin = APIController.verifyAdminAPIRequestUsingJWT(req)
            
            return res.json({
                admin: {
                	name: admin.name,
                	email: admin.email,
                	JWT_created_at: DateTime.getDateTime(decoded.iat),
                	JWT_expires_at: DateTime.getDateTime(decoded.exp)
                }
            });	        
	    }
	    catch(err){
	        next(err);
	    }
	}

	static verifyAdminAPIRequestUsingJWT(req){
		if(
            !req.headers.authorization ||
            !req.headers.authorization.startsWith('Bearer') ||
            !req.headers.authorization.split(' ')[1]
        ){
            return res.status(422).json({
                message: "Please provide the ADMIN JWT Token in Header Authorization Bearer Token",
            });
        }

        const JWT_TOKEN = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(JWT_TOKEN, process.env.JWT_SECRET);

        if(!Users.verifyIfAdminByID(decoded.admin_id)){
        	return res.status(422).json({
                message: "This JWT Token is Inválid!",
            });
        }

        const admin = Users.getUserByID(decoded.admin_id)
        return admin
	}
}

module.exports = APIAdminController;