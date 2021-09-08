import React, { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button, ButtonGroup, Col, Row } from 'reactstrap';
import { useDrop } from 'react-dnd';
import ReactLoading from 'react-loading';
import { ItemTypes } from './ItemTypes';
import { Box } from './Box';
const map = require( 'lodash/map' );

// see https://github.com/wojtekmaj/react-pdf/issues/280#issuecomment-568301642
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
//pdfjs.GlobalWorkerOptions.workerSrc = require('pdfjs-dist/build/pdf.worker.js');
const MailGenerator = ( { file, toRecipientEmail, coordinate } ) => {
    let top = 20
    const names = map( toRecipientEmail, row => {
        top += 80;
        return{ id: row.id,top: top, left: 0, title: row.firstname + ' ' + row.lastname }
    } );
    const [boxes, setBoxes] = useState(names);

    const [numPages, setNumPages] = useState( null );
    const [pageNumber, setPageNumber] = useState( 1 );

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
    const moveBox = useCallback((id, left, top) => {
        const updateBox = map(boxes, box=>{
            if (box.id === id) {
                return {id:id, left:left, top:top, title: box.title, pageNumber: pageNumber };
            } else {
                return box;
            }
        });
        coordinate(id, left, top, pageNumber);
        setBoxes( {
            ...updateBox
        });
    }, [boxes, setBoxes]);
    const [, drop] = useDrop(() => ({
        accept: ItemTypes.BOX,
        drop(item, monitor) {
            const delta = monitor.getDifferenceFromInitialOffset();
            const left = Math.round(item.left + delta.x);
            const top = Math.round(item.top + delta.y);
            moveBox(item.id, left, top);
            return undefined;
        },
    }), [moveBox]);

    return file ? (
        <>
            <div style={{ overflow: 'hidden', clear: 'both', marginTop: '1.5rem'}}>
                {map(boxes, (box) => {
                    return (<Box key={box.id} id={box.id} left={box.left} top={box.top} hideSourceOnDrag={true}>
                        {box.title}
                    </Box>);
                })}
            </div>
                <div ref={drop} >
                    <Document
                        file={file.get('files')}
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
                            </ButtonGroup>
                        </Col>
                    </Row>

                </div>
        </>

    ) : (
        <ReactLoading className="loading" height={'20%'} width={'20%'}/>
    );
};

export default MailGenerator;