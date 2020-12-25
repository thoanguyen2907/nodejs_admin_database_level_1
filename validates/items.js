const { body,check,  validationResult } = require('express-validator');

const  util = require("util");  
const notify = require(__path_config+ "notify"); 

const options = {
    name: {min: 5, max: 30}, 
    status : {value: "novalue"},
    content: {min: 10}
}

const validator = () => {
    let arrayValidationItems =  [
        check('name').isLength({ min: options.name.min }).withMessage(util.format(notify.ERROR_NAME_VALIDATION,options.name.min )).isString(),
        check('ordering').isNumeric().isInt({gt: 0}).withMessage(notify.ERROR_ORDERING_VALIDATION),
        check('status').not().isEmpty().not().isIn([`${options.status.value}`]).withMessage(notify.ERROR_STATUS_VALIDATION), 
        check('content').isLength({ min: options.content.min }).withMessage(notify.CONTENT_ERROR), 
    ]; 
   
    return arrayValidationItems; 
}
module.exports = {
    validator
}