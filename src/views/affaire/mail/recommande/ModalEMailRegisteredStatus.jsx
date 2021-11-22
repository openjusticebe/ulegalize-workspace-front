import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { getHtmlById, getPdfById } from '../../../../services/EmailRegisteredService';
import { Document, Page } from 'react-pdf';
import { b64toBlob } from '../../../../utils/TableUtils';
import ReactLoading from 'react-loading';

const ModalEMailRegisteredStatus = ( { showMessage, label, isOpen, toggle, id } ) => {
    const { getAccessTokenSilently } = useAuth0();
    const [thisIsMyCopy, setthisIsMyCopy] = useState( null );
    const [numPages, setNumPages] = useState( null );
    const [pageNumber, setPageNumber] = useState( 1 );

    const _onDocumentLoadSuccess = ( { numPages } ) => {
        setNumPages( numPages );
    };
    useEffect( () => {
        (async () => {
            const accessToken = await getAccessTokenSilently();

            const result = await getPdfById( accessToken, id );

            if ( !result.error ) {
                let pdf = b64toBlob( result.data, '' );
                setthisIsMyCopy( pdf );
            } else {
                showMessage( label.invoice.alert103, 'danger' );
            }

        })();
    }, [getAccessTokenSilently] );

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
                ): (
                    <ReactLoading className="loading" height={'20%'} width={'20%'}/>
                )}
            </ModalBody>
            <ModalFooter>
                <Button color="secondary"
                        onClick={toggle}>
                    {label.common.close}
                </Button>
            </ModalFooter>
        </Modal>);
};

export default ModalEMailRegisteredStatus;