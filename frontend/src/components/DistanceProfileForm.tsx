import { CButton, CCol, CForm, CFormCheck, CFormInput, CFormSelect, CRow } from "@coreui/react";
import { DistanceProfile } from "./Types";
import React, { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";

// Defined options for fields
const maxProfileOptions = [
    {
        value: "PROFILE_1",
        label: "PROFILE_1",
    },
    {
        value: "PROFILE_2",
        label: "PROFILE_2",
    },
    {
        value: "PROFILE_3",
        label: "PROFILE_3",
    },
    {
        value: "PROFILE_4",
        label: "PROFILE_4",
    },
    {
        value: "PROFILE_5",
        label: "PROFILE_5",
    },
];

const thresholdMethodOptions = [
    {
        value: "CFAR",
        label: "CFAR",
    },
    {
        value: "FIXED",
        label: "FIXED",
    },
    {
        value: "FIXED_STRENGTH",
        label: "FIXED_STRENGTH",
    },
    {
        value: "RECORDED",
        label: "RECORDED",
    },
];

const peaksortingMethodOptions = [
    {
        value: "CLOSEST",
        label: "CLOSEST",
    },
    {
        value: "STRONGEST",
        label: "STRONGEST",
    },
];

const reflectorShapeOptions = [
    {
        value: "GENERIC",
        label: "GENERIC",
    },
    {
        value: "PLANAR",
        label: "PLANAR",
    },
];

const DistanceProfileForm = ({ distanceProfile }: { distanceProfile?: DistanceProfile }) => {
    const [formData, setFormData] = useState<DistanceProfile | undefined>(undefined);
    const [validated, setValidated] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const handleElementChange = (event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>) => {
        const { id, value } = event.target as HTMLInputElement | HTMLSelectElement;
        setFormData({ ...formData, [id]: value } as DistanceProfile);
    };

    const handleCheckBoxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { id, checked } = event.target;
        setFormData({ ...formData, [id]: checked } as DistanceProfile);
    };

    const handleCreateForm = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            event.stopPropagation();
            return;
        }
        setValidated(true);
        axios
            .post("http://127.0.0.1:8000/api/v1/profiles/distance/", formData)
            .then((response) => {
                alert("Success: " + response.data.message);
            })
            .catch((error: AxiosError) => {
                const validationErrorMessage = JSON.stringify(error.response?.data);
                alert("Error: " + validationErrorMessage);
            });
    };

    const handleEditForm = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            event.stopPropagation();
            return;
        }
        setValidated(true);
        axios
            .put(`http://127.0.0.1:8000/api/v1/profiles/distance/${formData?.id}`, formData)
            .then((response) => {
                alert("Success: " + response.data.message);
            })
            .catch((error: AxiosError) => {
                const validationErrorMessage = JSON.stringify(error.response?.data);
                alert("Error: " + validationErrorMessage);
            });
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        console.log(JSON.stringify(formData));
        if (isEditing) {
            await handleEditForm(event);
            return;
        } else {
            await handleCreateForm(event);
        }
    };

    useEffect(() => {
        if (distanceProfile) {
            setFormData(distanceProfile);
            setIsEditing(true);
        }
    }, []);

    return (
        <CForm validated={validated} onSubmit={handleSubmit} className="row g-2 needs-validation">
            <CRow>
                <CCol>
                    <CFormInput
                        type="text"
                        id="name"
                        onChange={handleElementChange}
                        value={formData?.name}
                        label="Name"
                        placeholder="Enter name"
                        required
                    />
                </CCol>
            </CRow>
            <CRow>
                <CCol>
                    <CFormInput
                        type="number"
                        step={0.01}
                        id="start_m"
                        value={formData?.start_m}
                        onChange={handleElementChange}
                        label="Range Start"
                        placeholder="Enter range start"
                        min={0.1}
                        max={5}
                    />
                </CCol>
                <CCol>
                    <CFormInput
                        type="number"
                        step={0.1}
                        id="end_m"
                        value={formData?.end_m}
                        onChange={handleElementChange}
                        label="Range End"
                        placeholder="Enter range end"
                    />
                </CCol>
                <CCol>
                    <CFormInput
                        type="number"
                        id="max_step_length"
                        onChange={handleElementChange}
                        value={formData?.max_step_length}
                        label="Max Step Length"
                        placeholder="Enter max step length"
                    />
                </CCol>
            </CRow>
            <CRow>
                <CCol>
                    <CFormSelect
                        id="max_profile"
                        onChange={handleElementChange}
                        label="Max Profile"
                        options={[...maxProfileOptions]}
                    />
                </CCol>
                <CCol>
                    <CFormCheck
                        type="checkbox"
                        id="close_range_leakage_cancellation"
                        checked={formData?.close_range_leakage_cancellation}
                        onChange={handleCheckBoxChange}
                        label="Close Range Leakage Cancel"
                        placeholder="Enter close range leakage cancel"
                    />
                </CCol>
                <CCol>
                    <CFormInput
                        type="number"
                        id="signal_quality"
                        value={formData?.signal_quality}
                        onChange={handleElementChange}
                        label="Signal Quality"
                        placeholder="Enter signal quality"
                    />
                </CCol>
            </CRow>
            <CRow>
                <CCol>
                    <CFormSelect
                        id="threshold_method"
                        label="Threshold Method"
                        onChange={handleElementChange}
                        options={[...thresholdMethodOptions]}
                    />
                </CCol>
                <CCol>
                    <CFormSelect
                        id="peaksorting_method"
                        label="Peaksorting Method"
                        onChange={handleElementChange}
                        options={[...peaksortingMethodOptions]}
                    />
                </CCol>
                <CCol>
                    <CFormSelect
                        id="reflector_shape"
                        label="Reflector Shape"
                        onChange={handleElementChange}
                        options={[...reflectorShapeOptions]}
                    />
                </CCol>
            </CRow>
            <CRow>
                <CCol>
                    <CFormInput
                        type="number"
                        id="num_frames_in_recorded_threshold"
                        onChange={handleElementChange}
                        value={formData?.num_frames_in_recorded_threshold}
                        label="Num Frames"
                        placeholder="Enter num frames"
                    />
                </CCol>
                <CCol>
                    <CFormInput
                        type="number"
                        id="fixed_threshold_value"
                        value={formData?.fixed_threshold_value}
                        onChange={handleElementChange}
                        label="Fixed Threshold"
                        placeholder="Enter fixed threshold"
                    />
                </CCol>
                <CCol>
                    <CFormInput
                        type="number"
                        id="fixed_strength_threshold_value"
                        value={formData?.fixed_strength_threshold_value}
                        onChange={handleElementChange}
                        label="Fixed Strength"
                        placeholder="Enter fixed strength"
                    />
                </CCol>
            </CRow>
            <CRow>
                <CCol>
                    <CFormInput
                        type="number"
                        id="threshold_sensitivity"
                        value={formData?.threshold_sensitivity}
                        onChange={handleElementChange}
                        label="Threshold Sensitivity"
                        placeholder="Enter threshold sensitivity"
                    />
                </CCol>
                <CCol>
                    <CFormInput
                        type="number"
                        id="update_rate"
                        value={formData?.update_rate}
                        onChange={handleElementChange}
                        label="Update Rate"
                        placeholder="Enter update rate"
                    />
                </CCol>
            </CRow>
            <CCol>
                <CButton type="submit" color="primary">
                    Submit
                </CButton>
            </CCol>
        </CForm>
    );
};

export default DistanceProfileForm;
