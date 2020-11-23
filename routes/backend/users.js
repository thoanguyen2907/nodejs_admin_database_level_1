var express = require('express');
var router = express.Router();
let systemConfig = require(__path_config+ 'system');
let utilHelper = require(__path_helper + "utilsUsers"); 
let validateHelper = require(__path_validates + "users"); 
const notify = require(__path_config+ "notify"); 
const { body, validationResult } = require('express-validator');
const flash = require('express-flash-notification');
const  util = require("util"); 
/* GET users listing. */
const UsersModel = require(__path_schemas + "users"); 
const GroupsModel = require(__path_schemas + "groups"); 
const folderView = "pages/users/"; 
const collection = "users"
const linkIndex = "/" + systemConfig.prefixAdmin + "/"+ collection +"/all"; 
const arrayValidationUsers = validateHelper.validator(); 

router.get('/form(/:id)?', async (req, res, next) =>  {
  let currentId = await utilHelper.getParams(req.params, "id", ""); 
  let itemDefault = {name: "", ordering: 0, status: "novalue", content: "", group: "", group_hidden: ""};
  let errors = [];
  let groupItems = []; 
    await GroupsModel.find({}, {_id: 1, name: 1}).then((items)=>{
    groupItems = items; 
    groupItems.unshift({_id: "novalue", name: "Choose Group"}); 
})
  if(currentId === undefined || currentId === ""){
    res.render(`${folderView}add`, { title: 'Users Management-Add', item: itemDefault, errors, groupItems});
  } else {
    await  UsersModel.findById(currentId, async (err, itemEdit)=>{
        console.log(itemEdit);
      res.render(`${folderView}add`, { title: 'Users Management - Edit', item: itemEdit, errors, groupItems });
     }) 
  }
});
router.post('/save(/:id)?', arrayValidationUsers, async (req, res, next) =>  {
  let errors =  validationResult(req); 
  errors =   Array.from(errors.errors); 
 let id =  await utilHelper.getParams(req.body, "id", "");
 let item = await req.body; 
 let groupItems = []; 
 await GroupsModel.find({}, {_id: 1, name: 1}).then((items)=>{
 groupItems = items; 
 groupItems.unshift({_id: "novalue", name: "Choose Group"}); 
})
//  let groupItems = [{id: "", name: ""}]; 
 if(id === "" || id === undefined){
   if(errors.length > 0){
    res.render(`${folderView}add`, { title: 'Users Management - Add', item: item,errors,groupItems });
     return 
   } else {
    let created = {
      user_id: 1, 
      user_name: "Thoa Nguyen admin", 
      time: Date.now()
    }
    let group =  {id: item.group, name: item.group_hidden }; 
    item = {...item, created: created, group}; 

  await new UsersModel(item).save((error, result)=>{
    //ko có lỗi thì lưu item trong database, setTimeout tránh bđb
     req.flash("success", notify.ADD_ITEM_SUCCESS, false); 
     res.redirect(`${linkIndex}`);
   }); 
}
   }
 else { 
   if(errors.length > 0) {
    res.render(`${folderView}add`, { title: 'Users Management - Edit', item: item,errors, groupItems });
    return 
   } else {
    let modified = {
      user_id: 2, 
      user_name: "Truc Nguyen admin", 
      time: Date.now()
    }
    let group =  {id: item.group, name: item.group_hidden };  
    item = {...item, modified, group}; 

  await UsersModel.updateOne({_id: id}, item, {new: true})
  .then( async (result)=>{ 
     req.flash("success", notify.EDIT_ITEM_SUCCESS, false); 
     res.redirect(`${linkIndex}`);
  });
};
   }
})

router.get('(/:status)?', async (req, res, next)  => {
let currentStatus = await utilHelper.getParams(req.params, "status", "all");  
let statusFilter =  await utilHelper.createFilterStatus(currentStatus); 
let keywordFilter = await utilHelper.getParams(req.query, "keyword", "");
let  groupID      =  await utilHelper.getParams(req.session, "group_id", "undefined");
let  sortField = await utilHelper.getParams(req.session, "sortField", "ordering");
let  sortType =  await utilHelper.getParams(req.session, "sortType", "desc");
let objectFilter =  await utilHelper.getObjectFilter(currentStatus, keywordFilter, groupID); 
let sort    = {};
sort[sortField] = sortType; 
await GroupsModel.find({}, {_id: 1, name: 1}).then((items)=>{
    groupItems = items; 
    groupItems.unshift({_id: "novalue", name: "All Group"}); 
});
 await UsersModel
          .find(objectFilter)
          .select("name status ordering created modified group.id group.name")
          .sort(sort)
          .then((items)=>{
          res.render(`${folderView}list`, { title: 'Users Management List', 
          items: items,
          statusFilter, 
          currentStatus,
          keywordFilter,
          sortField,
          sortType, 
          groupItems,
          groupID
         });     
});
});

//change multi status 
    router.post('/change-status/:status', async (req, res, next)  => {
  let currentStatus = await utilHelper.getParams(req.params, "status", "all");  
  let idArray = req.body.cid;
  let data = {
    status: currentStatus, 
    modified: {
      user_id: 2, 
      user_name: "Truc Nguyen admin", 
      time: Date.now()
    }
  }
      await UsersModel.updateMany({_id: {$in: idArray}}, data )
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
      currentStatus = currentStatus === "active"? "inactive" :  "active"; 
      let data = {
        status: currentStatus, 
        modified: {
          user_id: 2, 
          user_name: "Truc Nguyen admin", 
          time: Date.now()
        }
      }
      await UsersModel.updateOne({_id: currentID}, data,  {new: true})
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
  console.log(currentID);
  await UsersModel.deleteOne({_id: currentID})
  .then(async (result)=> {
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
      await UsersModel.deleteMany({_id: {$in: idArray}})
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
  if(Array.isArray(idArray)){
    idArray.forEach(async (item, index)=>{
      let data = {
        ordering: parseInt(ordering[index]), 
        modified: {
          user_id: 2, 
          user_name: "Truc Nguyen admin", 
          time: Date.now()
        }
      }
      await UsersModel.findByIdAndUpdate(item, data, {useFindAndModify: false});
        req.flash("success", notify.CHANGE_ORDERING_MULTI_ITEMS_SUCCESS, result.n, false); 
    }) 
  } else {
    let data = {
      ordering: parseInt(ordering), 
      modified: {
        user_id: 2, 
        user_name: "Truc Nguyen admin", 
        time: Date.now()
      }
    }
    await  UsersModel.findByIdAndUpdate(idArray, data, {useFindAndModify: false});
    req.flash("success", notify.CHANGE_ORDERING_SUCCESS, false); 
  }
  res.redirect(`${linkIndex}`);
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
    res.redirect(linkIndex)
   });  


module.exports = router;
