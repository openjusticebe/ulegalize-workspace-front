import React, { Component } from 'react';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Input, FormGroup, Label } from 'reactstrap';
import PropTypes from 'prop-types';
import NotificationAlert from 'react-notification-alert';
import { getOptionInfoNotification } from '../../../utils/AlertUtils';

//Not Paid
class ModalClientInfo extends Component {
    constructor( props ) {
        super( props );
        this.state = {
            checkPayment: true
        };

        this.toggle = this.toggle.bind( this );
        this._basicUpload = this._basicUpload.bind( this );
    }

    toggle() {
        this.props.toggleModalDetails();
    }

    _basicUpload() {
        this.props.toggleModalDetails();
        this.props.basicUpload();
    }

    render() {
        const { modalDisplay } = this.props;
        //label
        const { transparencyModalLabel, trustMessageTransparency, btnSaveTransparency, btnBasicUpload, btnDeleteTransparency } = this.props;

        return (
            <Modal isOpen={modalDisplay} toggle={this.toggle}>
                <ModalHeader toggle={this.toggle}>
                    {transparencyModalLabel}
                </ModalHeader>
                <ModalBody>
                    <FormGroup check>
                        <Label check>
                            <Input
                                defaultChecked={this.state.checkPayment}
                                    onChange={() => this.setState( { checkPayment: !this.state.checkPayment } )}
                                    type="checkbox"/>{' '}
                            <strong>{trustMessageTransparency}</strong>
                            <span className="form-check-sign">
                                  <span className="check"></span>
                                </span>
                        </Label>
                    </FormGroup>
                </ModalBody>
                <ModalFooter>
                    <Button bsStyle="default" onClick={this.toggle}>{btnDeleteTransparency}</Button>
                    <Button bsStyle="default" onClick={this._basicUpload}>{btnBasicUpload}</Button>
                    <Button bsStyle="danger" onClick={this._startStripe}>{btnSaveTransparency}</Button>{' '}
                </ModalFooter>
            </Modal>
        );
    }
}

ModalClientInfo.propTypes = {
    modalDisplay: PropTypes.bool.isRequired,
    trustMessageTransparency: PropTypes.string.isRequired,
    transparencyModalLabel: PropTypes.string.isRequired,
    toggleModalDetails: PropTypes.func.isRequired,
    basicUpload: PropTypes.func.isRequired
};

export default ModalClientInfo;
