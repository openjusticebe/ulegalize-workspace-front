import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Col } from 'reactstrap';

import {
    List,
    ListItem,
    ListItemAvatar,
    ListItemSecondaryAction,
    ListItemText,
    Menu,
    MenuItem
} from '@material-ui/core';
import Avatar from '@material-ui/core/Avatar';
import ListSubheader from '@material-ui/core/ListSubheader';
import Divider from '@material-ui/core/Divider';
import { withStyles } from '@material-ui/core/styles';
import Dropzone from 'react-dropzone';
// see icon doc: https://github.com/mui-org/material-ui/tree/v1-beta/packages/material-ui-icons/src
// https://materialdesignicons.com/
import FolderIcon from '@material-ui/icons/Folder';
import ActionAssignment from '@material-ui/icons/Assignment';
import ModalSaveFolder from './ModalSaveFolder';
import IconButton from '@material-ui/core/IconButton';
import MoreVertIcon from '@material-ui/icons/MoreVert';
//import ConfirmModal from '../../shared/ConfirmModal';
import PopoverDrive from './PopoverDrive';
import ReactLoading from 'react-loading';
import { getDateDetails } from '../../utils/DateUtils';
import PictureAsPdfIcon from '@material-ui/icons/PictureAsPdf';
import BreadcrumbDrive from './BreadcrumbDrive';
import ReactBSAlert from 'react-bootstrap-sweetalert';
import ModalShareDrive from './ModalShareDrive';

const map = require( 'lodash/map' );
const isNil = require( 'lodash/isNil' );
const size = require( 'lodash/size' );
const split = require( 'lodash/split' );
const slice = require( 'lodash/slice' );
const last = require( 'lodash/last' );
const filter = require( 'lodash/filter' );
const isEmpty = require( 'lodash/isEmpty' );

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

class DriveContent extends Component {
    constructor( props ) {
        super( props );
        this.state = {
            deleteAlert: null,
            toggled: false,
            openFolder: false,
            openFile: false,
            anchorEl: null,
            openModalShare: false,
            openModalRename: false,
            openModalFileRename: false,
            openModalFolder: false,
            openModalConfirm: false,
            currentPathToRename: '',
            titleConfirm: '',
            messageConfirm: '',
            path: null,
            files: []
        };

        this.onDrop = this.onDrop.bind( this );
        this._handleFolderClick = this._handleFolderClick.bind( this );
        this._toggleModalRename = this._toggleModalRename.bind( this );
        this._toggleModalShare = this._toggleModalShare.bind( this );
        this._handleFileClick = this._handleFileClick.bind( this );
        this._handleClose = this._handleClose.bind( this );
        this._toggleCreationFolder = this._toggleCreationFolder.bind( this );
        this._createFolder = this._createFolder.bind( this );
        this._renameObject = this._renameObject.bind( this );
        this._deleteObject = this._deleteObject.bind( this );
        this._toggleModalDelete = this._toggleModalDelete.bind( this );
        this._toggleModalDeleteFolder = this._toggleModalDeleteFolder.bind( this );
        this._getObjectList = this._getObjectList.bind( this );
    }

    onDrop( files ) {
        let formData = new FormData();
        formData.append( 'files', files[ 0 ] );
        let reader = new FileReader();
        let file = files[ 0 ];

        reader.onloadend = () => {
            this.props.uploadFile( formData );
        };
        reader.readAsDataURL( file );
    }

    _handleFolderClick( event, path ) {
        this.setState( { openFolder: true, anchorEl: event.currentTarget, currentPathToRename: path } );
    }

    _handleClose() {
        this.setState( { openFolder: false, openFile: false, anchorEl: null } );
    }

    _handleFileClick( event, path ) {
        this.setState( { openFile: true, anchorEl: event.currentTarget, currentPathToRename: path } );
    }

    _toggleModalRename() {
        this._handleClose();
        this.setState( { openModalRename: !this.state.openModalRename } );
    }

    _toggleModalDeleteFolder() {
        const { currentPathToRename } = this.state;
        this._handleClose();
        this.props.removeFolder( currentPathToRename.name );
    }

