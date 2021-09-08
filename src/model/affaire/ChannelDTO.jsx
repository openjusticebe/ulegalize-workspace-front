export default class ChannelDTO {
    _id;
    id;
    filesStored;
    fileCase
    comments;
    parties;
    createUser;
    createDate;
    updateUser;
    updateDate;

    constructor(data) {
        this.filesStored= [];
        this.fileCase = {};
        this.comments = [];
        this.parties = [];
        if(data) {
            this._id = data._id;
            this.id = data.id;
            this.filesStored = data.filesStored;
            this.fileCase = data.fileCase;
            this.comments = data.comments;
            this.parties = data.parties;
            this.createDate = data.createDate;
            this.updateUser = data.updateUser;
            this.updateDate = data.updateDate;
            this.createUser = data.createUser;
        }
    }
}