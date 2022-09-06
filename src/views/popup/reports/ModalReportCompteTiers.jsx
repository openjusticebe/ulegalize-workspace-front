import React, { useEffect, useState } from 'react';
import {
    Button,
    ButtonGroup,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    Col, FormGroup, Input,
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
import { generateReportCompteTiers } from '../../../services/ComptaServices';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
const isNil = require( 'lodash/isNil' );

export default function ModalReportCompteTiers( { openDialog, toggle, label, showMessage, vckeySelected } ) {
    const tempStart = moment( moment().startOf( 'year' ).format( 'YYYY-MM-DD' ) ).toDate();
    const tempEnd = moment( moment().endOf( 'year' ).format( 'YYYY-MM-DD' ) ).toDate();
    const { getAccessTokenSilently } = useAuth0();
    const [file, setFile] = useState( null );
    const [isLoading, setIsLoading] = useState( false );
    const [start, setStart] = useState( tempStart );
    const [end, setEnd] = useState( tempEnd );
    const [balanceZero, setBalanceZero] = useState( [{ value: null, label: label.common.label19 }] );
    const [balance, setBalance] = useState( null );

    const [numPages, setNumPages] = useState( null );
    const [pageNumber, setPageNumber] = useState( 1 );

    const _generate = async () => {
        const accessToken = await getAccessTokenSilently();
        setIsLoading( true );
        let result = await generateReportCompteTiers( accessToken, start, end, vckeySelected, balanceZero, balance );
        if ( !result.error ) {
            let pdf = b64toBlob( result.data, '' );
            setPageNumber( 1 );
            setFile( pdf );
            setIsLoading( false );
        } else {
            setIsLoading( false );
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
                {label.compta.label1}
            </ModalHeader>
            <ModalBody>
                <Card>
                    <CardHeader>
                    </CardHeader>
                    <CardBody>
                        <Row>
                            <Col md="6">
                                <FormGroup>
                                    <DatePicker
                                        selected={start}
                                        onChange={date => setStart( date )}
                                        locale="fr"
                                        timeCaption="date"
                                        dateFormat="yyyy-MM-dd"
                                        placeholderText="yyyy-mm-dd"
                                        className="form-control color-primary"
                                    />
                                </FormGroup>
                            </Col>
                            <Col md="6">
                                <FormGroup>
                                    <DatePicker
                                        selected={end}
                                        onChange={date => setEnd( date )}
                                        locale="fr"
                                        timeCaption="date"
                                        dateFormat="yyyy-MM-dd"
                                        placeholderText="yyyy-mm-dd"
                                        className="form-control color-primary"
                                    />
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col md="2">
                                <FormGroup>
                                    <Select
                                        className="react-select info"
                                        classNamePrefix="react-select"
                                        name="balance"
                                        defaultValue={{ label: label.common.label19, value: null }}
                                        onChange={value =>
                                            setBalanceZero( value )
                                        }
                                        options={[
                                            { value: null, label: label.common.label19 },
                                            { value: 0, label: '= ' },
                                            { value: 1, label: '> ' },
                                            { value: -1, label: '< ' }
                                        ]}
                                        placeholder={label.comptalist.label11}
                                    />
                                </FormGroup>
                            </Col>
                            {!isNil(balanceZero) && !isNil(balanceZero.value) ? (
                                <Col md="3">
                                    <FormGroup>
                                        <Input
                                            className="form-control"
                                            type="number"
                                            name="balance"
                                            defaultValue={balance}
                                            onChange={event =>
                                                setBalance( event.target.valueAsNumber )
                                            }
                                            placeholder={label.comptalist.label11}
                                        />
                                    </FormGroup>
                                </Col>
                            ): null}
                        </Row>
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

