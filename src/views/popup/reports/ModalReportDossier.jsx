import React, { useEffect, useState } from 'react';
import {
    Button,
    ButtonGroup,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    Col,
    Modal,
    ModalBody,
    ModalHeader,
    Row
} from 'reactstrap';
import moment from 'moment';
import { useAuth0 } from '@auth0/auth0-react';
import { b64toBlob, downloadBlob } from '../../../utils/TableUtils';
import { Document, Page } from 'react-pdf';
import ReactLoading from 'react-loading';
import { generateReportDossier } from '../../../services/DossierService';

export default function ModalReportDossier( { openDialog, toggle, label, showMessage, filtered, vckeySelected } ) {
    const { getAccessTokenSilently } = useAuth0();
    const [file, setFile] = useState( null );
    const [isLoading, setIsLoading] = useState( false );

    const [numPages, setNumPages] = useState( null );
    const [pageNumber, setPageNumber] = useState( 1 );

    useEffect( () => {
        (async () => {
            _generate();

        })();
    }, [getAccessTokenSilently] );

    const _generate = async () => {
        const accessToken = await getAccessTokenSilently();
        setIsLoading( true );
        let result = await generateReportDossier( accessToken, vckeySelected, filtered.number, filtered.year, filtered.client, filtered.initiales, filtered.balance, filtered.archived );
        if ( !result.error ) {
            let pdf = b64toBlob( result.data, '' );
            setPageNumber( 1 );
            setFile( pdf );
            setIsLoading( false );
        } else {
            showMessage( label.affaire.error20, 'danger' );
        }
    };

    const _download = () => {
        downloadBlob( file, 'report' + moment().format( 'yyyyMMDDhmmss' ) + '.pdf' );
    };

    const _onDocumentLoadSuccess = ( { numPages } ) => {
        setNumPages( numPages );
    };

    const _preview = () => {
        const number = pageNumber > 1 ? pageNumber - 1 : 1;
        setPageNumber( number );
    };
    const _next = () => {
        const number = pageNumber === numPages ? numPages : pageNumber + 1;
        setPageNumber( number );
    };

    return (
        <Modal isOpen={openDialog} toggle={toggle}
               size="lg" modalClassName="modal-black">
            <ModalHeader className="justify-content-center" toggle={toggle}>
                {label.prestation.label8}
            </ModalHeader>
            <ModalBody>
                <Card>
                    <CardHeader>
                    </CardHeader>
                    <CardBody>
                        {file ? (<>
                            <Document
                                orientation="landscape"
                                file={file}
                                onLoadSuccess={_onDocumentLoadSuccess}>
                                <Page pageNumber={pageNumber}/>
                            </Document>
                            <Row>
                                <Col className="margin-bottom-15" md={{ offset: 5, size: 5 }}
                                     sm={{ offset: 2, size: 6 }}>
                                    <ButtonGroup>
                                        <Button color="info" type="button btn-icons"
                                                onClick={_preview}
                                        >
                                            <i className="tim-icons icon-minimal-left"/>
                                        </Button>
                                        <Button color="info" type="button btn-icons"
                                                onClick={_next}>
                                            <i className="tim-icons icon-minimal-right"/>
                                        </Button>
                                        <Button color="primary" type="button btn-icons"
                                                onClick={_download}>
                                            <i className="tim-icons icon-cloud-download-93"/>
                                        </Button>
                                    </ButtonGroup>
                                </Col>
                            </Row>

                        </>) : null}
                        {isLoading ? (
                            <ReactLoading className="loading" height={'20%'} width={'20%'}/>
                        ) : null}
                    </CardBody>
                    <CardFooter>
                        <Button
                            disabled={isLoading}
                            onClick={_generate}
                            color="info">{label.common.generate}</Button>

                    </CardFooter>
                </Card>
            </ModalBody>
        </Modal>
    );
}

