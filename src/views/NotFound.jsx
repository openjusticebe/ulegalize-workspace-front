import React from 'react';
// reactstrap components
import { Card, CardText, CardTitle, Col, Row } from 'reactstrap';
import { Link } from 'react-router-dom';
import AccountTreeIcon from '@material-ui/icons/AccountTree';
import ThumbUpAltIcon from '@material-ui/icons/ThumbUpAlt';
import HomeIcon from '@material-ui/icons/Home';
import EmailIcon from '@material-ui/icons/Email';

class NotFound extends React.Component {
    constructor( props ) {
        super( props );

        this.state = {};
    }

    componentDidMount() {
    }

    _back() {
        this.props.history.goBack();
    }

    render() {
        const { label, email } = this.props;
        return (
            <>
                <div className="content">
                    <Row className='section  section-padding'>
                        <Col md={12}>
                            <div className="section-title text-center">
                                <Card body>
                                    <CardTitle tag="h2"><AccountTreeIcon/>
                                        <span>404 "{email}"</span></CardTitle>
                                    <CardText><EmailIcon/> <span>{label.unauthorized.label2}</span></CardText>
                                </Card>
                            </div>
                        </Col>
                    </Row>
                    <div className="section-title text-center">
                        <Card body>
                                <h3 className="lighter smaller">{label.notFound.label2}</h3>
                                <h4 className="smaller">{label.notFound.label3}</h4>
                                <ul className="list-unstyled spaced inline bigger-110 margin-15">
                                    <li>
                                        <ThumbUpAltIcon className="blue"/>
                                        {label.notFound.label4}
                                    </li>

                                    <li>
                                        <ThumbUpAltIcon className="blue"/>
                                        {label.notFound.label6}
                                    </li>
                                </ul>
                        </Card>
                    </div>
                    <div className="text-center">
                            <Link to="/"><HomeIcon/> {label.notFound.label8}</Link>
                    </div>
                </div>
            </>
        );
    }
}

export default NotFound;