import React, { Component } from 'react';
import { Button, Card, CardBody, CardHeader, Modal, ModalBody, ModalHeader } from 'reactstrap';
import PropTypes from 'prop-types';

class ModalReportInvoice extends Component {

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
                            <Button color="info">Listing</Button>

                        </CardBody>
                    </Card>
                </ModalBody>
            </Modal>
        );
    }
}

ModalReportInvoice.propTypes = {
    openDialog: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired
};

export default ModalReportInvoice;
