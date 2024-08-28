import {
    CButton,
    CCard,
    CCardBody,
    CCardHeader,
    CCardText,
    CCol,
    CFormSelect,
    CModal,
    CModalBody,
    CModalHeader,
    CModalTitle,
    CRow,
} from "@coreui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { DistanceProfile, SelectOption, Sensor } from "./Types";
import { useWebSocket } from "../contexts/WebSocketContext";
import DistanceProfileForm from "./DistanceProfileForm";
import { DistanceProfileProvider, useDistanceProfile } from "../contexts/DistanceProfileContext";

const SensorSelection = () => {
    const [connectedSensors, setConnectedSensors] = useState<Sensor[]>([]);
    const { sensorUpdateTrigger } = useWebSocket();
    const { selectedProfile } = useDistanceProfile();

    const fetchConnectedSensors = () => {
        axios
            .get("http://127.0.0.1:8000/api/v1/sensors/connected/")
            .then((response) => {
                setConnectedSensors(response.data);
            })
            .catch((error) => {
                console.error("There was an error fetching the connected sensors.", error);
            });
    };

    const startDistanceMeasurement = (sensorId: number) => {
        const postData = {
            distance_profile_id: selectedProfile?.id,
        };
        axios
            .post(`http://127.0.0.1:8000/api/v1/measurements/distance/${sensorId}/start`, postData)
            .then((response) => {
                console.log(response.data);
            })
            .catch((error) => {
                console.error("There was an error starting the distance measurement.", error);
            });
    };

    const stopDistanceMeasurement = (sensorId: number) => {
        axios
            .post(`http://127.0.0.1:8000/api/v1/measurements/distance/${sensorId}/stop`)
            .then((response) => {
                console.log(response.data);
            })
            .catch((error) => {
                console.error("There was an error stopping the distance measurement.", error);
            });
    };

    useEffect(() => {
        fetchConnectedSensors();
    }, [sensorUpdateTrigger]);

    return (
        <>
            <CCard>
                <CCardHeader>Connected Sensors: {connectedSensors.length}</CCardHeader>
            </CCard>
            <div className="button-list d-flex justify-content-evenly align-items-center mt-2">
                <CButton
                    type="button"
                    color="success"
                    className="flex-fill"
                    onClick={() => {
                        connectedSensors.forEach((sensor) => {
                            startDistanceMeasurement(sensor.id);
                        });
                    }}>
                    Start
                </CButton>
                <CButton
                    type="button"
                    color="danger"
                    className="flex-fill ms-2"
                    onClick={() => {
                        connectedSensors.forEach((sensor) => {
                            stopDistanceMeasurement(sensor.id);
                        });
                    }}>
                    Stop
                </CButton>
            </div>
        </>
    );
};

const DistanceProfileSelection = () => {
    // Distance profile context
    const { knownProfiles, selectedProfile, setSelectedProfile, triggerFetchProfiles } = useDistanceProfile();
    // Profile options
    const [profileOptions, setProfileOptions] = useState<SelectOption<string>[]>([]);
    // Modals
    const [createProfileModalVisible, setCreateProfileModalVisible] = useState(false);
    const [editProfileModalVisible, setEditProfileModalVisible] = useState(false);

    const handleProfileChange = (event: any) => {
        const selectedProfileName = event.target.value;
        const newSelectedProfile = knownProfiles.find((profile) => {
            if (profile.name === selectedProfileName) {
                return profile;
            }
        });
        setSelectedProfile(newSelectedProfile);
    };

    const handleProfileDeletion = () => {
        if (!selectedProfile) {
            return;
        }
        const profileId = selectedProfile.id;
        axios
            .delete(`http://127.0.0.1:8000/api/v1/profiles/distance/${profileId}`)
            .then((response) => {
                console.log(response.data);
                triggerFetchProfiles();
            })
            .catch((error) => {
                console.error(JSON.stringify(error));
            });
    };

    useEffect(() => {
        triggerFetchProfiles();
    }, [createProfileModalVisible, editProfileModalVisible]);

    useEffect(() => {
        setProfileOptions(
            knownProfiles.map((profile: DistanceProfile) => {
                return new SelectOption<string>(profile.name, profile.name);
            })
        );
        setSelectedProfile(knownProfiles[0]);
    }, [knownProfiles]);

    return (
        <>
            <CFormSelect options={[...profileOptions]} onChange={handleProfileChange} value={selectedProfile?.name} />
            <div className="profile-list d-flex justify-content-evenly align-items-center mt-2">
                <CButton
                    type="button"
                    color="success"
                    className="flex-fill"
                    onClick={() => setCreateProfileModalVisible(!createProfileModalVisible)}>
                    Create
                </CButton>
                <CButton
                    type="button"
                    color="warning"
                    className="flex-fill ms-2"
                    onClick={() => {
                        setEditProfileModalVisible(!editProfileModalVisible);
                    }}>
                    Edit
                </CButton>
                <CButton type="button" color="danger" className="flex-fill ms-2" onClick={handleProfileDeletion}>
                    Delete
                </CButton>
            </div>
            <CModal
                className="create-profile-modal"
                size="xl"
                visible={createProfileModalVisible}
                onClose={() => setCreateProfileModalVisible(false)}>
                <CModalHeader>
                    <CModalTitle>Create Profile</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <DistanceProfileForm />
                </CModalBody>
            </CModal>
            <CModal
                className="edit-profile-modal"
                size="xl"
                visible={editProfileModalVisible}
                onClose={() => setEditProfileModalVisible(false)}>
                <CModalHeader>
                    <CModalTitle id="editProfileModal">Edit Profile</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <DistanceProfileForm distanceProfile={selectedProfile} />
                </CModalBody>
            </CModal>
        </>
    );
};

