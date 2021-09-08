import React, { Component } from 'react';
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row } from 'reactstrap';

//Not Paid
class RapportAffaire extends Component {
    constructor( props ) {
        super( props );
        this.state = {};

    }

    render() {

        return (
            <Col className="ml-auto mr-auto" md="12" sm={12}>
                        <Button color="info">Solde tiers</Button>
                        <Button color="info">Par tiers</Button>
                        <Button color="info">Par numéro</Button>
                        <Button color="info">Par nom</Button>
                        <Button color="info">Presation</Button>

            </Col>

        );
    }
}

RapportAffaire.propTypes = {};

export default RapportAffaire;
