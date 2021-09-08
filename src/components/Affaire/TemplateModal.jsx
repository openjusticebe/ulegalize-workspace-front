import React, { useEffect, useRef, useState } from 'react';

import { Button, Col, FormGroup, Label, Modal, ModalBody, ModalFooter, ModalHeader, Row, Spinner, } from 'reactstrap';
import Select from 'react-select';

import moment from 'moment';
import 'moment/locale/fr';
import { registerLocale } from 'react-datepicker';
import fr from 'date-fns/locale/fr';
import ItemDTO from '../../model/ItemDTO';
import { useAuth0 } from '@auth0/auth0-react';
import { getTemplateModel } from '../../services/SearchService';

import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import PizZipUtils from 'pizzip/utils/index.js';
import { saveAs } from 'file-saver';
import { downloadTemplate, getTemplatDataByDossierId } from '../../services/AdminService';
import { b64toBlob } from '../../utils/TableUtils';

const map = require( 'lodash/map' );
const isNil = require( 'lodash/isNil' );
moment.locale( 'fr' );
registerLocale( 'fr', fr );

export const TemplateModal = ( {
                                   affaireId,
                                   modal,
                                   label,
                                   vckeySelected,
                                   toggleModal,
                                   showMessagePopup
                               } ) => {
    const { getAccessTokenSilently } = useAuth0();
    const [templateItemSelected, setTemplateItemSelected] = useState( null );
    const templateData = useRef( null );
    const [templateList, setTemplateList] = useState( [] );
    const [loading, setLoading] = useState( false );

    useEffect( () => {
        (async () => {
            const accessToken = await getAccessTokenSilently();

            let resultTenmplate = await getTemplateModel( accessToken );
            if(resultTenmplate.data) {
                const templates = map( resultTenmplate.data, data => {
                    return new ItemDTO( data );
                } );

                setTemplateItemSelected(templates[0]);

                setTemplateList( templates );
            }
             let resultData = await getTemplatDataByDossierId( accessToken, affaireId );
            if(!resultData.error) {
                templateData.current=resultData.data;
            }

        })();
    }, [vckeySelected] );

    function loadFile( url, callback ) {
        PizZipUtils.getBinaryContent( url, callback );
    }

    const generateDocument = async () => {
        setLoading(true);
        const accessToken = await getAccessTokenSilently();


        if(isNil(templateItemSelected)) {
            showMessagePopup(label.models.label5, 'danger')
            return;
        }
        const resultTemplateBlob = await downloadTemplate(accessToken, templateItemSelected.label);

        if(resultTemplateBlob.error) {
            showMessagePopup(label.common.error5, 'danger')
            return;
        }
        let pdf = b64toBlob( resultTemplateBlob.data.binary, resultTemplateBlob.data.contentType );
        let blobUrl = URL.createObjectURL( pdf );

        loadFile( blobUrl, function (
            error,
            content
        ) {
            if ( error ) {
                throw error;
            }
            var zip = new PizZip( content );
            var doc = new Docxtemplater().loadZip( zip );
            doc.setData( templateData.current);
            try {
                // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
                doc.render();
            } catch ( error ) {
                if ( error.properties && error.properties.errors instanceof Array ) {
                    const errorMessages = error.properties.errors
                    .map( function ( error ) {
                        return error.properties.explanation;
                    } )
                    .join( '\n' );
                    console.log( 'errorMessages', errorMessages );
                    showMessagePopup(errorMessages, 'danger')

                    // errorMessages is a humanly readable message looking like this :
                    // 'The tag beginning with "foobar" is unopened'
                }
                throw error;
            }
            let out = doc.getZip().generate( {
                type: 'blob',
                mimeType:
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            } ); //Output the document using Data-URI
            saveAs( out, templateItemSelected.label );
            showMessagePopup(label.common.success3, 'primary')
            setLoading(true);
            toggleModal()
        } );
    };

    return (
        <>
            <Modal size="lg" isOpen={modal} toggle={toggleModal}>
                <ModalHeader tag={'h4'} toggle={toggleModal}>{label.affaire.label21}</ModalHeader>

                <ModalBody>

                    <Row>
                        <Col md="7" sm={7}>
                            <FormGroup>
                                <Label>{label.models.label5}</Label>
                                <Select
                                    name="optionGroup"
                                    className="react-select"
                                    classNamePrefix="react-select"
                                    value={templateItemSelected}
                                    onChange={value => setTemplateItemSelected( new ItemDTO( value )) }
                                    options={templateList}
                                />
                            </FormGroup>
                        </Col>
                    </Row>

                </ModalBody>

                <ModalFooter>
                    <Row>
                        <Col md={12}>
                            <Button color="primary" type="button" disabled={loading}
                                    onClick={generateDocument}
                            >
                                {loading ? (
                                    <Spinner
                                        size="sm"
                                        color="secondary"
                                    />
                                ) : null}
                                {' '} {label.common.generate}
                            </Button>
                        </Col>
                    </Row>
                </ModalFooter>

            </Modal>
        </>
    );
};