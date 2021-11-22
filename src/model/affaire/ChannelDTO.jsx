export default class ChannelDTO {
    _id;
    id;
    caseId;
    filesStored;
    fileCase
    comments;
    parties;
    lastComments;
    lastCommentsDate;
    affaireItem;
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
            this.caseId = data.caseId;
            this.filesStored = data.filesStored;
            this.fileCase = data.fileCase;
            this.comments = data.comments;
            this.parties = data.parties;
            this.lastComments = data.lastComments;
            this.lastCommentsDate = data.lastCommentsDate;
            this.affaireItem = data.affaireItem;
            this.createDate = data.createDate;
            this.updateUser = data.updateUser;
            this.updateDate = data.updateDate;
            this.createUser = data.createUser;
        }
    }
}