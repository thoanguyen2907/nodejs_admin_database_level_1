
const UsersModel = require(__path_schemas + "users"); 
var multer  = require('multer'); 
var randomstring = require("randomstring"); 
var path = require('path');

let createFilterStatus = async (params) => {
    let statusFilter = [
        {name: "All", value: "all", count: 3, class: "default"}, 
        {name: "Active", value: "active", count: 2,  class: "default"}, 
        {name: "InActive", value: "inactive", count: 1, class: "default"}, 
      ]
        let objectFilter = {};  
        for (let i = 0; i < statusFilter.length; i++){
        let item = statusFilter[i]; 
        objectFilter = item.value === "all"? {} : {"status": item.value}; 
        item["class"] = item.value == params.currentStatus ? "success" : "default"; 
            await UsersModel.countDocuments(objectFilter)
            .then((countNumber)=>{
              item["count"] = countNumber; 
        })
        }
          return statusFilter
}
let getParams = async (params, value, defaultValue ) => {
    if(params[value] == undefined || params[value] == "") {
        params[value] = defaultValue
    } else {
        params[value]
    }
    return  params[value]; 
}
let getObjectFilter =  (params) => {
let objectFilter = {}; 
params["keywordFilter"] = params["keywordFilter"].trim();  
 if(params["currentStatus"] === "all"){
    if (params["groupID"] !== "undefined"|| params["keywordFilter"] !== "") {
        objectFilter =  {"name": new RegExp(params["keywordFilter"], "i"), 'group.id':params["groupID"]}
     } 
    else  if (params["groupID"] == "undefined" || params["keywordFilter"] == "" ){
        objectFilter  = {}; 
     }

 } else if (params["currentStatus"] !== "all" ){
    if(params["keywordFilter"]!== "" || params["groupID"]!= "undefined" ){
        objectFilter = {"status": params["currentStatus"], "name": new RegExp(params["keywordFilter"], "i"), 'group.id': params["groupID"] }
     } 
    else if(params["keywordFilter"] == "" || params["groupID"] == "undefined") {
        objectFilter = {"status": params["currentStatus"]}
     } 
      
 } else {
    objectFilter  = {} 
 }
 return objectFilter; 
}
const uploadFile = (field, folderDes = "users",fileNameLength = 5, fileSize = 1, fileExtension = "jpeg|jpg|png|gif" ) => {
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
          cb(null, __path_upload + folderDes + "/")
        },
        filename: function (req, file, cb) {
          cb(null, randomstring.generate(fileNameLength) + path.extname(file.originalname))
        }
      }); 
      var upload = multer({
        storage: storage, 
        fileFilter:  (req, file, callback) =>  {
        const filetypes = new RegExp(fileExtension); 
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype =  filetypes.test(file.mimetype);
        if(mimetype && extname){
          return callback(null, true);
        }  else {
          callback(('Only images are allowed')); 
        }
      },
      limits: {fieldSize: fileSize *  1024 * 1024} }).single(field); 
      return upload; 
}

module.exports = {
    createFilterStatus,
    getParams,
    getObjectFilter,
    uploadFile
}