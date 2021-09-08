export default class WorkflowDTO {
    step;
    code;
    label;
    conditions;

    constructor() {
        this.step = 1;
        this.code = '';
        this.label ='';
        this.conditions = [];
    }
}