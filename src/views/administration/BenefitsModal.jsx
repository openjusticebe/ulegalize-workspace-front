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
  Col, Spinner,
} from 'reactstrap';
import { useAuth0 } from "@auth0/auth0-react";
import { updateAdminPrestationType } from "../../services/AdminService";
import PrestationTypeDTO from "../../model/admin/PrestationTypeDTO";

export default function BenefitsModal({
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
      let obj = new PrestationTypeDTO({
        idTs: item.idTs,
        description: itemName.trim(),
        archived: item.archived,
      });

      const accessToken = await getAccessTokenSilently();
      let result = await updateAdminPrestationType(accessToken, item.idTs, obj);
      if (!result.error) {
        handleSucess(obj);
        setLoading(false);
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
          {label.common.cancel}
        </Button>
        <Button color="primary" type="button" disabled={loading}
                onClick={handleSave}
        >
          {loading ? (
              <Spinner
                  size="sm"
                  color="secondary"
              />
          ) : null}
          {' '}{label.common.save}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
