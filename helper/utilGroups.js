
const GroupsModel = require(__path_schemas+ "groups"); 
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
            await GroupsModel.countDocuments(objectFilter)
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
let getObjectFilter = async (params) => {
let objectFilter = {}; 
params.keywordFilter = params.keywordFilter.trim(); 
 if(params.currentStatus === "all"){
     if(params.keywordFilter !== "") {
        objectFilter =  {"name": new RegExp(params.keywordFilter, "i")}
     } else {
        objectFilter  = {} 
     }
 } else if (params.currentStatus !== "all" ){
     if(keyword !== ""){
        objectFilter = {"status": params.currentStatus, "name": new RegExp(params.keywordFilter, "i")}
     } else {
        objectFilter = {"status": params.currentStatus}
     }
 } else {
    objectFilter = {}
 }
 return objectFilter; 
}

module.exports = {
    createFilterStatus,
    getParams,
    getObjectFilter
}