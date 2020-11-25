const ItemsModel = require(__path_schemas + "items"); 


module.exports={
    listItems:   (objectFilter, params, options = null) => {
        let sort    = {};
        sort[params.sortField] = params.sortType; 
       return  ItemsModel
        .find(objectFilter)
        .sort(sort)
    }, 

    getItem: (currentId) => {
     return ItemsModel.findById(currentId)
    }, 
    changeStatus : (id, currentStatus, options = null) => {
        status = currentStatus === "active"? "inactive" :  "active"; 
        let data = {
          //status: status, 
          modified: {
            user_id: 2, 
            user_name: "Truc Nguyen admin", 
            time: Date.now()
          }
        }
        if(options.task == "update-one"){
            data.status = status;
            return   ItemsModel.updateOne({_id: id}, data,  {new: true});  
        } 
        if(options.task == "update-multi"){
            data.status = currentStatus;
            return   ItemsModel.updateMany({_id: {$in: id}}, data )
        }   

    }, 
    changeOrdering: async (idArray, ordering, options= null) =>{
        let data = {
            ordering: parseInt(ordering), 
            modified: {
              user_id: 2, 
              user_name: "Truc Nguyen admin", 
              time: Date.now()
            }
       }
        if(Array.isArray(idArray)){
            for (let i = 0; i < idArray.length; i++){
                data.ordering = parseInt(ordering[i]); 
                await  ItemsModel.findByIdAndUpdate(idArray[i], data, {useFindAndModify: false});               
            } 
            return Promise.resolve("success");       
          } else {           
          return ItemsModel.findByIdAndUpdate(idArray, data, {useFindAndModify: false});    
          }
    },
    deleteItem: (id, options =  null) => {
        if(options.task == "delete-one"){
            return  ItemsModel.deleteOne({_id: id})
        } 
        if(options.task == "delete-many"){
            return ItemsModel.deleteMany({_id: {$in: id}})
        }
    },
    saveItem : (id, item, options = null) => {
        let content = item.content; 
        if(options.task == "add"){
            let created = {
                user_id: 1, 
                user_name: "Thoa Nguyen admin", 
                time: Date.now()
              }         
              item = {...item, created, content}; 
            return  ItemsModel(item).save(); 
        } 
        if(options.task == "edit"){
            let modified = {
                user_id: 2, 
                user_name: "Truc Nguyen admin", 
                time: Date.now()
              }
              item = {...item, modified, content}; 
              return ItemsModel.updateOne({_id: id}, item, {new: true})
        }
    }
}