import React, { useEffect, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useAuth0 } from '@auth0/auth0-react';
import ReactLoading from 'react-loading';
import { Button, ButtonGroup, Col, Row } from 'reactstrap';
import moment from 'moment';
import { generateMail } from '../../../services/PostBirdServices';
import { b64toBlob, downloadBlob } from '../../../utils/TableUtils';
// see https://github.com/wojtekmaj/react-pdf/issues/280#issuecomment-568301642
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
//pdfjs.GlobalWorkerOptions.workerSrc = require('pdfjs-dist/build/pdf.worker.js');
const MailPostBirdGenerator = ( { showMessage, label, documentId } ) => {
    const { getAccessTokenSilently } = useAuth0();
    const [file, setFile] = useState( null );

    const [numPages, setNumPages] = useState( null );
    const [pageNumber, setPageNumber] = useState( 1 );
    useEffect( () => {
        (async () => {
            const accessToken = await getAccessTokenSilently();
            let result;
                result= await generateMail( accessToken, documentId );
                if ( !result.error ) {
                    let pdf = b64toBlob( result.data, '' );
                    setFile( pdf );
                } else {
                    showMessage( label.mail.error1, 'danger' );
                }

        })();
    }, [getAccessTokenSilently] );
    const _download = ( ) => {
        downloadBlob(file, 'mail'+ moment().format('yyyyMMDDhmmss') +'.pdf');
    };
    const _onDocumentLoadSuccess = ( { numPages } ) => {
        setNumPages( numPages );
    };
    const _preview = ()  => {
        const number = pageNumber > 1 ? pageNumber - 1 : 1;
        setPageNumber( number);
    };
    const _next = ( ) => {
        const number = pageNumber === numPages ? numPages : pageNumber + 1;
        setPageNumber( number);    };
    return file ? (<>
            <Document
                file={file}
                onLoadSuccess={_onDocumentLoadSuccess}>
                <Page pageNumber={pageNumber}/>
            </Document>
            <Row>
                <Col className="margin-bottom-15" md={{ offset: 5, size: 5 }} sm={{ offset: 2, size: 6 }}>
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

        </>) :
        (
            <ReactLoading className="loading" height={'20%'} width={'20%'}/>
        );
};

export default MailPostBirdGenerator;