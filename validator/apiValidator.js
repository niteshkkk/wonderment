exports.validateLogin = function(req, res) {


    //console.log("Validating login fields for email=" + req.body.email);

    req.sanitize("email").trim();
    req.sanitize("password").trim();
    req.check("email", "Invalid mandatory field [email].").notEmpty();
    req.check("password", "Invalid mandatory field [password].").notEmpty();
}

exports.validateLogout = function(req, res) {

    //console.log("Validating registration fields for email=" + req.body.email);

    req.sanitize("email").trim();
    req.check("email", "Invalid mandatory field [email].").notEmpty();

}


exports.validateEmail = function(req, res) {

    //console.log("Validating email for username = " + Utils.getUsername(req));
    req.sanitize("username").trim();
    req.check("username", "Invalid mandatory field [username].").notEmpty();
  
    req.sanitize("email").trim();
    req.check("email", "Invalid mandatory field [email].").notEmpty();

}