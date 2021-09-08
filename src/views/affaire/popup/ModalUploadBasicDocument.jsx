import React, { useEffect, useState } from 'react';
import {
    Button,
    Col,
    FormGroup,
    Label,
    Modal,
    Row,
    Input,
    ModalHeader,
    ModalBody,
    ModalFooter
} from 'reactstrap';
import { getDossierById } from '../../../services/DossierService';
import { useAuth0 } from '@auth0/auth0-react';
import PdfUpload from '../../../components/CustomUpload/PdfUpload';

const isNil = require( 'lodash/isNil' );
const isEmpty = require( 'lodash/isEmpty' );

export default function ModalUploadBasicDocument( { attachFile, toggleModalDetails, affaireId, vckeySelected,
                                                      label ,
                                                      modalDisplay, cas,
                                                  } ) {
    const [documentName, setDocumentName] = useState( '' );
    const [emailContent, setEmailContent] = useState( '' );
    const [files, setFiles] = useState( null );
    const { getAccessTokenSilently } = useAuth0();

    useEffect( () => {
        (async () => {
            const accessToken = await getAccessTokenSilently();
            // if dossier does not exist get the user email
            if ( !isNil( affaireId ) ) {
                await getDossierById(accessToken, affaireId, vckeySelected);
            }

        })();
    }, [getAccessTokenSilently] );


    const _attachFile =  async() => {

        await attachFile( files );
        toggle();
    }

    const toggle = () => {
        toggleModalDetails();
    }
    const _uploadDocument = ( file ) => {
        let data = new FormData();
        const extension = file.name.split( '.' ).pop();

        const newFileName = !isNil( documentName ) && !isEmpty( documentName ) ? documentName + '.' + extension : file.name;

        data.append( 'files', file, newFileName );

        data.append( 'casId', cas.id );
        data.append( 'content', emailContent );

        setFiles(data)
    };


        return (
            <Modal size="md"  isOpen={modalDisplay} toggle={toggle}>
                <ModalHeader toggle={toggle}>
                    <h4 className="modal-title">{label.etat.transparencyModalLabel}
                    </h4>
                </ModalHeader>
                <ModalBody>
                    <Row>
                        {/*<!-- document name -->*/}
                        <Col lg={12} md={12} sm={12}>
                            <Label>
                                {label.etat.documentName}

                            </Label>
                            <FormGroup>
                                <Input
                                    name="documentname"
                                    className="form-control"
                                    placeholder={label.etat.documentName}
                                    value={documentName}
                                    onChange={( e ) => setDocumentName(  e.target.value )}

                                />
                            </FormGroup>
                        </Col>
                    </Row>
                    {/*<!-- message to client -->*/}
                    <Row>
                        <Col lg={12} md={12} sm={12}>
                            <Label>
                                {label.etat.emailContent}

                            </Label>
                            <FormGroup>
                                <Input
                                    rows={3}
                                    name="content"
                                    type="textarea"
                                    className="form-control"
                                    placeholder={label.etat.emailContent}
                                    value={emailContent}
                                    onChange={( e ) => setEmailContent(  e.target.value )}
                                />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        {/*<!-- contenu du mail -->*/}
                        <Col lg={12} md={12} sm={12}>
                            <FormGroup>
                                <PdfUpload
                                    saveFile={_uploadDocument}
                                    avatar={null}/>
                            </FormGroup>
                        </Col>
                    </Row>

                </ModalBody>
                <ModalFooter>
                    <Button color="default" onClick={toggle}>{label.common.close}</Button>
                    <Button color="default" onClick={_attachFile}>{label.etat.sendSimple}</Button>{' '}
                </ModalFooter>
            </Modal>
        );
}
