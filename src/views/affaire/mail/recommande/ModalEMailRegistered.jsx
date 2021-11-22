import React, { useEffect, useRef, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Table } from 'reactstrap';
import { getEmailById, getHtmlById, getPdfById } from '../../../../services/EmailRegisteredService';
import EmailGenerator from './EMailGenerator';
import EmailDTO from '../../../../model/affaire/email/EmailDTO';
import { getDossierFilesList } from '../../../../services/DriveService';
import ObjectResponseDTO from '../../../../model/drive/ObjectResponseDTO';
import { Document, Page } from 'react-pdf';
import { b64toBlob, downloadBlob } from '../../../../utils/TableUtils';

const isEmpty = require( 'lodash/isEmpty' );
const map = require( 'lodash/map' );

const ModalEMailRegistered = ( { showMessage, label, isOpen, toggle, id } ) => {
    const { getAccessTokenSilently } = useAuth0();
    const [listFiles, setListFiles] = useState( [] );
    const [thisIsMyCopy, setthisIsMyCopy] = useState( null );
    const [showEmailGenerator, setShowEmailGenerator] = useState( false );
    const email = useRef( null );
    const pathToShow = useRef( null );
    const [numPages, setNumPages] = useState( null );
    const [pageNumber, setPageNumber] = useState( 1 );

    const _onDocumentLoadSuccess = ( { numPages } ) => {
        setNumPages( numPages );
    };
    useEffect( () => {
        (async () => {
            const accessToken = await getAccessTokenSilently();
            let result;
            let emailTmp;
            result = await getEmailById( accessToken, id );

            if ( !result.error ) {
                emailTmp = new EmailDTO( result.data );
                email.current = emailTmp;

                const resultDrive = await getDossierFilesList( accessToken, emailTmp.pathFolder );
                if ( !resultDrive.error ) {
                    let drivesList = map( resultDrive.data, prest => {
                        return new ObjectResponseDTO( prest );
                    } );
                    setListFiles( drivesList );
                }
            } else {
                showMessage( label.mail.error1, 'danger' );
            }
            result = await getPdfById( accessToken, id );

            if ( !result.error ) {
                let pdf = b64toBlob( result.data, '' );
                setthisIsMyCopy( pdf );
                //downloadBlob(result.data, 'test')
            } else {
                showMessage( label.invoice.alert103, 'danger' );
            }

        })();
    }, [getAccessTokenSilently] );

    const _previewPdf = (path) => {
        pathToShow.current = path;
        if(!showEmailGenerator) {
            setShowEmailGenerator(true);
        }
    };
    return (
        <Modal size="lg" style={{ width: 'fit-content' }} isOpen={isOpen} toggle={toggle}>
            <ModalHeader>
                <button type="button" className="close" data-dismiss="modal" aria-label="Close"
                        onClick={toggle}>
                    <i className="tim-icons icon-simple-remove"></i>
                </button>
                <h4 className="modal-title">{label.invoice.label106}</h4>
            </ModalHeader>
            <ModalBody>
                {thisIsMyCopy ?(
                        <Document
                            file={thisIsMyCopy}
                            onLoadSuccess={_onDocumentLoadSuccess}>
                            <Page pageNumber={pageNumber}/>
                        </Document>
                ): null}
                <Table>
                    {!isEmpty( listFiles ) ? map( listFiles, file => {
                            return (
                                <tr>
                                    <Button
                                        onClick={()=>_previewPdf(file.name)}
                                        color="primary" size="sm" className="btn-link">
                                        <i className="fa fa-eye "/> {' '}
                                        {file.name}
                                    </Button>
                                </tr>
                            );
                        }
                    ) : null}
                </Table>
                {showEmailGenerator ? (
                    <EmailGenerator
                        showMessage={showMessage}
                        path={pathToShow.current}
                        label={label}
                    />
                ) : null}
            </ModalBody>
            <ModalFooter>
                <Button color="secondary"
                        onClick={toggle}>
                    {label.common.close}
                </Button>
            </ModalFooter>
        </Modal>);
};

export default ModalEMailRegistered;