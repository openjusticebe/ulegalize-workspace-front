import React from 'react';
// reactstrap components
import { Button, Card, CardText, CardTitle, Col, Row } from 'reactstrap';
import { Link } from 'react-router-dom';
import AccountTreeIcon from '@material-ui/icons/AccountTree';
import EmailIcon from '@material-ui/icons/Email';
import ThumbUpAltIcon from '@material-ui/icons/ThumbUpAlt';
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace';
import HomeIcon from '@material-ui/icons/Home';
import label from '../data/label';

class NotAuthorized extends React.Component {
    constructor( props ) {
        super( props );

        this.state = {};
        this._back = this._back.bind( this );
    }

    componentDidMount() {
    }

    _back() {
        this.props.history.goBack();
    }

    render() {
        // message from component
        const { messageProp, labelProp, emailProp} = this.props;

        let email = emailProp ? emailProp : null;
        // message from history push but no language setted
        let message, messageEn, messageNl = null;

        let labelDefault = labelProp ? labelProp : label[ 'fr' ];

        let messageGeneric = messageProp ? messageProp : labelDefault.unauthorized.label1;

        if ( this.props.location.state ) {
                message = this.props.location.state.message;
                messageEn = this.props.location.state.messageEn;
                messageNl = this.props.location.state.messageNl;
                labelDefault = this.props.location.state.label ? this.props.location.state.label : labelDefault;
                email = this.props.location.state.email;

                if( this.props.location.state.messageGeneric ){
                    messageGeneric = this.props.location.state.messageGeneric;
                }
        }

        return (
            <>
                <div className="content">
                    <Row className='section  section-padding'>
                        <Col md={12}>
                            <div className="section-title text-center">
                                <Card body>
                                    <CardTitle tag="h2"><AccountTreeIcon/>
                                        <span>{messageGeneric} "{email}"</span></CardTitle>
                                    <CardText><EmailIcon/> <span>{labelDefault.unauthorized.label2}</span></CardText>
                                </Card>
                            </div>
                        </Col>
                    </Row>
                    {message ? (
                        <div className="section-title text-center">
                            <Row>
                                <Card body>
                                    <CardText><h4>{message}</h4></CardText>
                                    <CardText><h4>{messageEn}</h4></CardText>
                                    <CardText><h4>{messageNl}</h4></CardText>
                                </Card>

                            </Row>
                        </div>
                    ) : null}
                    <Card body>
                        <div className="section-title text-center">
                            <Row>
                                <h4 className="smaller">{labelDefault.unauthorized.label3}</h4>
                            </Row>
                            <Row>
                                <ul className="list-unstyled spaced inline bigger-110 margin-15">
                                    <li>
                                        <ThumbUpAltIcon className="blue"/>
                                        {labelDefault.unauthorized.label4}
                                    </li>

                                    <li>
                                        <ThumbUpAltIcon className="blue"/>
                                        {labelDefault.unauthorized.label6}
                                    </li>
                                </ul>

                            </Row>
                        </div>
                    </Card>
                    <Row className="text-center">
                        <Col lg={{ size: 2, offset: 4 }} md={{ size: 2, offset: 4 }} sm={{ size: 2, offset: 4 }}>
                            <Button onClick={this._back} color="link">
                                <KeyboardBackspaceIcon/> {labelDefault.unauthorized.label7}
                            </Button>
                        </Col>
                        <Col lg={{ size: 2 }} md={{ size: 2 }} sm={{ size: 2 }}>
                            <Link to="/"><HomeIcon/> {labelDefault.unauthorized.label8}</Link>
                        </Col>
                    </Row>
                </div>
            </>
        );
    }
}

export default NotAuthorized;