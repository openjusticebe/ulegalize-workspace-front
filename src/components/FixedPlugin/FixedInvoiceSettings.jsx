import React, { Component } from 'react';
// react plugin used to create switch buttons
import { Button, FormGroup, Input, Label, Table } from 'reactstrap';

const map = require( 'lodash/map' );

class FixedInvoiceSettings extends Component {
    constructor( props ) {
        super( props );
        this.state = {
            classes: 'dropdown',
            horizontalDetailsTabs: 'prestation',
            rates: [{
                id: 0,
                isDefault: false
            },
                {
                    id: 6,
                    isDefault: false
                },
                {
                    id: 12,
                    isDefault: true
                }]
        };
    }

    handleClick = () => {
        if ( this.state.classes === 'dropdown' ) {
            this.setState( { classes: 'dropdown show' } );
        } else {
            this.setState( { classes: 'dropdown' } );
        }
    };
    // with this function we change the active tab for all the tabs in this page
    changeActiveTab = ( e, tabState, tadName ) => {
        e.preventDefault();
        this.setState( {
            [ tabState ]: tadName
        } );
    };

    render() {
        const { rates } = this.state;
        const details = map( rates, rate => {
            return (
                <tr key={rate.id}>
                    <td>
                      <FormGroup>
                        <Button className="btn-icon float-right" size="md"
                                color="danger">
                            <i className="tim-icons icon-trash-simple"/>
                        </Button>
                      </FormGroup>
                    </td>
                    <td className="text-center label-switch">{rate.id}</td>
                    <td className="text-center">
                        <FormGroup check>
                            <Label check>
                                <Input defaultChecked={rate.isDefault} type="checkbox"/>{' '}
                                <span className="form-check-sign">
                                  <span className="check"></span>
                                </span>
                            </Label>
                        </FormGroup>
                    </td>
                </tr>
            );
        } );

        return (
            <div className="fixed-settings-plugin">
                <div className={this.state.classes}>
                    <a
                        href="#pablo"
                        onClick={e => {
                            e.preventDefault();
                            this.handleClick();
                        }}
                    >
                        <i className="fa fa-cog fa-2x"/>
                    </a>
                    <ul className="dropdown-menu show">
                        <li className="header-title">Invoice settings</li>
                        <li className="adjustments-line">
                            <Table className="settingPopup" responsive striped>
                                <thead className="text-primary">
                                <tr>
                                    <th className="text-center">#</th>
                                    <th className="text-center">Taux de TVA</th>
                                    <th className="text-center">TVA par défaut</th>
                                </tr>
                                </thead>
                                <tbody>
                                {details}
                                </tbody>
                            </Table>
                        </li>
                    </ul>
                </div>
            </div>
        );
    }
}

export default FixedInvoiceSettings;
