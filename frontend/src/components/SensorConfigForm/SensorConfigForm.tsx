import SensorConfig from "../../types/SensorConfig";
import { useEffect, useState } from "react";
import { CButton, CCol, CForm, CFormCheck, CFormInput, CFormSelect, CRow } from "@coreui/react";
import { defaultSensorConfig } from "./defaultSensorConfig";
import { fetchCreateSensorConfig, fetchUpdateSensorConfig } from "../../hooks/apiHooks";

// Defined options for fields
const profileOptions = [
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

const idleStateOptions = [
    {
        value: "DEEP_SLEEP",
        label: "DEEP_SLEEP",
    },
    {
        value: "SLEEP",
        label: "SLEEP",
    },
    {
        value: "READY",
        label: "READY",
    },
];

const prfOptions = [
    {
        value: "PRF_19_5_MHz",
        label: "PRF_19_5_MHz",
    },
    {
        value: "PRF_15_6_MHz",
        label: "PRF_15_6_MHz",
    },
    {
        value: "PRF_13_0_MHz",
        label: "PRF_13_0_MHz",
    },
    {
        value: "PRF_8_7_MHz",
        label: "PRF_8_7_MHz",
    },
    {
        value: "PRF_6_5_MHz",
        label: "PRF_6_5_MHz",
    },
    {
        value: "PRF_5_2_MHz",
        label: "PRF_5_2_MHz",
    },
];

interface SensorConfigFormProps {
    configToShow?: SensorConfig;
    closeModal: () => void;
}

const SensorConfigForm: React.FC<SensorConfigFormProps> = ({ configToShow: sensorConfigToShow, closeModal }) => {
    const [formData, setFormData] = useState<SensorConfig>(defaultSensorConfig);
    const [validated, setValidated] = useState<boolean>(false);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [showOptional, setShowOptional] = useState<boolean>(false);

    const handleElementChange = (event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>) => {
        const { id, value } = event.target as HTMLInputElement | HTMLSelectElement;
        setFormData({ ...formData, [id]: value } as SensorConfig);
    };

    const handleCheckBoxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { id, checked } = event.target as HTMLInputElement;
        setFormData({ ...formData, [id]: checked } as SensorConfig);
    };

    const handleCreateFormSubmit = async () => {
        await fetchCreateSensorConfig(formData);
    };

    const handleEditFormSubmit = async () => {
        await fetchUpdateSensorConfig(formData.id, formData);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            event.stopPropagation();
            return;
        }
        setValidated(true);
        if (isEditing) {
            await handleEditFormSubmit();
        } else {
            await handleCreateFormSubmit();
        }
        closeModal();
    };

    const showOptionalFields = (event: any) => {
        event.preventDefault();
        setShowOptional(!showOptional);
    };

    useEffect(() => {
        if (sensorConfigToShow) {
            setFormData(sensorConfigToShow);
            setIsEditing(true);
        } else {
            setFormData(defaultSensorConfig);
        }
    }, []);

    return (
        <CForm validated={validated} onSubmit={handleSubmit} className="row g-2 needs-validation">
            <div id="required-fields">
                <CRow>
                    <CCol>
                        <CFormInput
                            type="text"
                            id="name"
                            label="Name"
                            placeholder="Name"
                            value={formData.name}
                            onChange={handleElementChange}
                            required
                        />
                    </CCol>
                    <CCol>
                        <CFormInput
                            type="text"
                            id="sweeps_per_frame"
                            label="Sweeps per frame"
                            placeholder="Sweeps per frame"
                            value={formData.sweeps_per_frame}
                            onChange={handleElementChange}
                        />
                    </CCol>
                    <CCol className="mt-4">
                        <CFormCheck
                            type="checkbox"
                            id="continuous_sweep_mode"
                            label="Continuous Sweep Mode"
                            placeholder="Continuous Sweep Mode"
                            checked={formData.continuous_sweep_mode}
                            onChange={handleCheckBoxChange}
                        />
                        <CFormCheck
                            type="checkbox"
                            id="double_buffering"
                            label="Double Buffering"
                            placeholder="Double Buffering"
                            checked={formData.double_buffering}
                            onChange={handleCheckBoxChange}
                        />
                    </CCol>
                </CRow>
                <CRow>
                    <CCol>
                        <CFormSelect
                            id="inter_frame_idle_state"
                            label="Inter Frame Idle State"
                            options={[...idleStateOptions]}
                            onChange={handleElementChange}
                            defaultValue={formData.inter_frame_idle_state}
                        />
                    </CCol>
                    <CCol>
                        <CFormSelect
                            id="inter_sweep_idle_state"
                            label="Inter Sweep Idle State"
                            options={[...idleStateOptions]}
                            onChange={handleElementChange}
                            defaultValue={formData.inter_sweep_idle_state}
                        />
                    </CCol>
                </CRow>
            </div>
            <div className="buttons">
                <CRow className="mt-2">
                    <CCol>
                        <CCol className="d-flex flex-row gap-2">
                            <CButton type="submit" color="primary">
                                Save
                            </CButton>
                            <CButton type="button" color="primary" onClick={showOptionalFields} className="ml-2">
                                {showOptional ? "Hide Optional" : "Show Optional"}
                            </CButton>
                        </CCol>
                    </CCol>
                </CRow>
            </div>
            <div id="optional-fields" style={{ display: showOptional ? "block" : "none" }}>
                <CRow>
                    <CCol>
                        <CFormInput
                            type="text"
                            id="sweep_rate"
                            label="Sweep Rate"
                            placeholder="Sweep Rate"
                            value={formData.sweep_rate}
                            onChange={handleElementChange}
                        />
                    </CCol>
                    <CCol>
                        <CFormInput
                            type="text"
                            id="frame_rate"
                            label="Frame Rate"
                            placeholder="Frame Rate"
                            value={formData.frame_rate}
                            onChange={handleElementChange}
                        />
                    </CCol>
                    <CCol>
                        <CFormInput
                            type="text"
                            id="start_point"
                            label="Start Point"
                            placeholder="Start Point"
                            value={formData.start_point}
                            onChange={handleElementChange}
                        />
                    </CCol>
                    <CCol>
                        <CFormInput
                            type="text"
                            id="num_points"
                            label="Number of Points"
                            placeholder="Number of Points"
                            value={formData.num_points}
                            onChange={handleElementChange}
                        />
                    </CCol>
                </CRow>
                <CRow>
                    <CCol>
                        <CFormInput
                            type="text"
                            id="step_length"
                            label="Step Length"
                            placeholder="Step Length"
                            value={formData.step_length}
                            onChange={handleElementChange}
                        />
                    </CCol>
                    <CCol>
                        <CFormSelect
                            id="profile"
                            label="Profile"
                            options={[...profileOptions]}
                            onChange={handleElementChange}
                            value={formData.profile}
                        />
                    </CCol>
                    <CCol>
                        <CFormInput
                            type="text"
                            id="hwaas"
                            label="HWAAS"
                            placeholder="HWAAS"
                            value={formData.hwaas}
                            onChange={handleElementChange}
                        />
                    </CCol>
                    <CCol>
                        <CFormInput
                            type="text"
                            id="receiver_gain"
                            label="Receiver Gain"
                            placeholder="Receiver Gain"
                            value={formData.receiver_gain}
                            onChange={handleElementChange}
                        />
                    </CCol>
                    <CRow>
                        <CCol>
                            <CFormCheck
                                type="checkbox"
                                id="enable_tx"
                                label="Enable TX"
                                placeholder="Enable TX"
                                checked={formData.enable_tx}
                                onChange={handleCheckBoxChange}
                                className="mt-4"
                            />
                        </CCol>
                        <CCol>
                            <CFormCheck
                                type="checkbox"
                                id="enable_loopback"
                                label="Enable Loopback"
                                placeholder="Enable Loopback"
                                checked={formData.enable_loopback}
                                onChange={handleCheckBoxChange}
                                className="mt-4"
                            />
                        </CCol>
                        <CCol>
                            <CFormCheck
                                type="checkbox"
                                id="phase_enhancement"
                                label="Phase Enhancement"
                                placeholder="Phase Enhancement"
                                checked={formData.phase_enhancement}
                                onChange={handleCheckBoxChange}
                                className="mt-4"
                            />
                        </CCol>

                        <CCol>
                            <CFormSelect
                                id="prf"
                                label="PRF"
                                options={[...prfOptions]}
                                onChange={handleElementChange}
                                value={formData.prf}
                            />
                        </CCol>
                    </CRow>
                </CRow>
            </div>
        </CForm>
    );
};

export default SensorConfigForm;
