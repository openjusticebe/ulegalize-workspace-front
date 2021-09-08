import ItemDTO from '../ItemDTO';

export default class ShareFileDTO {

    id;
    usersItem = new ItemDTO();
    usersId;
    obj;
    msg;

    right;
    rightItem;
    size;
    shared_with;

    constructor( data ) {
        if(data) {
            this.id = data.id;
            this.usersItem = data.usersItem;
            this.usersId = data.usersId;
            this.obj = data.obj;
            this.msg = data.msg;
            this.right =  data.right ;
            this.rightItem =  data.rightItem ;
            this.size =  data.size ;
            this.shared_with =  data.shared_with ;
        }
    }
}