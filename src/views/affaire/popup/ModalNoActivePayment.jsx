import React, { Component } from 'react';
import { Button, Modal, ModalBody, ModalFooter } from 'reactstrap';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

//Not Paid
class ModalNoActivePayment extends Component {
    constructor( props ) {
        super( props );
        this.state = {
            checkPayment: true
        };

        this.toggle = this.toggle.bind( this );
    }

    toggle() {
        this.props.toggleModalDetails();
    }

    render() {
        //label
        const { modalDisplay, label } = this.props;

        return (
            <Modal isOpen={modalDisplay} toggle={this.toggle}>
                <ModalBody>
                    <p className="blockquote blockquote-primary">
                        {label.payment.label3}
                    </p>
                </ModalBody>
                <ModalFooter>
                    <Button bsStyle="default" onClick={this.toggle}>{label.common.close}</Button>
                    <Link to={`/admin/payment`} className="btn btn-primary" >{label.common.go}</Link>{' '}
                </ModalFooter>
            </Modal>
        );
    }
}

ModalNoActivePayment.propTypes = {
    modalDisplay: PropTypes.bool.isRequired,
    toggleModalDetails: PropTypes.func.isRequired,
};

export default ModalNoActivePayment;
