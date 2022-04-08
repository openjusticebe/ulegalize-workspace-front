import React, { useEffect, useState } from 'react';
import {
    Button,
    ButtonGroup,
    Col,
    Collapse,
    FormGroup,
    Input,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Row
} from 'reactstrap';

import CircularProgress from '@material-ui/core/CircularProgress';
import { useAuth0 } from '@auth0/auth0-react';
import TableUsignSequence from './TableUsignSequence';
import { getUsignById } from '../../../services/transparency/UsignService';
import SignatureDTO from '../../../model/usign/SignatureDTO';
import { downloadFileAttachedUsign } from '../../../services/transparency/CaseService';
import { downloadWithName } from '../../../utils/TableUtils';
import { GetApp } from '@material-ui/icons';

const isNil = require( 'lodash/isNil' );
const isEmpty = require( 'lodash/isEmpty' );
const size = require( 'lodash/size' );

export default function ModalUploadSignDocumentReadOnly( {
                                                             usignId,
                                                             showMessagePopup,
                                                             toggleModalDetails,
                                                             modalDisplay,
                                                             label,
                                                         } ) {

    const [isLoading, setIsLoading] = useState( true );
    const [signatureDTO, setSignatureDTO] = useState( new SignatureDTO() );

    const [files, setFiles] = useState( null );
    const [openCollapse, setOpenCollapse] = useState( true );
    const { getAccessTokenSilently } = useAuth0();

    // transparency
    useEffect( () => {
        (async () => {
            const accessToken = await getAccessTokenSilently();
            setIsLoading( false );

            const result = await getUsignById( accessToken, usignId );

            if ( result.data ) {
                setSignatureDTO( new SignatureDTO( result.data ) );
            }

        })();
    }, [getAccessTokenSilently] );

    const toggle = () => {
        toggleModalDetails();
    };

    const _toggleCollapse = () => {
        setOpenCollapse( !openCollapse );
    };

    const _handleDownloadFile = async ( usignId, filename ) => {
        const accessToken = await getAccessTokenSilently();

        const result = await downloadFileAttachedUsign( accessToken, usignId );
        //const name = fileContent.name;
        //const arrn = name.split( '/' );
        if ( result.error ) {
            showMessagePopup( label.affaire.error1, 'danger' ) ;
        } else {
            downloadWithName( result.data, filename );
        }
    };

    return (
        <Modal size="lg" isOpen={modalDisplay} toggle={toggle}>
            <ModalHeader toggle={toggle}
                         className="justify-content-center"
                         tag={`h4`}>
                {label.etat.usignModalLabel} {' '}

            </ModalHeader>
            <ModalBody>
                {isLoading ? (
                    <CircularProgress size={50}/>
                ) : (
                    <>
                        {files ? (
                            <Button color="primary" onClick={_toggleCollapse}
                                    style={{ marginBottom: '1rem' }}>Toggle</Button>
                        ) : null}

                        <Collapse isOpen={openCollapse}>
                            <Row>
                                {/*<!-- add client to list recipient -->*/}
                                {!isNil( signatureDTO ) && !isEmpty( signatureDTO.clientUsignDTOList ) ? (
                                        <>
                                            <Col className="text-align-center" lg={12} md={12} sm={12}>
                                                <ButtonGroup>
                                                    <Button
                                                        disabled={true}
                                                        color={signatureDTO.enumUsignSequence === 'parallel' ? 'primary' : 'default'}
                                                        active={signatureDTO.enumUsignSequence === 'parallel'}>{label.usign.label1}</Button>
                                                    <Button
                                                        disabled={true}
                                                        color={signatureDTO.enumUsignSequence === 'sequence' ? 'primary' : 'default'}
                                                        active={signatureDTO.enumUsignSequence === 'sequence'}>{label.usign.label2}</Button>
                                                </ButtonGroup>
                                            </Col>
                                            <Col lg={12} md={12} sm={12}>
                                                <TableUsignSequence
                                                    disabled={true}
                                                    sequenceMethod={signatureDTO.enumUsignSequence}
                                                    data={signatureDTO.clientUsignDTOList}
                                                    count={size( signatureDTO.clientUsignDTOList )}
                                                    label={label}
                                                />
                                            </Col>
                                        </>
                                    )
                                    : null}
                            </Row>
                            <Row>
                                {/*<!-- document name -->*/}
                                <Label md="3">
                                    {label.etat.documentName}
                                </Label>
                                <Col lg={9} md={9} sm={9}>
                                    <FormGroup>
                                        <Input
                                            disabled={true}
                                            name="documentname"
                                            component="textarea"
                                            className="form-control"
                                            placeholder={label.etat.documentName}
                                            value={signatureDTO.documentName}

                                        />
                                    </FormGroup>
                                </Col>
                            </Row>
                            {/*<!-- message to client -->*/}

                            <Row>
                                <Label md="3">
                                    {label.etat.emailContent}
                                </Label>
                                <Col lg={9} md={9} sm={9}>
                                    <FormGroup>
                                        <Input
                                            disabled={true}
                                            rows={3}
                                            type="textarea"
                                            name="content"
                                            componentClass="textarea"
                                            className="form-control"
                                            placeholder={label.etat.emailContent}
                                            value={signatureDTO.emailContent}
                                        />
                                    </FormGroup>
                                </Col>
                            </Row>
                        </Collapse>
                    </>
                )
                }
            </ModalBody>
            <ModalFooter className="text-align-right">
                <Button color="default" onClick={toggle}>{label.common.close}</Button>
                <Button
                    color="primary"
                    className="btn-icon"
                    onClick={() => _handleDownloadFile( usignId, signatureDTO.documentName )}>
                    <GetApp/>
                </Button>
            </ModalFooter>
        </Modal>
    );
}

