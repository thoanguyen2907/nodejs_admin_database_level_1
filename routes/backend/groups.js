var express = require('express');
var router = express.Router();
let systemConfig = require(__path_config+ 'system');
let utilHelper = require(__path_helper + "utilGroups"); 
let validateHelper = require(__path_validates + "groups"); 
const notify = require(__path_config+ "notify"); 
const { body, validationResult } = require('express-validator');
const flash = require('express-flash-notification');
const  util = require("util"); 
/* GET users listing. */
const GroupsModel = require(__path_models + "groups"); 
const UsersModel = require(__path_models + "users"); 
const folderView = "pages/groups/"; 
const collection = "groups"
const linkIndex = "/" + systemConfig.prefixAdmin + "/"+ collection +"/all"; 
const arrayValidationGroups = validateHelper.validator(); 
router.get('/form(/:id)?', async (req, res, next) =>  {
  let currentId = await utilHelper.getParams(req.params, "id", ""); 
  let itemDefault = {name: "", ordering: 0, status: "novalue", content: ""};
  let errors = [];
  if(currentId === undefined || currentId === ""){
    res.render(`${folderView}add`, { title: 'Groups Management-Add', item: itemDefault, errors});
  } else {
    await  GroupsModel.getItem(currentId).then((itemEdit)=>{
      res.render(`${folderView}add`, { title: 'Groups Management - Edit', item: itemEdit, errors });
     }) 
  }
});
router.post('/save(/:id)?', arrayValidationGroups, async (req, res, next) =>  {
  let errors =  validationResult(req); 
  errors =   Array.from(errors.errors); 
 let id =  await utilHelper.getParams(req.body, "id", "");
 let item = await req.body; 

 if(id === "" || id === undefined){
   if(errors.length > 0){
    res.render(`${folderView}add`, { title: 'Groups Management - Add', item: item,errors });
     return 
   } else {
    await GroupsModel.saveItem(id, item, {task: "add"}).then(()=>{  
    //ko có lỗi thì lưu item trong database, setTimeout tránh bđb
     req.flash("success", notify.ADD_ITEM_SUCCESS, false); 
     res.redirect(`${linkIndex}`);
   }); 
}
   }
 else { 
   if(errors.length > 0) {
    res.render(`${folderView}add`, { title: 'Groups Management - Edit', item: item,errors });
    return 
   } else {
    await  GroupsModel.saveItem(id, item,{task: "edit"}).then( (result)=>{ 
     UsersModel.saveItem(id, item,{task: "change-group-name"}).then(()=>{
      req.flash("success", notify.EDIT_ITEM_SUCCESS, false); 
      res.redirect(`${linkIndex}`);
    })
  });
};
   }
})

router.get('(/:status)?', async (req, res, next)  => {
  let params = {}; 
  params.currentStatus = await utilHelper.getParams(req.params, "status", "all");  
  let statusFilter =  await utilHelper.createFilterStatus(params); 
  params.keywordFilter = await utilHelper.getParams(req.query, "keyword", "");
  let objectFilter =  await utilHelper.getObjectFilter(params); 
  params.sortField = await utilHelper.getParams(req.session, "sortField", "ordering");
  params.sortType =  await utilHelper.getParams(req.session, "sortType", "desc");

  await GroupsModel
         .listItems(objectFilter, params)          
          .then((items)=>{
          res.render(`${folderView}list`, { title: 'Groups Management List', 
          items: items,
          statusFilter, 
          params  });       
});
});

//change multi status 
    router.post('/change-status/:status', async (req, res, next)  => {
  let currentStatus = await utilHelper.getParams(req.params, "status", "all");  
  let idArray = req.body.cid;
    await GroupsModel.changeStatus(idArray, currentStatus, {task: "update-multi"})
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
      await GroupsModel.changeStatus(currentID, currentStatus, {task: "update-one"})
      .then( (result)=>{
        req.flash("success", notify.CHANGE_STATUS_SUCCESS, false); 
          res.redirect(`${linkIndex}`);
      })
      .catch((error)=>{
        console.log(error)
      })
 });
//change group acp
 router.get('/change-group/:group_acp/:id/', async (req, res, next)  => {
  let currentGroup = await utilHelper.getParams(req.params, "group_acp", "yes");  
  let currentID = await utilHelper.getParams(req.params, "id", ""); 
  await GroupsModel.changeGroupACP(currentGroup, currentID)
  .then( (result)=>{
    req.flash("success", notify.CHANGE_GROUP_SUCCESS, false); 
      res.redirect(linkIndex);
  })
  .catch((error)=>{
    console.log(error)
  })
});
  
 router.get('/delete/:id/', async (req, res, next)  => {  
  let currentID = await utilHelper.getParams(req.params, "id", ""); 

  await GroupsModel.deleteItem(currentID, {task: "delete-one"})
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
      await GroupsModel.deleteItem(idArray, {task: "delete-many"})
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
  await  GroupsModel.changeOrdering(idArray, ordering)
    .then((result)=>{
      req.flash("success", notify.CHANGE_ORDERING_SUCCESS, false); 
      res.redirect(`${linkIndex}`);
    })      
  req.flash("success", notify.CHANGE_ORDERING_SUCCESS, false); 
  res.redirect(linkIndex);
  }); 
  //sort item
  router.get('/sort/:sortField/:sortType', async (req, res, next)  => {  
    req.session.sortField   = await utilHelper.getParams(req.params, "sortField", "ordering");
    req.session.sortType   = await utilHelper.getParams(req.params, "sortType", "asc");
    res.redirect(linkIndex)
   }); 


module.exports = router;
