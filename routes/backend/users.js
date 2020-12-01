var express = require('express');
var router = express.Router();
let fs =  require('fs');
let systemConfig = require(__path_config+ 'system');
let utilHelper = require(__path_helper + "utilsUsers"); 
let validateHelper = require(__path_validates + "users"); 
const notify = require(__path_config+ "notify"); 
const { body, validationResult } = require('express-validator');
const flash = require('express-flash-notification');
const  util = require("util");

/* GET users listing. */
const UsersModel = require(__path_models + "users"); 
const GroupsModel = require(__path_models+ "groups"); 
const folderView = "pages/users/"; 
const collection = "users"
const linkIndex = "/" + systemConfig.prefixAdmin + "/"+ collection +"/all"; 
const arrayValidationUsers = validateHelper.validator(); 
const uploadFile = utilHelper.uploadFile("avatar")

router.get('/form(/:id)?', async (req, res, next) =>  {
  let currentId = await utilHelper.getParams(req.params, "id", ""); 
  let itemDefault = {name: "", ordering: 0, status: "novalue", content: "", group: {id: "undefined", name: ""}};
  let errors = [];
  let groupItems = []; 

  await GroupsModel.listItemsInSelectbox().then((items)=>{
    groupItems = items; 
    groupItems.unshift({_id: "undefined", name: "All Group"}); 
});
  if(currentId === undefined || currentId === ""){
    res.render(`${folderView}add`, { title: 'Users Management-Add', item: itemDefault, errors, groupItems});
  } else {
    await  UsersModel.getItem(currentId).then(async (itemEdit)=>{
      res.render(`${folderView}add`, { title: 'Items Management - Edit', item: itemEdit, errors, groupItems });
    }); 
  }
});

// router.post('/save(/:id)?', async (req, res, next) =>  {
//   uploadFile(req,res,(error)=>{
//     if(error) {

//       console.log(error.message)
//     }
//     next()
//   }) 
// })

router.post('/save(/:id)?',uploadFile, arrayValidationUsers, async (req, res, next) =>  {
  let errors =  validationResult(req); 
  errors =   Array.from(errors.errors);
 let id =  await utilHelper.getParams(req.body, "id", "");
    let item = await req.body;
    let groupItems = [];
    await GroupsModel.listItemsInSelectbox().then((items)=>{
      groupItems = items; 
      groupItems.unshift({_id: "undefined", name: "Choose Group"}); 
     })
    if(id == "" || id == undefined){
      if(errors.length > 0){
        let group =  {id: item.group, name: item.group_hidden }; 
        item = {...item,group }
       res.render(`${folderView}add`, { title: 'Users Management - Add', item,errors,groupItems });
        return 
      } else {  
          item.avatar = req.file.filename;  
          await UsersModel.saveItem(id, item, {task: "add"}).then(()=>{
          //ko có lỗi thì lưu item trong database, setTimeout tránh bđb
           req.flash("success", notify.ADD_ITEM_SUCCESS, false); 
           res.redirect(`${linkIndex}`);
         });    
    }}
    else { 
      if(errors.length > 0) {
       res.render(`${folderView}add`, { title: 'Users Management - Edit', item: item,errors, groupItems });
       return 
      } else {
        item.avatar = req.file.filename; 
       await UsersModel.saveItem(id, item,{task: "edit"})
     .then( async (result)=>{ 
        req.flash("success", notify.EDIT_ITEM_SUCCESS, false); 
        res.redirect(`${linkIndex}`);
     });
   };
      } 
})

// router.post('/save(/:id)?', (req, res, next) =>  {
//    uploadFile(req,res, async  (errUpload)=>{
//     let id =  await utilHelper.getParams(req.body, "id", "");
//     let item = await Object.assign(req.body);
//     let groupItems = [];
//     await GroupsModel.listItemsInSelectbox().then((items)=>{
//       groupItems = items; 
//       groupItems.unshift({_id: "undefined", name: "All Group"}); 
//      })
//     let errors =  []; 
//     if(errUpload) {
//       errors.push({param: "avatar", msg: errUpload})
//     }  
      
