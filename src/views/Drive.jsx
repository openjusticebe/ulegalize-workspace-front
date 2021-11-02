import React, { useEffect, useRef, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

// reactstrap components
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    CardTitle,
    Col, Input, Modal, ModalBody, ModalFooter, ModalHeader,
    Row,
} from 'reactstrap';
import DriveContent from '../components/Drive/DriveContent';
import {
    createFolder,
    deletingFile, deletingFolder,
    downloadFile,
    getDossierFilesList,
    renameFile, renameFolder, shareLink, shareObject,
    uploadFile
} from '../services/DriveService';
import ObjectResponseDTO from '../model/drive/ObjectResponseDTO';
import { getOptionNotification } from '../utils/AlertUtils';
import NotificationAlert from 'react-notification-alert';
import { downloadWithName } from '../utils/TableUtils';
import ModalCheckSessionDrive from './popup/drive/ModalCheckSessionDrive';
import { checkPaymentActivated } from '../services/PaymentServices';
import ModalEMailSign from './affaire/mail/recommande/ModalEMailSign';
import ModalNoActivePayment from './affaire/popup/ModalNoActivePayment';

// nodejs library that concatenates classes
const map = require( 'lodash/map' );
const last = require( 'lodash/last' );
const split = require( 'lodash/split' );
const isEmpty = require( 'lodash/isEmpty' );
const isNil = require( 'lodash/isNil' );

