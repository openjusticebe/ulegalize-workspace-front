import React from 'react';

import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

import moment from 'moment';
import 'moment/locale/fr';
import { registerLocale } from 'react-datepicker';
import fr from 'date-fns/locale/fr';
import ReportEtatHonoraireGenerator from './report/ReportEtatHonoraireGenerator';

moment.locale( 'fr' );
registerLocale( 'fr', fr );

export const ReportEtatHonoraireModal = ( props ) => {
    const {
        modal,
        label,
        affaireId,
        showMessage,
        toggleModal
    } = props;


    return (
    <Modal size="lg" style={{ width: 'fit-content' }} isOpen={modal} toggle={toggleModal}>
        <ModalHeader>
            <button type="button" className="close" data-dismiss="modal" aria-label="Close"
                    onClick={toggleModal}>
                <i className="tim-icons icon-simple-remove"></i>
            </button>
            <h4 className="modal-title">{label.invoice.label106}</h4>
        </ModalHeader>
        <ModalBody>
            <ReportEtatHonoraireGenerator
                affaireId={affaireId}
                label={label}
                showMessage={showMessage}/>
        </ModalBody>
        <ModalFooter>
            <Button color="secondary" onClick={toggleModal}>
                {label.common.close}
            </Button>
        </ModalFooter>
    </Modal>
    );
};