const DistanceProfileDetails = () => {
    const { selectedProfile } = useDistanceProfile();

    const showProfileDetails = (profile: DistanceProfile | undefined) => {
        if (profile) {
            const rangeStart = profile.start_m;
            const rangeEnd = profile.end_m;
            const maxStepLength = profile.max_step_length;
            const maxProfile = profile.max_profile;
            const closeRangeLeakageCancel = profile.close_range_leakage_cancellation;
            const signalQuality = profile.signal_quality;
            const thresholdMethod = profile.threshold_method;
            const peaksortingMethod = profile.peaksorting_method;
            const reflectorShape = profile.reflector_shape;
            const numFrames = profile.num_frames_in_recorded_threshold;
            const fixedThreshold = profile.fixed_strength_threshold_value;
            const fixedStrength = profile.fixed_strength_threshold_value;
            const thresholdSensitivity = profile.threshold_sensitivity;
            const updateRate = profile.update_rate;
            return (
                <CCard>
                    <CCardBody>
                        <CRow>
                            <CCol>
                                <CCardText>
                                    <b>Range Start:</b> {rangeStart} m
                                </CCardText>
                            </CCol>
                            <CCol>
                                <CCardText>
                                    <b>Range End:</b> {rangeEnd} m
                                </CCardText>
                            </CCol>
                        </CRow>
                        <CRow>
                            <CCol>
                                <CCardText>
                                    <b>Max Step Length:</b> {maxStepLength}
                                </CCardText>
                            </CCol>
                            <CCol>
                                <CCardText>
                                    <b>Max Profile:</b> {maxProfile.split("").pop()}
                                </CCardText>
                            </CCol>
                        </CRow>
                        <CRow>
                            <CCol>
                                <CCardText>
                                    <b>Signal Quality:</b> {signalQuality}
                                </CCardText>
                            </CCol>
                            <CCol>
                                <CCardText>
                                    <b>Num Frames:</b> {numFrames}
                                </CCardText>
                            </CCol>
                        </CRow>
                        <CRow>
                            <CCol>
                                <CCardText>
                                    <b>Fixed Threshold:</b> {fixedThreshold}
                                </CCardText>
                            </CCol>
                            <CCol>
                                <CCardText>
                                    <b>Fixed Strength:</b> {fixedStrength}
                                </CCardText>
                            </CCol>
                        </CRow>
                        <CRow>
                            <CCol>
                                <CCardText>
                                    <b>Threshold Sensitivity:</b> {thresholdSensitivity}
                                </CCardText>
                            </CCol>
                        </CRow>
                        <CRow>
                            <CCol>
                                <CCardText>
                                    <b>Update Rate:</b> {updateRate}
                                </CCardText>
                            </CCol>
                        </CRow>
                        <CRow>
                            <CCol>
                                <CCardText>
                                    <b>Peaksorting Method:</b> {peaksortingMethod}
                                </CCardText>
                            </CCol>
                        </CRow>
                        <CRow>
                            <CCol>
                                <CCardText>
                                    <b>Threshold Method:</b> {thresholdMethod}
                                </CCardText>
                            </CCol>
                        </CRow>
                        <CRow>
                            <CCol>
                                <CCardText>
                                    <b>Reflector Shape:</b> {reflectorShape}
                                </CCardText>
                            </CCol>
                        </CRow>
                        <CRow>
                            <CCol>
                                <CCardText>
                                    <b>Close Range Leakage Cancellation:</b> {closeRangeLeakageCancel ? "Yes" : "No"}
                                </CCardText>
                            </CCol>
                        </CRow>
                    </CCardBody>
                </CCard>
            );
        }
    };

    return (
        <div className="selected-profile-details mt-2">
            <h5>Selected Profile Details</h5>
            {showProfileDetails(selectedProfile)}
        </div>
    );
};

const DistanceToolControls = () => {
    return (
        <DistanceProfileProvider>
            <div style={{ width: "370px" }} className="d-flex flex-column justify-content-evenly">
                <h5>Controls</h5>
                <SensorSelection />
                <div className="mt-2">
                    <h5>Distance Profile</h5>
                    <DistanceProfileSelection />
                    <DistanceProfileDetails />
                </div>
            </div>
        </DistanceProfileProvider>
    );
};

export default DistanceToolControls;
