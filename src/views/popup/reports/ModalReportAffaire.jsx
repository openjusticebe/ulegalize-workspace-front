import React, { Component } from 'react';
import { Button, Card, CardBody, CardHeader, Modal, ModalBody, ModalHeader } from 'reactstrap';
import PropTypes from 'prop-types';


class ModalReportAffaire extends Component {

    render() {
        const { openDialog, toggle } = this.props;

        return (
            <Modal isOpen={openDialog} toggle={toggle}
                   size="lg" modalClassName="modal-black">
                <ModalHeader className="justify-content-center" toggle={toggle}>
                    Reports
                </ModalHeader>
                <ModalBody>
                    <Card>
                        <CardHeader>
                        </CardHeader>
                        <CardBody>
                            <Button color="info">Solde tiers</Button>
                            <Button color="default">Par tiers</Button>
                            <Button color="primary">Par numéro</Button>
                            <br/>
                            <Button color="info">Par nom</Button>
                            <Button color="info">Presation</Button>

                        </CardBody>
                    </Card>
                </ModalBody>
            </Modal>
        );
    }
}

ModalReportAffaire.propTypes = {
    openDialog: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired
};

export default ModalReportAffaire;
