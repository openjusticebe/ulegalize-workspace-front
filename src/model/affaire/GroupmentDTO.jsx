import ItemDTO from '../ItemDTO';
import WorkflowDTO from './WorkflowDTO';

export default class GroupmentDTO {
    id;
    description;
    code;
    currentWorkflowStep;
    workflow;

    constructor() {
        this.id = 0;
        this.description = '';

        this.currentWorkflowStep = new ItemDTO();
        this.code = '';
        this.workflow = [];
        this.workflow.push(new WorkflowDTO());
    }
}