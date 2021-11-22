import React, { useEffect, useState } from 'react';
import {
    Button, ButtonGroup,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    Col,
    FormGroup, Input, Label,
    Modal,
    ModalBody,
    ModalHeader,
    Row
} from 'reactstrap';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import { useAuth0 } from '@auth0/auth0-react';
import { b64toBlob, downloadBlob } from '../../../utils/TableUtils';
import { generateReportPrestation, generateReportPrestationByDossier } from '../../../services/PresationService';
import { Document, Page } from 'react-pdf';
import ReactLoading from 'react-loading';
import Select from 'react-select';
import { getUserResponsableList } from '../../../services/SearchService';
import ItemDTO from '../../../model/ItemDTO';
import AsyncSelect from 'react-select/async/dist/react-select.esm';
import { getClient } from '../../../services/ClientService';
const isNil = require( 'lodash/isNil' );
const map = require( 'lodash/map' );

export default function ModalReportPrestation( { openDialog, toggle, label, showMessage, dossierId, vckeySelected } ) {
    const tempStart = moment( moment().startOf( 'year' ).format( 'YYYY-MM-DD' ) ).toDate();
    const tempEnd = moment( moment().endOf( 'year' ).format( 'YYYY-MM-DD' ) ).toDate();
    const [start, setStart] = useState( tempStart );
    const [end, setEnd] = useState( tempEnd );
    const [isShareDossier, setIsShareDossier] = useState( false );
    const [client, setClient] = useState( null );
    const { getAccessTokenSilently } = useAuth0();
    const [file, setFile] = useState( null );
    const [isLoading, setIsLoading] = useState( false );
    const [userResponsableList, setUserResponsableList] = useState( [] );
    const [responsable, setResponsable] = useState( null );

    const [numPages, setNumPages] = useState( null );
    const [pageNumber, setPageNumber] = useState( 1 );

    useEffect( () => {
        (async () => {
            const accessToken = await getAccessTokenSilently();

            let resultUser = await getUserResponsableList( accessToken, vckeySelected );
            let profiles = map( resultUser.data, data => {
                return new ItemDTO( data );
            } );
            setUserResponsableList( profiles );

        })();
    }, [getAccessTokenSilently] );
    const _generate = async () => {
        const accessToken = await getAccessTokenSilently();
        setIsLoading(true);
        let result;

        if(!isNil(dossierId)) {
           result = await generateReportPrestationByDossier( accessToken, start, end , dossierId);
        } else {
            const clientId = !isNil(client) ? client.value : null;
            const responsableId = !isNil(responsable) ? responsable.value : null;
            result= await generateReportPrestation( accessToken, start, end , isShareDossier, clientId, responsableId);
        }
        if ( !result.error ) {
            let pdf = b64toBlob( result.data, '' );
            setPageNumber(1)
            setFile( pdf );
            setIsLoading(false);
        } else {
            showMessage( label.prestation.alert1, 'danger' );
        }
    }
    const _download = ( ) => {
        downloadBlob(file, 'report'+ moment().format('yyyyMMDDhmmss') +'.pdf');
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
        setPageNumber( number);
    };

    const _handleClientChange = ( newValue ) => {
        setClient( newValue );
    };

    const _loadClientOptions = async ( inputValue, callback ) => {
        const accessToken = await getAccessTokenSilently();
        let result = await getClient( accessToken, inputValue );

        callback( map( result.data, data => {
            return new ItemDTO( { value: data.id, label: data.fullName, isDefault: data.email } );
        } ) );
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
                        {/* only show if it's not into dossier because share dosier option is for whole cab*/}
                        {isNil(dossierId) ? (
                            <Row>
                                <Col md="6">
                                    <FormGroup check>
                                        <Label check>
                                            <Input
                                                defaultChecked={isShareDossier}
                                                type="checkbox"
                                                onChange={( e ) => {
                                                    setIsShareDossier(!isShareDossier );
                                                }}
                                            />{' '}
                                            <span className={`form-check-sign`}>
                                    <span
                                        className="check"> {label.prestation.label6}</span>
                                </span>
                                        </Label>
                                    </FormGroup>
                                </Col>
                            </Row>
                        ): null}
                        {/* only show if it's not into dossier because share dosier option is for whole cab*/}
                        {isNil(dossierId) ? (
                            <Row>
                                <Col lg="6">
                                    <FormGroup>
                                        <AsyncSelect
                                            value={client}
                                            className="react-select info"
                                            classNamePrefix="react-select"
                                            cacheOptions
                                            loadOptions={_loadClientOptions}
                                            defaultOptions
                                            isClearable={true}
                                            onChange={_handleClientChange}
                                            placeholder={label.compta.customer}
                                        />
                                    </FormGroup>
                                </Col>
                            </Row>
                        ): null}
                            <Row>
                                <Col md="6">
                                    <FormGroup>
                                        <Select
                                            value={responsable}
                                            className="react-select info"
                                            classNamePrefix="react-select"
                                            isClearable={true}
                                            placeholder={label.prestation.label7}
                                            name="singleSelect-resp"
                                            onChange={value => setResponsable( value )}
                                            options={userResponsableList}
                                        />
                                    </FormGroup>
                                </Col>
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
                        ): null}
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

