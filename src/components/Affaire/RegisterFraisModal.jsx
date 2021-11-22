import React, { useState } from 'react';

import { Col, FormGroup, Input, Label, Modal, ModalBody, ModalHeader, Row } from 'reactstrap';

import moment from 'moment';
import 'moment/locale/fr';
import { registerLocale } from 'react-datepicker';
import fr from 'date-fns/locale/fr';
import { FraisAdmin } from './wizard/FraisAdmin';
import { Prestation } from './wizard/Prestation';

moment.locale( 'fr' );
registerLocale( 'fr', fr );
const isNil = require( 'lodash/isNil' );

export const RegisterFraisModal = ( props ) => {
    const {
        modal,
        toggleFraisModal,
        toggleClientFrais,
        vckeySelected,
        currency,
        affaireId,
        showMessagePopupFrais,
        label,
        isFrais
    } = props;
    const [choice, setChoice] = useState( !isNil(isFrais) && isFrais ? 'frais' : 'prestation' );

    let content;
    let title ;
    if ( choice === 'prestation' ) {
        title = props.label.affaire.label7;
        content = (
            <Prestation
                showMessagePopupFrais={showMessagePopupFrais}
                history={props.history}
                isCreated={true}
                affaireId={affaireId}
                currency={currency}
                vckeySelected={vckeySelected}
                label={label}
                done={toggleFraisModal}
                language={props.language}/>
        );
    } else if ( choice === 'frais' ) {
        title = props.label.affaire.label8;
        content = (
            <FraisAdmin
                showMessagePopupFrais={showMessagePopupFrais}
                externalUse={false}
                isCreated={true}
                affaireId={affaireId}
                label={label}
                done={toggleClientFrais}
                language={props.language}/>
        );
    }


    return (
        <Modal size="md" isOpen={modal} toggle={toggleFraisModal}>
            <ModalHeader tag={'h4'} toggle={toggleFraisModal}>{title}</ModalHeader>

            <ModalBody>
                <Row>
                    <Col md={3}>
                        <FormGroup check className="form-check-radio">
                            <Label check>
                                <Input
                                    checked={choice === 'prestation'}
                                    defaultValue="option1"
                                    id="exampleRadios1"
                                    name="exampleRadios"
                                    type="radio"
                                    onChange={( e ) => setChoice( 'prestation' )}
                                />
                                <span className="form-check-sign"/>
                                {label.wizardFrais.label3}
                            </Label>
                        </FormGroup>

                    </Col>
                    <Col md={5}>
                        <FormGroup check className="form-check-radio">
                            <Label check>
                                <Input
                                    checked={choice === 'frais'}
                                    defaultValue="option2"
                                    id="exampleRadios2"
                                    name="exampleRadios2"
                                    type="radio"
                                    onChange={( e ) => setChoice( 'frais' )}
                                />
                                <span className="form-check-sign"/>
                                {label.wizardFrais.label4}
                            </Label>
                        </FormGroup>

                    </Col>
                </Row>
                <div  className="mt-5">
                {content}
                </div>

            </ModalBody>

        </Modal>
    );
};