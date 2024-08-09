class ExpressErr extends Error {
    constructor (satatusCode, message){
        super();
        this.satatusCode = satatusCode;
        this.message = message;
    };
};


module.exports = ExpressErr;
