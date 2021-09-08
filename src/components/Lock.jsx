import React from 'react';

// reactstrap components
import { Card, CardBody, CardHeader, CardTitle, Col, Container } from 'reactstrap';
import CircularProgress from '@material-ui/core/CircularProgress';

class Lock extends React.Component {
  componentDidMount() {
    document.body.classList.toggle("lock-page");
  }
  componentWillUnmount() {
    document.body.classList.toggle("lock-page");
  }
  render() {
    const { message } = this.props;
    return (
      <>
        <div className="content">
          <Container>
            <Col className="ml-auto mr-auto" lg="4" md="6">
              <Card className="card-lock card-white text-center">
                <CardHeader>
                  {message}
                </CardHeader>
                <CardBody>
                  <CardTitle tag="h4">{message}</CardTitle>
                  <CircularProgress size={50}/>
                </CardBody>
              </Card>
            </Col>
          </Container>
        </div>
      </>
    );
  }
}

export default Lock;
