import React, { useEffect, useState } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  FormGroup,
  Input,
  Row,
  Label,
  Col,
} from "reactstrap";
import { useAuth0 } from "@auth0/auth0-react";
import { updateAdminAccountingType } from "../../services/AdminService";
import CircularProgress from "@material-ui/core/CircularProgress";

export default function ItemsModal({
  modal,
  toggleIn,
  item,
  label,
  handleSucess,
  handleError,
}) {
  const { getAccessTokenSilently } = useAuth0();
  const [itemName, setItemName] = useState(item.description);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setItemName(item.description);
  }, [item, modal]);

  const handleSave = async () => {
    if (itemName.trim() !== "") {
      setLoading(true);
      item.description = itemName.trim();
      const accessToken = await getAccessTokenSilently();
      let result = await updateAdminAccountingType(
        accessToken,
        item.accountingId,
        item
      );
      if (!result.error) {
        handleSucess(item);
      } else {
        handleError(label.benefits.label13);
        setLoading(false);
      }
    } else {
      handleError(label.benefits.label4);
    }
  };

  return (
    <Modal size="md" isOpen={modal} toggle={toggleIn}>
      <ModalHeader toggle={toggleIn}>
        <h4>{label.benefits.label5}</h4>
      </ModalHeader>
      <ModalBody>
        <Row>
          <Col md={3} lg={3}>
            <Label>{label.benefits.label6}</Label>
          </Col>
          <Col md={9} lg={9}>
            <FormGroup>
              <Input
                value={itemName}
                type="text"
                onChange={(e) => setItemName(e.target.value)}
              />
            </FormGroup>
          </Col>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={() => toggleIn()}>
          {label.benefits.label8}
        </Button>
        {loading && <CircularProgress color="primary" size={35} />}
        <Button color="primary" onClick={handleSave} disable={loading}>
          {label.benefits.label7}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
