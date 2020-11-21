var express = require('express');
var router = express.Router();
let systemConfig = require(__path_config+ 'system');
let utilHelper = require(__path_helper + "utils"); 
let validateHelper = require(__path_validates + "items"); 
const notify = require(__path_config+ "notify"); 
const { body, validationResult } = require('express-validator');
const flash = require('express-flash-notification');
const  util = require("util"); 
/* GET users listing. */
const ItemsModel = require(__path_schemas + "items"); 
const folderView = "pages/items/"; 
const collection = "items"
const linkIndex = "/" + systemConfig.prefixAdmin + "/"+ collection +"/all"; 
const arrayValidationItems = validateHelper.validator(); 

router.get('/form(/:id)?', async (req, res, next) =>  {
  let currentId = await utilHelper.getParams(req.params, "id", ""); 
  let itemDefault = {name: "", ordering: 0, status: "novalue"};
  let errors = [];
  if(currentId === undefined || currentId === ""){
    res.render(`${folderView}add`, { title: 'Items Management-Add', item: itemDefault, errors});
  } else {
    await  ItemsModel.findById(currentId, async (err, itemEdit)=>{
      res.render(`${folderView}add`, { title: 'Items Management - Edit', item: itemEdit, errors });
     }) 
  }
});
router.post('/save(/:id)?', arrayValidationItems, async (req, res, next) =>  {
  let errors =  validationResult(req); 
  errors =   Array.from(errors.errors); 
 let id =  await utilHelper.getParams(req.body, "id", "");
 let item = await req.body; 
 if(id === "" || id === undefined){
   if(errors.length > 0){
    res.render(`${folderView}add`, { title: 'Items Management - Add', item: item,errors });
     return 
   } else {
  await new ItemsModel(item).save((error, result)=>{
    //ko có lỗi thì lưu item trong database, setTimeout tránh bđb
     req.flash("success", notify.ADD_ITEM_SUCCESS, false); 
     res.redirect(`${linkIndex}`);
   }); 
}
   }
 else { 
   if(errors.length > 0) {
    res.render(`${folderView}add`, { title: 'Items Management - Edit', item: item,errors });
    return 
   } else {
  await ItemsModel.updateOne({_id: id}, item, {new: true})
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
let objectFilter =  await utilHelper.getObjectFilter(currentStatus, keywordFilter); 
  await ItemsModel.find(objectFilter)
      .then((items)=>{
          res.render(`${folderView}list`, { title: 'Items Management List', 
          items: items,
          statusFilter, 
          currentStatus,
          keywordFilter });

           
});
});

//change multi status 
    router.post('/change-status/:status', async (req, res, next)  => {
  let currentStatus = await utilHelper.getParams(req.params, "status", "all");  
  let idArray = req.body.cid
      await ItemsModel.updateMany({_id: {$in: idArray}}, {"status": currentStatus})
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
      await ItemsModel.updateOne({_id: currentID}, {status:currentStatus },  {new: true})
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
  await ItemsModel.deleteOne({_id: currentID})
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
      await ItemsModel.deleteMany({_id: {$in: idArray}})
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
      await ItemsModel.findByIdAndUpdate(item, {"ordering": parseInt(ordering[index])}, {useFindAndModify: false});
        req.flash("success", notify.CHANGE_ORDERING_MULTI_ITEMS_SUCCESS, result.n, false); 
    }) 
  } else {

    await  ItemsModel.findByIdAndUpdate(idArray, {"ordering": parseInt(ordering)}, {useFindAndModify: false});
    req.flash("success", notify.CHANGE_ORDERING_SUCCESS, false); 
  }
  res.redirect(`${linkIndex}`);
  }); 
  

module.exports = router;