export default function Drive(props) {
    const {
        label,
        driveType,
        userId,
        vckeySelected,
        email
    } = props;
    const notificationAlert = useRef( null );
    const currentPath = useRef( props.currentPath ? props.currentPath : '' );
    const [loading, setLoading] = useState( false );
    const [modalNotPaidSignDocument, setModalNotPaidSignDocument] = useState( false );
    const [documentFile, setDocumentFile] = useState( [] );
    const [modalEmailDisplay, setModalEmailDisplay] = useState( false );
    const [openModdalShare, setOpenModdalShare] = useState( false );
    const updatedDrive = useRef( false );
    const shareLinkRef = useRef( false );
    const [checkTokenDrive, setCheckTokenDrive] = useState( false );

    /*************/
    /* RECENT */
    /*************/

    const { getAccessTokenSilently } = useAuth0();
    const [drive, setDrive] = useState(  );

    const _togglePopupCheckSession = ( message, type ) => {
        if ( !isNil( message ) && !isNil( type ) ) {
            notificationAlert.current.notificationAlert( getOptionNotification( message, type ) );
        }
        setCheckTokenDrive( !checkTokenDrive );
    };

    const showMessage = ( message, type ) => {
        if ( message && type ) {
            notificationAlert.current.notificationAlert( getOptionNotification( message, type ) );
        }
    };
    const _uploadFile = async ( formData ) => {
        setLoading(true);
        const accessToken = await getAccessTokenSilently();
        formData.append('path', currentPath.current);

        let result = await uploadFile(accessToken, formData);
        if (!result.error) {
            notificationAlert.current.notificationAlert(getOptionNotification(label.common.success3, 'success'));
        } else {
            notificationAlert.current.notificationAlert(getOptionNotification(label.common.error5, 'danger'));
        }
        setTimeout( function () {
            updatedDrive.current = !updatedDrive.current;
            setLoading(false);
        }, 100 );
    };
    const _downloadFile = async ( path ) => {
        const accessToken = await getAccessTokenSilently();
        let fileName = last( split( path, '/' ) );

        let result = await downloadFile(accessToken, encodeURIComponent(path));
        if (!result.error) {
            notificationAlert.current.notificationAlert(getOptionNotification(label.common.success3, 'success'));
            downloadWithName( result.data , fileName );

        } else {
            notificationAlert.current.notificationAlert(getOptionNotification(label.common.error5, 'danger'));
        }
    };
    const _sendByEmail = async ( path ) => {
        const accessToken = await getAccessTokenSilently();
        let resultPayment = await checkPaymentActivated( accessToken );
        if ( !isNil( resultPayment ) &&  resultPayment.data === true ) {
            _toggleRegisteredEmail();
            // get pdf file
            let fileName = last( split( path, '/' ) );
            let result = await downloadFile(accessToken, encodeURIComponent(path));
            if ( !result.error ) {
                let pdf = new File([result.data.binary], fileName, {
                    type: result.data.contentType,
                });
                setDocumentFile(pdf)
            } else {
                showMessage( label.invoice.alert103, 'danger' );
            }
        } else {
            _toggleUnPaid();
        }

    };

    const _toggleUnPaid = () => {
        setModalNotPaidSignDocument( !modalNotPaidSignDocument );
    };
    const _toggleRegisteredEmail = () => {
        setModalEmailDisplay( !modalEmailDisplay );
    };
    const _getObjectList = async ( path ) => {
        updatedDrive.current = !updatedDrive.current;
        currentPath.current = path;
        setLoading(true);

    };
    const _createFolder = async ( path ) => {
        setLoading(true);
        const accessToken = await getAccessTokenSilently();

        let fullpath = path;
        if(!isEmpty(currentPath.current)) {
            fullpath = currentPath.current + path;
        }
        await createFolder(accessToken, fullpath)
        updatedDrive.current = !updatedDrive.current;
        setLoading(false);

    };
    const _renameFile = async ( newfilename, path ) => {
        setLoading(true);
        const accessToken = await getAccessTokenSilently();

        const pathFrom =  path;
        const pathTo = currentPath.current ;

        await renameFile(accessToken, newfilename, pathFrom, pathTo)
        updatedDrive.current = !updatedDrive.current;
        setLoading(false);

    };

    const _renameFolder = async ( newFolderName, currentFolderName ) => {
        setLoading(true);
        const accessToken = await getAccessTokenSilently();

        const pathFrom =  currentFolderName;
        const pathTo = currentPath.current + newFolderName;

        await renameFolder(accessToken, pathFrom, pathTo)
        updatedDrive.current = !updatedDrive.current;
        setLoading(false);

    };

    const _removeFile = async ( path ) => {
        setLoading(true);
        const accessToken = await getAccessTokenSilently();

        await deletingFile(accessToken, path);
        updatedDrive.current = !updatedDrive.current;
        setLoading(false);

    };
    const _removeFolder = async ( path ) => {
        setLoading(true);
        const accessToken = await getAccessTokenSilently();

        await deletingFolder(accessToken, path);
        updatedDrive.current = !updatedDrive.current;
        setLoading(false);

    };
    const _shareTo = async ( data ) => {
        setLoading(true);
        const accessToken = await getAccessTokenSilently();

        const result = await shareObject(accessToken, data);
        if(result.error) {
            notificationAlert.current.notificationAlert(getOptionNotification(label.common.error7, 'danger'));
        } else {
            notificationAlert.current.notificationAlert(getOptionNotification(label.common.success4, 'primary'));
        }
        updatedDrive.current = !updatedDrive.current;
        setLoading(false);

    };
    const _shareLink = async ( path ) => {
        setLoading(true);
        const accessToken = await getAccessTokenSilently();

        const result = await shareLink(accessToken, path);
        if(result.error) {
            notificationAlert.current.notificationAlert(getOptionNotification(label.common.error7, 'danger'));
        } else {
            shareLinkRef.current = result.data;
            setOpenModdalShare(!openModdalShare);
        }
        setLoading(false);

    };
    const _copy = async ( e ) => {
        navigator.clipboard.writeText(shareLinkRef.current);
        notificationAlert.current.notificationAlert(getOptionNotification(label.common.copy, 'primary'));

    };


    useEffect( () => {
        (async () => {

            const accessToken = await getAccessTokenSilently();
// get prestation for invoice
                let resultDrive = await getDossierFilesList( accessToken, currentPath.current );

                if ( !resultDrive.error ) {
                    let drivesList = map( resultDrive.data, prest => {
                        return new ObjectResponseDTO( prest );
                    } );
                    setDrive( drivesList );
                }
            setLoading(false);


            if ( !isNil( driveType ) && driveType === 'dropbox' ) {
                setCheckTokenDrive( true );
            }

        })();
    }, [getAccessTokenSilently, updatedDrive.current ] );

    return (
        <>
            <div className="content">
                <div className="rna-container">
                    <NotificationAlert ref={notificationAlert}/>
                </div>
                <Row>
                    <Col className="ml-auto mr-auto" md="12" sm={12}>
                        <Card className="card-chart">
                            <CardHeader>
                                <CardTitle tag="h4">{label.drive.title}</CardTitle>
                            </CardHeader>
                            <CardBody>
                                <DriveContent
                                    label={label}
                                    currentPath={currentPath.current}
                                    createFolder={_createFolder}
                                    renameFolder={_renameFolder}
                                    renameFile={_renameFile}
                                    uploadFile={_uploadFile}
                                    shareLink={_shareLink}
                                    shareTo={_shareTo}
                                    removeFile={_removeFile}
                                    removeFolder={_removeFolder}
                                    getObjectList={_getObjectList}
                                    downloadFile={_downloadFile}
                                    sendByEmail={_sendByEmail}
                                    showMessage={showMessage}
                                    isLoading={loading}
                                    drive={drive}/>
                                {openModdalShare ? (
                                    <Modal size='md' isOpen={openModdalShare} toggle={() => setOpenModdalShare(!openModdalShare)}>
                                        <ModalHeader toggle={() => setOpenModdalShare(!openModdalShare)}></ModalHeader>
                                        <ModalBody>
                                            <Input
                                                disabled
                                                rows={2}
                                                className="form-control"
                                                value={shareLinkRef.current}
                                                type="textarea"/>
                                        </ModalBody>
                                        <ModalFooter>
                                            <Button color="secondary" onClick={() => setOpenModdalShare(!openModdalShare)}>{label.common.cancel}</Button>
                                            <Button color="secondary" onClick={_copy} >{label.common.copy}</Button>
                                        </ModalFooter>
                                    </Modal>
                                ) : null}
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </div>
            {checkTokenDrive ?
                (
                    <ModalCheckSessionDrive
                        label={label}
                        toggle={_togglePopupCheckSession}
                        checkTokenDrive={checkTokenDrive}/>
                ) : null}

            {modalEmailDisplay ? (
                <ModalEMailSign
                    attachedFile={documentFile}
                    dossierId={null}
                    label={label}
                    userId={userId}
                    email={email}
                    vckeySelected={vckeySelected}
                    clientId={null}
                    showMessage={showMessage}
                    updateList={()=>{}}
                    showMessagePopup={showMessage}
                    toggleModalDetails={_toggleRegisteredEmail}
                    modalDisplay={modalEmailDisplay}/>
            ) : null}

            {modalNotPaidSignDocument ? (
                <ModalNoActivePayment
                    label={label}
                    toggleModalDetails={_toggleUnPaid}
                    modalDisplay={modalNotPaidSignDocument}/>
            ) : null}
        </>
    );
}