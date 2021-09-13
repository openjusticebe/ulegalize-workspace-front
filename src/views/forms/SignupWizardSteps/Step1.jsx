import React from 'react';
import classnames from 'classnames';
// reactstrap components
import { Col, Input, InputGroup, InputGroupAddon, InputGroupText, Row } from 'reactstrap';
import CircularProgress from '@material-ui/core/CircularProgress';

const toUpper = require( 'lodash/toUpper' );
const isNil = require( 'lodash/isNil' );
const trim = require( 'lodash/trim' );
const isNaN = require( 'lodash/isNaN' );

class Step1 extends React.Component {
    constructor( props ) {
        super( props );
        this.state = {
            vckeyName: props.vckeySelected,
            vckeyNameState: props.vckeyNameState
        };
    }

    // function that verifies if a string has a given length or not
    verifyLength = ( value, length ) => {
        if ( value.length >= length ) {
            return true;
        }
        return false;
    };
    verifyMaxLength = ( value, length ) => {
        if ( value.length <= length ) {
            return true;
        }
        return false;
    };
    change = ( event, stateName, type, minValue, maxValue ) => {
        const value = !isNil( event.target.value ) ? toUpper( event.target.value ) : '';
        switch ( type ) {
            case 'length':
                // check maximum
                // check if < maxValue
                // check if > minValue
                if ( this.verifyLength( value, minValue ) && this.verifyMaxLength( value, maxValue ) ) {
                    // only numbers and letters
                    if ( value && /^[a-zA-Z0-9_]+$/.test( value ) ) {
                        this.setState( { [ stateName + 'State' ]: 'has-success' } );

                        if(value.includes(process.env.REACT_APP_TEMP_VCKEY)) {
                            // check characters for sequence
                            //ULEGAL
                            const restValue = trim( value, process.env.REACT_APP_TEMP_VCKEY );
                            const restOriginalVcKey = trim( this.props.originalVcKey, process.env.REACT_APP_TEMP_VCKEY );

                            // restValue cannot be > restoOriginalVcKey
                            if ( !isNaN( parseInt( restValue ) ) ) {
                                if ( parseInt( restValue ) > parseInt( restOriginalVcKey ) ) {
                                    this.setState( { [ stateName + 'State' ]: 'has-danger' } );
                                }
                            }
                        }

                    } else {
                        this.setState( { [ stateName + 'State' ]: 'has-danger' } );
                    }
                } else {
                    this.setState( { [ stateName + 'State' ]: 'has-danger' } );
                }

                break;
            default:
                break;
        }
        this.setState( { [ stateName ]: value } );
        this.props.changeVcKey( value );
    };
    isValidated = () => {
        if ( this.state.vckeyNameState === 'has-success' ) {
            return true;
        } else {
            if ( this.state.vckeyNameState !== 'has-success' ) {
                this.setState( { vckeyNameState: 'has-danger' } );
            }
            return false;
        }
    };

    render() {
        const { label } = this.props;
        return (
            <>
                <h5 className="info-text">
                    {label.label2}

                </h5>
                <Row className="justify-content-center mt-5">
                    <Col sm={{ size: 8, offset: 1 }}>
                        {!isNil( this.state.vckeyName ) ? (
                                <>
                                    <InputGroup size="lg"
                                                className={classnames( this.state.vckeyNameState, {
                                                    'input-group-focus': this.state.vckeyNameFocus
                                                } )}
                                    >
                                        <InputGroupAddon addonType="prepend">
                                            <InputGroupText>
                                                <i className="tim-icons icon-single-02"/>
                                            </InputGroupText>
                                        </InputGroupAddon>
                                        <Input bsSize="lg"
                                               name="vckeyName"
                                               placeholder={label.label3}
                                               type="text"
                                               value={this.state.vckeyName}
                                               onChange={e => this.change( e, 'vckeyName', 'length', 4, 50 )}
                                               onFocus={e => this.setState( { vckeyNameFocus: true } )}
                                               onBlur={e => this.setState( { vckeyNameFocus: false } )}
                                        />
                                    </InputGroup>
                                    {this.state.vckeyNameState === 'has-danger' ? (
                                        <label className="error">{label.label5}</label>
                                    ) : (
                                        <label className="error">{label.label4}</label>
                                    )}
                                </>

                            ) :
                            (
                                <CircularProgress size={50}/>
                            )}
                    </Col>
                </Row>
            </>
        );
    }
}

export default Step1;
