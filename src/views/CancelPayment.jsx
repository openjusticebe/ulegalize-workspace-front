import React from 'react';
// reactstrap components
import { Col, Row } from 'reactstrap';
import { Link } from 'react-router-dom';
import AccountTreeIcon from '@material-ui/icons/AccountTree';
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace';
import HomeIcon from '@material-ui/icons/Home';

class CancelPayment extends React.Component {
    constructor( props ) {
        super( props );

        this.state = {};
    }

    componentDidMount() {
    }

    render() {
        const {label,  match: { params }} = this.props;
        return (
            <>
                <div className="content">
                    <Row className='section'>
                        <Col md={12}>
                            <div className="section-title text-center">
                                <h2><AccountTreeIcon/> <span>{label.cancelstripe.spanProfile}</span></h2>
                                <div></div>
                            </div>
                        </Col>
                    </Row>
                    <Row className="text-center margin-top-30">
                        <Col lg={{ size: 2, offset: 4 }} md={{ size: 2, offset: 4 }} sm={{ size: 2, offset: 4 }}>
                            <Link to={`/admin/affaire/${params.affaireid}`} className="btn btn-default">
                                <KeyboardBackspaceIcon/> {label.cancelstripe.error1}
                            </Link>
                        </Col>
                    </Row>
                    <Row className="text-center margin-top-30">
                        <Col lg={{ size: 2, offset: 5 }} md={{ size: 2, offset: 5 }} sm={{ size: 2, offset: 4 }}>
                            <Link to="/"><HomeIcon/> {label.cancelstripe.home}</Link>
                        </Col>
                    </Row>
                </div>
            </>
        );
    }
}

export default CancelPayment;