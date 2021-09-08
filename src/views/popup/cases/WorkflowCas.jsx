import React, { Component } from 'react';
import { ListGroup, ListGroupItem } from 'reactstrap';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import MobileStepper from '@material-ui/core/MobileStepper';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';

const map = require( 'lodash/map' );
const size = require( 'lodash/size' );

const styles = theme => ({
    root: {
        flexGrow: 1,
    },
    header: {
        alignItems: 'center',
        paddingLeft: theme.spacing.unit * 4,
        marginBottom: 20,
        height: 150,
        background: theme.palette.background.default,
    },
});

class WorkflowCas extends Component {
    constructor( props ) {
        super( props );

        this.state = {
            activeStep: this.props.cas.groupment.currentWorkflowStep.value - 1,
        };

    }


    handleNext = () => {
        this.setState( {
            activeStep: this.state.activeStep + 1,
        } );
    };

    handleBack = () => {
        this.setState( {
            activeStep: this.state.activeStep - 1,
        } );
    };

    render() {
        const { classes, cas } = this.props;

        const NB_ETAPE = size( cas.groupment.workflow );

        const work = cas.groupment.workflow[ this.state.activeStep ];

        const rules = map( work.conditions, condition => {

            // this is calculated in the backend while saving the case
            const classes = condition.status === 'ACCEPTED' ? 'fa fa-check-square-o text-success' : 'fa fa-minus-square-o text-danger';
            return (
                <ListGroupItem key={condition.rule} className="justify-content-between">
                    <i className={classes}></i> {condition.rule}</ListGroupItem>
            );
        } );

        const workflow = (
            <div key={work.step}>
                <h4>{work.label}</h4>

                <ListGroup>
                    {rules}
                </ListGroup>
            </div>
        );

        return (
            <div className={classes.root}>
                <Paper square elevation={0} className={classes.header}>
                    <Typography>Étape {this.state.activeStep + 1} sur {NB_ETAPE}</Typography>

                    {workflow}
                </Paper>
                <MobileStepper
                    type="progress"
                    steps={NB_ETAPE}
                    position="static"
                    activeStep={this.state.activeStep}
                    className={classes.mobileStepper}
                    nextButton={
                        <Button dense onClick={this.handleNext} disabled={this.state.activeStep === NB_ETAPE - 1}>
                            Next
                            <KeyboardArrowRight/>
                        </Button>
                    }
                    backButton={
                        <Button dense onClick={this.handleBack} disabled={this.state.activeStep === 0}>
                            <KeyboardArrowLeft/>
                            Back
                        </Button>
                    }
                />
            </div>
        );
    }
}

WorkflowCas.propTypes = {
    cas: PropTypes.object.isRequired
};

export default withStyles( styles )( WorkflowCas );
