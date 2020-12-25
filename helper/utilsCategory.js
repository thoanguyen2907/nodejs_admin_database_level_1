
const CategoriesModel = require(__path_schemas+ "categories"); 
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
            await CategoriesModel.countDocuments(objectFilter)
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

const changeToSlug =  (string) => {  
    string = string.toString().toLowerCase().trim();
    const sets = [
      {to: 'a', from: '[ÀÁÂÃÄÅÆĀĂĄẠẢẤẦẨẪẬẮẰẲẴẶἀ]'},
      {to: 'c', from: '[ÇĆĈČ]'},
      {to: 'd', from: '[ÐĎĐÞ]'},
      {to: 'e', from: '[ÈÉÊËĒĔĖĘĚẸẺẼẾỀỂỄỆ]'},
      {to: 'g', from: '[ĜĞĢǴ]'},
      {to: 'h', from: '[ĤḦ]'},
      {to: 'i', from: '[ÌÍÎÏĨĪĮİỈỊ]'},
      {to: 'j', from: '[Ĵ]'},
      {to: 'ij', from: '[Ĳ]'},
      {to: 'k', from: '[Ķ]'},
      {to: 'l', from: '[ĹĻĽŁ]'},
      {to: 'm', from: '[Ḿ]'},
      {to: 'n', from: '[ÑŃŅŇ]'},
      {to: 'o', from: '[ÒÓÔÕÖØŌŎŐỌỎỐỒỔỖỘỚỜỞỠỢǪǬƠ]'},
      {to: 'oe', from: '[Œ]'},
      {to: 'p', from: '[ṕ]'},
      {to: 'r', from: '[ŔŖŘ]'},
      {to: 's', from: '[ßŚŜŞŠȘ]'},
      {to: 't', from: '[ŢŤ]'},
      {to: 'u', from: '[ÙÚÛÜŨŪŬŮŰŲỤỦỨỪỬỮỰƯ]'},
      {to: 'w', from: '[ẂŴẀẄ]'},
      {to: 'x', from: '[ẍ]'},
      {to: 'y', from: '[ÝŶŸỲỴỶỸ]'},
      {to: 'z', from: '[ŹŻŽ]'},
      {to: '-', from: '[·/_,:;\']'}];
      sets.forEach(set => {
        string = string.replace(new RegExp(set.from,'gi'), set.to)
      });   
      return string
        .replace(/\s+/g, '-')    // Replace spaces with -
        .replace(/[^-a-zа-я\u0370-\u03ff\u1f00-\u1fff]+/g, '') // Remove all non-word chars
        .replace(/--+/g, '-')    // Replace multiple - with single -
        .replace(/^-+/, '')      // Trim - from start of text
        .replace(/-+$/, '')      // Trim - from end of text
  };

module.exports = {
    createFilterStatus,
    getParams,
    getObjectFilter, 
    changeToSlug
}