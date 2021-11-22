import GroupmentDTO from './GroupmentDTO';

export default class CasDTO {
    _id;
    id;
    username;
    subject;
    question;
    cat;
    vcKeys;
    filesName;
    guessEmail;
    filesStored;
    fileCase
    assistanceJuridique;
    groupment
    comments
    lastComments;
    lastCommentsDate;
    shared;
    affaire;
    channels;
    partieEmail;
    affaireItem;
    createUser;
    createDate;
    updateUser;
    updateDate;

    constructor(data) {
        this.username = { };
        this.subject = '';
        this.question = '';
        this.cat = [];
        this.vcKeys = [];
        this.filesName = [];
        this.guessEmail = [];
        this.filesStored= [];
        this.fileCase = {};
        this.assistanceJuridique = false;
        this.groupment = new GroupmentDTO();
        this.comments = {};
        this.shared = [];
        this.affaire = [];
        this.channels = [];
        this.partieEmail = [];
        if(data) {
            this._id = data._id;
            this.id = data.id;
            this.username = data.username;
            this.subject = data.subject;
            this.question = data.question;
            this.cat = data.cat;
            this.vcKeys = data.vcKeys;
            this.filesName = data.filesName;
            this.guessEmail = data.guessEmail;
            this.filesStored = data.filesStored;
            this.fileCase = data.fileCase;
            this.assistanceJuridique = data.assistanceJuridique;
            this.groupment = data.groupment;
            this.comments = data.comments;
            this.lastComments = data.lastComments;
            this.lastCommentsDate = data.lastCommentsDate;
            this.shared = data.shared;
            this.affaire = data.affaire;
            this.affaireItem = data.affaireItem;
            this.channels = data.channels;
            this.partieEmail = data.partieEmail;
            this.createDate = data.createDate;
            this.updateUser = data.updateUser;
            this.updateDate = data.updateDate;
            this.createUser = data.createUser;
        }
    }
}