    _toggleModalDelete() {
        const { currentPathToRename } = this.state;
        this._handleClose();
        this.props.removeFile( currentPathToRename.name );
    }

    _toggleCreationFolder( event, path ) {
        this.setState( { openModalFolder: !this.state.openModalFolder, currentPathToRename: path } );
    }

    _toggleModalShare( event, path ) {
        this.setState( { openModalShare: !this.state.openModalShare } );
    }

    _createFolder( nameFolder ) {
        // path
        const newNameFolder = nameFolder + '/';
        this.props.createFolder( newNameFolder );
        this.setState( { openModalFolder: !this.state.openModalFolder } );
    }

    _renameObject( newName ) {
        const { currentPathToRename } = this.state;

        if ( isNil( currentPathToRename.size ) ) {

            const newNameWithExtension = newName + '/';
            this.props.renameFolder( newNameWithExtension, currentPathToRename.name );
        } else {
            const extension = currentPathToRename.name.split( '.' ).pop();

            const newNameWithExtension = newName + '.' + extension;
            this.props.renameFile( newNameWithExtension, currentPathToRename.name );
        }
        this._toggleModalRename();

    }

    _deleteObject() {
        const { currentPathToRename } = this.state;
        this.props.removeFile( currentPathToRename.name );
        this._toggleModalDelete();
    }

    _doubleDownloadFile( path ) {
        this._handleClose();
        this.props.downloadFile( path );
    }

    _downloadFile( path ) {
        const { currentPathToRename } = this.state;
        this._handleClose();
        this.props.downloadFile( currentPathToRename.name );
    }

    _shareTo( data ) {
        const { currentPathToRename } = this.state;
        data.obj = currentPathToRename.name;
        data.size = currentPathToRename.size;
        this.props.shareTo( data );
    }

    _shareToLink() {
        const { currentPathToRename } = this.state;
        this._handleClose();
        this.props.shareLink( currentPathToRename.name );
    }

    async _sendByEmail() {
        const { currentPathToRename } = this.state;
        this._handleClose();
        this.props.sendByEmail( currentPathToRename.name );
    }

    _getObjectList( path ) {
        this._handleClose();
        this.props.getObjectList( path );
    }

    _handleModalShare( e ) {
        this._handleClose();
        this.setState( { openModalShare: !this.state.openModalShare } );
    }

