import React, { useState } from 'react';
import { Button, Col, FormGroup, FormText, Input, Label } from 'reactstrap';
import { Select } from '@material-ui/core';

export default function ShareAffaire() {
    const [filter, setFilter] = useState( { value: 1, label: 'Affaire' } );

    return (
        <Col className="ml-auto mr-auto" md="12" sm={12}>
            <form>
                <FormGroup>
                    <Label for="exampleEmail">Cabinet</Label>
                    <Select
                        className="react-select info"
                        classNamePrefix="react-select"
                        name="agendaType"
                        value={filter}
                        onChange={value =>
                            setFilter( value )
                        }
                        options={[
                            { value: 1, label: 'Affaire' },
                            { value: 2, label: 'Conclusion' }
                        ]}
                        placeholder="Type"
                    />
                    <FormText color="muted">
                        We'll never share your email with anyone else.
                    </FormText>
                </FormGroup>
                <FormGroup check>
                    <Label check>
                        <Input type="checkbox"/>{' '}
                        Check me out
                        <span className="form-check-sign">
            <span className="check"></span>
        </span>
                    </Label>
                </FormGroup>
                <Button color="primary" type="submit">
                    Submit
                </Button>
            </form>
        </Col>

    );
}

