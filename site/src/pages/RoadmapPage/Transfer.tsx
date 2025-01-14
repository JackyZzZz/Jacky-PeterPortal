import React, { FC, useState, useEffect } from "react";
import './Transfer.scss';
import Button from 'react-bootstrap/Button';
import { ListGroup } from "react-bootstrap";
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import CloseButton from 'react-bootstrap/CloseButton';
import { Pencil, Save } from "react-bootstrap-icons";

import { TransferData } from '../../types/types';
import { setShowTransfer, deleteTransfer, setTransfer, addTransfer } from '../../store/slices/roadmapSlice';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { List } from "semantic-ui-react";

interface TransferEntryProps extends TransferData {
    index: number;
}

// a list of missing courses for current plan, passed into Transfer component to display dropdown
interface MissingCoursesProps {
    missingPrereqNames: Set<string>;
}

const TransferEntry: FC<TransferEntryProps> = (props) => {
    const dispatch = useAppDispatch();
    const [name, setName] = useState(props.name);
    const [units, setUnits] = useState(props.units);

    // when deleting a course, update new parameters
    useEffect(() => {
        setName(props.name);
        setUnits(props.units);
    }, [props.name, props.units])

    // save to roadmap on every update
    useEffect(() => {
        dispatch(setTransfer({
            index: props.index,
            transfer: { name, units }
        }))
    }, [name, units])

    return <Row className="g-2 mb-1" xs={3}>
        <Col xs='auto' md='auto' className="d-flex flex-row justify-content-center">
            <CloseButton onClick={() => dispatch(deleteTransfer(props.index))} />
        </Col>
        <Col xs md>
            <Form.Control type="text" placeholder="Name"
                value={name} onChange={e =>
                    setName(e.target.value)
                } />
        </Col>
        <Col xs md>
            <Form.Control type="number" placeholder="Units"
                value={units} onChange={e =>
                    setUnits(parseInt(e.target.value))
                } />
        </Col>
    </Row>
}

const Transfer: FC<MissingCoursesProps> = ({ missingPrereqNames }) => {
    const dispatch = useAppDispatch();
    const transfers = useAppSelector(state => state.roadmap.transfers);
    const show = useAppSelector(state => state.roadmap.showTransfer);
    const handleClose = () => dispatch(setShowTransfer(false));

    // console.log("missing courses: ", missingPrereqNames);
    // console.log("missing courses: ", missingPrereqNames);


    const DisplayMissingCourses: FC = () => {
        return <ListGroup horizontal> {
                Array.from(missingPrereqNames).map((course) => <ListGroup.Item>{course}</ListGroup.Item>)
            }
        </ListGroup>
    };
        


    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Transfer Credits</Modal.Title>
            </Modal.Header>
            <Modal.Body className='transfer' >
                <p>Record your AP Credits or Community College Credits here. Doing so will clear the prerequisites on the roadmap.</p>
                <p>Notice: entered course names need to match exactly as displayed on the UCI catalog (eg. "AP computer science" must be entered as "AP COMP SCI A")</p>
                <p>Missing Prerequisites</p>
                <DisplayMissingCourses />
                <Container className="entry">
                    <Form>
                        {
                            transfers.map((transfer, i) => <TransferEntry key={`transfer-${i}`} index={i} {...transfer}></TransferEntry>)
                        }
                    </Form>
                </Container>
            </Modal.Body>
            <Modal.Footer className='d-flex flex-row justify-content-between'>
                <Button variant="primary" onClick={() => dispatch(addTransfer({ name: '', units: undefined }))}>
                    Add Entry
                </Button>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default Transfer;