import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Popover from '@material-ui/core/Popover';
import Folder from '@material-ui/icons/Folder';
import CloudUpload from '@material-ui/icons/CloudUpload';
import AddIcon from '@material-ui/icons/Add';


const styles = theme => ({
    root: {
        width: '100%',
        maxWidth: 360,
        background: theme.palette.background.paper,
    },
    button: {
        margin: theme.spacing.unit,
    },
    rightIcon: {
        marginLeft: theme.spacing.unit,
    },
});

class PopoverDrive extends Component {
    constructor( props ) {
        super( props );
        this.state = {
            openPopOverCreation: false,
        };

        this._popOverCreation = this._popOverCreation.bind( this );
        this._toggleCreationFolder = this._toggleCreationFolder.bind( this );
    }

    _toggleCreationFolder( event ) {
        const { drivePath } = this.props;

        this.setState( { openPopOverCreation: !this.state.openPopOverCreation } );

        this.props.toggleCreationFolder( event, drivePath );
    }

    _popOverCreation( e ) {
        this.setState( { openPopOverCreation: !this.state.openPopOverCreation } );
    }

    render() {
        const { classes } = this.props;

        return (
            <div>
                <Button
                    onClick={this._popOverCreation}
                    fab color="primary" aria-label="add" className={classes.button}>
                    <AddIcon/>
                </Button>
                <Popover
                    open={this.state.openPopOverCreation}
                    anchorReference='anchorEl'
                    onClose={this._popOverCreation}
                    anchorOrigin={{
                        vertical: 'center',
                        horizontal: 'center',
                    }}
                    transformOrigin={{
                        vertical: 'center',
                        horizontal: 'center',
                    }}
                >
                    <Button color="default" raised
                            component="label" use instead of containerElement
                            onClick={this._toggleCreationFolder}
                            className={classes.button} aria-label="Folder">
                        Dossier
                        <Folder/>
                    </Button>
                    <Button
                        raised
                        component="label" use instead of containerElement
                        className={classes.button}
                    >
                        {'Upload'}
                        <CloudUpload className={classes.rightIcon}/>
                        <input
                            onChange={
                                ( e ) => {
                                    e.preventDefault();

                                    const files = [ ...e.target.files ];
                                    let formData = new FormData();
                                    formData.append('files', files[0]);
                                    let reader = new FileReader();
                                    let file = files[0];

                                    reader.onloadend = () => {
                                        this.props.uploadFile(formData)
                                    };
                                    reader.readAsDataURL(file);

                                    this.setState( { openPopOverCreation: !this.state.openPopOverCreation } );
                                }
                            }
                            style={{ display: 'none' }}
                            type="file"
                        />
                    </Button>
                </Popover>
            </div>
        );
    }
}

PopoverDrive.propTypes = {
    pathNameCreate: PropTypes.object.isRequired,
    pathContainerCreate: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired,
    uploadFile: PropTypes.func,
    toggleCreationFolder: PropTypes.func
};

export default withStyles( styles )( PopoverDrive );