    render() {
        const { classes, drive, isLoading, currentPath, label } = this.props;
        const { deleteAlert, openModalShare, openModalRename, currentPathToRename, openModalFolder } = this.state;
        const ITEM_HEIGHT = 60;

        // last item is the loading variable
        if ( isNil( drive ) || isLoading ) {
            return (
                <Col md={12} sm={12} className="space-bottom-2x" key="circ">
                    <ReactLoading className="loading" height={'20%'} width={'20%'}/>
                </Col>
            );
        }

        const overlayStyle = {
            minHeight: '400px',
        };
        const overlayStyleActive = {
            background: 'rgba(0,0,0,0.5)',
            minHeight: '400px',
        };

        const containsFolders = filter( drive, data => {
            return isNil( data.size );
        } );
        const containsFiles = filter( drive, data => {
            return !isNil( data.size );
        } );

        // reject null value
        // list of folders
        const folders = !isEmpty( containsFolders ) ? map( containsFolders, ( pathFolder ) => {

            // to be improve if size is null: FOLDER
            //if ( isNil(pathFolder.size) ) {
            let folderName = split( pathFolder.name, '/' );

            const minSize = size( folderName ) - 2 <= 0 ? 0 : size( folderName ) - 2;
            folderName = slice( folderName, minSize, size( folderName ) - 1 );

            const folderDate = (pathFolder.lastModified);

            return (
                <div key={pathFolder.name}>
                    <ListItem
                        key={pathFolder.name}
                        dense
                        button
                        onClick={( event ) => this._getObjectList( pathFolder.name )}

                    >
                        <ListItemAvatar>
                            <Avatar>
                                <FolderIcon/>
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText primary={folderName}
                                      secondary={folderDate}/>
                        {/* ENTIRE MENU MUST BE DISPLAY BECAUSE OF ISSUE ON MENUITEM*/}
                        {folderName && folderName[ 0 ] !== 'dossiers' && folderName[ 0 ] !== 'templates' && folderName[ 0 ] !== 'factures' ? (

                            <ListItemSecondaryAction>

                                <IconButton
                                    aria-label="More"
                                    aria-owns="long-menu"
                                    aria-haspopup="true"
                                    onClick={( event ) => this._handleFolderClick( event, pathFolder )}
                                >
                                    <MoreVertIcon/>
                                </IconButton>
                                <Menu
                                    anchorEl={this.state.anchorEl}
                                    open={this.state.openFolder && this.state.currentPathToRename.name === pathFolder.name}
                                    onClose={this._handleClose}
                                    PaperProps={{
                                        style: {
                                            maxHeight: ITEM_HEIGHT * 4.5,
                                            width: 200,
                                        },
                                    }}>
                                    <MenuItem
                                        onClick={() => this._toggleModalRename()}>{label.drive.label2}</MenuItem>
                                    <MenuItem onClick={() =>
                                        this.setState( {
                                                deleteAlert: (<ReactBSAlert
                                                    warning
                                                    style={{ display: 'block', marginTop: '100px' }}
                                                    title={label.common.label10}
                                                    onConfirm={() => {
                                                        this._toggleModalDeleteFolder();
                                                        this.setState( { deleteAlert: null } );
                                                    }}
                                                    onCancel={() => { this.setState( { deleteAlert: null } ); }}
                                                    confirmBtnBsStyle="success"
                                                    cancelBtnBsStyle="danger"
                                                    confirmBtnText={label.common.label11}
                                                    cancelBtnText={label.common.cancel}
                                                    showCancel
                                                    btnSize=""
                                                >
                                                    {label.common.label12}
                                                </ReactBSAlert>)
                                            }
                                        )

                                    }>{label.drive.label3}</MenuItem>
                                    <MenuItem
                                        onClick={() => this._handleModalShare( pathFolder.name )}>{label.drive.label7}</MenuItem>
                                </Menu>


                            </ListItemSecondaryAction>
                        ) : null}

                    </ListItem>

                </div>

            );
            //} else {
            //    return null;
            //}
        } ) : null;

        // list of files
        const files = map( containsFiles, ( path ) => {

            const fileDate = getDateDetails( path.lastModified );

            // to be improve if size is not null: FILE
            let fileName = last( split( path.name, '/' ) );
            const extension = path.name.split( '.' ).pop();

            return (
                <ListItem
                    dense
                    button
                    key={path.name}
                >
                    <ListItemAvatar>
                        <Avatar className={classes.avatarFileDoc}>
                            {extension === 'pdf' ? (
                                <PictureAsPdfIcon color="secondary"/>
                            ) : (
                                <ActionAssignment color="primary"/>
                            )}
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                        onDoubleClick={() => this._doubleDownloadFile( path.name )}
                        primary={fileName} secondary={fileDate}/>
                    <ListItemSecondaryAction>

                        <IconButton
                            aria-label="More"
                            aria-owns="long-menu"
                            aria-haspopup="true"
                            onClick={( event ) => this._handleFileClick( event, path )}>
                            <MoreVertIcon/>
                        </IconButton>
                        <Menu
                            anchorEl={this.state.anchorEl}
                            open={this.state.openFile}
                            onClose={this._handleClose}
                            PaperProps={{
                                style: {
                                    maxHeight: ITEM_HEIGHT * 4.5,
                                    width: 200,
                                },
                            }}>

                            <MenuItem onClick={() => this._downloadFile( path.name )}>{label.drive.label4}</MenuItem>
                            <Divider/>
                            <MenuItem
                                onClick={( event ) => this._toggleModalRename( event, path )}>{label.drive.label2}</MenuItem>
                            <MenuItem onClick={() => {
                                this.setState( {
                                        deleteAlert: (<ReactBSAlert
                                            warning
                                            style={{ display: 'block', marginTop: '100px' }}
                                            title={label.common.label10}
                                            onConfirm={() => {
                                                this._toggleModalDelete();
                                                this.setState( { deleteAlert: null } );
                                            }}
                                            onCancel={() => { this.setState( { deleteAlert: null } ); }}
                                            confirmBtnBsStyle="success"
                                            cancelBtnBsStyle="danger"
                                            confirmBtnText={label.common.label11}
                                            cancelBtnText={label.common.cancel}
                                            showCancel
                                            btnSize=""
                                        >
                                            {label.common.label12}
                                        </ReactBSAlert>)
                                    }
                                );
                            }}>{label.drive.label3}</MenuItem>
                            <MenuItem
                                onClick={() => this._handleModalShare( path.name )}>{label.drive.label7}</MenuItem>
                            <MenuItem onClick={() => this._shareToLink( path.name )}>{label.drive.label8}</MenuItem>
                            {extension === 'pdf' ? (
                                <MenuItem
                                    onClick={() => this._sendByEmail( path.name )}>{label.drive.label21}</MenuItem>
                            ) : null}
                        </Menu>


                    </ListItemSecondaryAction>

                </ListItem>
            );
        } );

        return (
            <div>
                {deleteAlert}
                <BreadcrumbDrive
                    drive={currentPath}
                    getFolderDrive={this._getObjectList}
                    isLoading={isLoading}/>
                <Dropzone key="dropzone"
                          onDrop={this.onDrop}
                          style={overlayStyle}
                          activeStyle={overlayStyleActive}
                          disableClick>
                    {( { getRootProps, getInputProps } ) => (
                        <section>
                            <div {...getRootProps()} style={overlayStyle}>
                                <Col md={{ size: 2 }}>
                                    <PopoverDrive
                                        uploadFile={this.props.uploadFile}
                                        toggleCreationFolder={this._toggleCreationFolder}
                                        classes={classes}
                                        drivePath={currentPath}
                                    />
                                </Col>
                                {containsFolders && !isEmpty( containsFolders ) ? (
                                    <div>
                                        <List subheader={<ListSubheader>{label.drive.label5}</ListSubheader>}>
                                            {folders}
                                        </List>
                                    </div>
                                ) : null}
                                {containsFiles && !isEmpty( containsFiles ) ? (
                                    <div>
                                        <Divider inset/>
                                        <List subheader={<ListSubheader>{label.drive.label6}</ListSubheader>}>
                                            {files}
                                        </List>
                                    </div>
                                ) : null}
                            </div>
                        </section>
                    )}
                </Dropzone>

                {openModalRename ? (
                    <ModalSaveFolder
                        label={label}
                        title={label.drive.label2}
                        saveButton={label.common.update}
                        currentName={this.state.currentPathToRename.name}
                        isFolder={isNil( this.state.currentPathToRename.size )}
                        openModalFolder={openModalRename}
                        saveFolder={( newName ) => this._renameObject( newName )}
                        toggleModalFolder={this._toggleModalRename}/>
                ) : null}

                {openModalFolder ? (
                    <ModalSaveFolder
                        label={label}
                        title={label.common.new}
                        saveButton={label.common.add}
                        isFolder={true}
                        openModalFolder={openModalFolder}
                        saveFolder={( newName ) => this._createFolder( newName )}
                        toggleModalFolder={this._toggleCreationFolder}/>
                ) : null}

                {openModalShare ? (
                    <ModalShareDrive
                        label={label}
                        saveButton={label.common.add}
                        path={currentPathToRename}
                        modalDisplay={openModalShare}
                        saveShare={( data ) => this._shareTo( data )}
                        toggle={this._toggleModalShare}/>
                ) : null}
            </div>

        );
    }
}

// Spécifie les valeurs par défaut des props :
DriveContent.defaultProps = {
    onlyFolder: false
};
DriveContent.propTypes = {
    onlyFolder: PropTypes.bool.isRequired,
    drive: PropTypes.array.isRequired,
    classes: PropTypes.object.isRequired,
    match: PropTypes.object,
    getFolderDrive: PropTypes.func,
    loadDrivePage: PropTypes.func,
    createFolder: PropTypes.func,
    renameFolder: PropTypes.func,
    renameFile: PropTypes.func,
    removeFile: PropTypes.func,
    removeFolder: PropTypes.func,
    downloadFile: PropTypes.func
};

export default withStyles( styles )( DriveContent );
//export default DriveContent;
