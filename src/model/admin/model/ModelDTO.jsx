
export default class ModelDTO {
    id;
    name;
    context;
    contextItem
    format;
    formatItem;
    description;
    template;
    templateItem;
    type;

    constructor(data) {
        if(data) {
            this.id = data.id;
            this.name = data.name;
            this.context = data.context ;
            this.contextItem = data.contextItem ;
            this.format = data.format ;
            this.formatItem = data.formatItem ;
            this.description = data.description ;
            this.template = data.template ;
            this.templateItem = data.templateItem ;
            this.type = data.type ;
        }
    }
}