import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import fileT from '../../data/Offre de prix.pdf'
// see https://github.com/wojtekmaj/react-pdf/issues/280#issuecomment-568301642
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
//pdfjs.GlobalWorkerOptions.workerSrc = require('pdfjs-dist/build/pdf.worker.js');
const PriceGenerator = ( { showMessage, label } ) => {

    const [numPages, setNumPages] = useState( null );
    const [pageNumber, setPageNumber] = useState( 1 );

    const _onDocumentLoadSuccess = ( { numPages } ) => {
        setNumPages( numPages );
    };
    return <>
            <Document
                file={fileT}
                onLoadSuccess={_onDocumentLoadSuccess}>
                <Page size="A5" pageNumber={pageNumber}/>
            </Document>
        </>
};

export default PriceGenerator;