//     if(id == "" || id == undefined){
//       if(errors.length > 0){
//     if(req.file != undefined)  utilHelper.removeFile("public/upload/users/", req.file.filename)
//        res.render(`${folderView}add`, { title: 'Users Management - Add', item,errors,groupItems });
//         return 
//       } else {   
//         item.avatar = req.file.filename; 
//        await UsersModel.saveItem(id, item, {task: "add"}).then(()=>{
//        //ko có lỗi thì lưu item trong database, setTimeout tránh bđb
//         req.flash("success", notify.ADD_ITEM_SUCCESS, false); 
//         res.redirect(`${linkIndex}`);
//       }); }}
//     else { 
//       if(errors.length > 0) {
//         if(req.file != undefined)   utilHelper.removeFile("public/upload/users/",req.file.filename) //xoá hình khi form ko hợp lệ 
//        res.render(`${folderView}add`, { title: 'Users Management - Edit', item,errors, groupItems });
//        return 
//       } else {
//         item.avatar = req.file.filename; 
//        await UsersModel.saveItem(id, item,{task: "edit"})
//      .then( async (result)=>{ 
//         req.flash("success", notify.EDIT_ITEM_SUCCESS, false); 
//         res.redirect(`${linkIndex}`);
//      });
//    };
//       }
// })  
//   }); 
  
router.get('(/:status)?', async (req, res, next)  => {
let params =  {}; 
params.currentStatus = await utilHelper.getParams(req.params, "status", "all"); 
params.keywordFilter = await utilHelper.getParams(req.query, "keyword", "");
params.sortField = await utilHelper.getParams(req.session, "sortField", "ordering");
params.sortType =  await utilHelper.getParams(req.session, "sortType", "desc");
params.groupID  =  await utilHelper.getParams(req.session, "group_id", "undefined");
let statusFilter =  await utilHelper.createFilterStatus(params);
let objectFilter =  await utilHelper.getObjectFilter(params); 

await GroupsModel.listItemsInSelectbox().then((items)=>{
    groupItems = items; 
    groupItems.unshift({_id: "novalue", name: "All Group"}); 
});

 await UsersModel.listItems(objectFilter, params)   
          .then((items)=>{
          res.render(`${folderView}list`, { title: 'Users Management List', 
          items: items,
          statusFilter,
          groupItems,  
          params      
         });     
});
});

//change multi status 
    router.post('/change-status/:status', async (req, res, next)  => {
  let currentStatus = await utilHelper.getParams(req.params, "status", "all");  
  let idArray = req.body.cid;
  await UsersModel.changeStatus(idArray, currentStatus, {task: "update-multi"})
  .then((result)=>{
    req.flash("success", util.format(notify.CHANGE_MULTI_ITEMS_SUCCESS, result.n), false); 
    res.redirect(`${linkIndex}`);   
  })
  .catch((error)=>{
    console.log(error);
  }) 
});
    router.get('/change-status/:status/:id/', async (req, res, next)  => {
      let currentStatus = await utilHelper.getParams(req.params, "status", "all");  
      let currentID = await utilHelper.getParams(req.params, "id", ""); 
      await UsersModel.changeStatus(currentID, currentStatus, {task: "update-one"})
      .then( (result)=>{
        req.flash("success", notify.CHANGE_STATUS_SUCCESS, false); 
          res.redirect(`${linkIndex}`);
      })
      .catch((error)=>{
        console.log(error)
      })
 });
  
 router.get('/delete/:id/', async (req, res, next)  => {  
  let currentID = await utilHelper.getParams(req.params, "id", ""); 
  await UsersModel.deleteItem(currentID, {task: "delete-one"})
  .then((result)=> {
    req.flash("success", notify.DELETE_ITEM_SUCCESS, false); 
    res.redirect(`${linkIndex}`)
  })
  .catch((error)=>{
    console.log(error)
  })
 }); 
//delete nhiều phần từ 
//change multi status 
router.post('/delete/', async (req, res, next)  => {
  let idArray = req.body.cid
  await UsersModel.deleteItem(idArray, {task: "delete-many"})
      .then((result)=>{ 
        req.flash("success", util.format(notify.DELETE_MULTI_ITEMS_SUCCESS, result.n), false); 
        res.redirect(`${linkIndex}`);
      })
      .catch((error)=>{
        console.log(error);
      })  
    });
//change ordering of multi items 
router.post('/change-ordering/', async  (req, res, next)  => {
  let idArray = req.body.cid
  let ordering = req.body.ordering; 
  await  UsersModel.changeOrdering(idArray, ordering)
  .then((result)=>{
    req.flash("success", notify.CHANGE_ORDERING_SUCCESS, false); 
    res.redirect(`${linkIndex}`);
  }) 
  }); 
  //sort item
  router.get('/sort/:sortField/:sortType', async (req, res, next)  => {  
    req.session.sortField   = await utilHelper.getParams(req.params, "sortField", "ordering");
    req.session.sortType   = await utilHelper.getParams(req.params, "sortType", "asc");
    res.redirect(linkIndex)
   }); 
 //FILTER GROUP 
 router.get('/filter-group/:group_id/', async (req, res, next)  => {  
    req.session.group_id  = await utilHelper.getParams(req.params, "group_id", "undefined");
    res.redirect(linkIndex); 
   });  


module.exports = router; 
