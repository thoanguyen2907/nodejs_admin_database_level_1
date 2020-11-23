

const UsersModel = require(__path_schemas + "users"); 
let createFilterStatus = async (currentStatus) => {
    let statusFilter = [
        {name: "All", value: "all", count: 3, class: "default"}, 
        {name: "Active", value: "active", count: 2,  class: "default"}, 
        {name: "InActive", value: "inactive", count: 1, class: "default"}, 
      ]
        let objectFilter = {};  
        for (let i = 0; i < statusFilter.length; i++){
        let item = statusFilter[i]; 
        objectFilter = item.value === "all"? {} : {"status": item.value}; 
        item["class"] = item.value == currentStatus ? "success" : "default"; 
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
let getObjectFilter = async (currentStatus, keyword, groupID) => {
let objectFilter = {}; 
keyword = keyword.trim();  
 if(currentStatus === "all"){
     if(keyword !== "" || groupID != "undefined" ) {
        objectFilter =  {"name": new RegExp(keyword, "i"), 'group.id': groupID}
     } else if (groupID == "undefined" || keyword === ""){
        objectFilter  = {} 
     }
 } else if (currentStatus !== "all" ){
     if(keyword !== "" || groupID != "undefined" ){
        objectFilter = {"status": currentStatus, "name": new RegExp(keyword, "i"), 'group.id': groupID }
     } else if(keyword == "" || groupID == "undefined") {
        objectFilter = {"status": currentStatus}
     }
 } else {
    objectFilter  = {} 
 }
 return objectFilter; 
}

module.exports = {
    createFilterStatus,
    getParams,
    getObjectFilter
}