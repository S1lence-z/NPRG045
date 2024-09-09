import React, { useEffect, useState } from "react";
import SelectOption from "../types/SelectOption";
import { CButton, CFormSelect, CModal, CModalBody, CModalHeader, CModalTitle } from "@coreui/react";

interface ConfigSelectorProps<T extends { id: number; name: string }> {
    label: string;
    knownConfigs: T[];
    selectedConfig: T;
    setSelectedConfig: (config: T) => void;
    triggerFetchConfigs: () => void;
    apiDeleteCallback: (configId: number) => Promise<void>;
    ConfigFormComponent: React.FC<{ configToShow?: T; closeModal: () => void }>;
}

const ConfigSelector = <T extends { id: number; name: string }>({
    label,
    knownConfigs,
    selectedConfig,
    setSelectedConfig,
    triggerFetchConfigs,
    apiDeleteCallback,
    ConfigFormComponent,
}: ConfigSelectorProps<T>) => {
    const [configOptions, setConfigOptions] = useState<SelectOption[]>([]);
    const [createConfigModalVisible, setCreateConfigModalVisible] = useState<boolean>(false);
    const [editConfigModalVisible, setEditConfigModalVisible] = useState<boolean>(false);

    const handleConfigChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newSelectedConfigName = event.target.value;
        const newSelectedConfig = knownConfigs.find((config) => config.name === newSelectedConfigName);
        setSelectedConfig(newSelectedConfig || knownConfigs[0]);
    };

    const handleConfigDeletion = async () => {
        if (!selectedConfig) {
            return;
        }
        const userResponse = window.confirm(`Are you sure you want to delete config "${selectedConfig.name}"?`);
        if (!userResponse) {
            return;
        }
        const configId = selectedConfig.id;
        try {
            await apiDeleteCallback(configId);
            triggerFetchConfigs();
        } catch (error) {
            console.error(`Error deleting config with id in ConfigSelector.tsx`);
        }
    };

    useEffect(() => {
        triggerFetchConfigs();
    }, [createConfigModalVisible, editConfigModalVisible]);

    useEffect(() => {
        setConfigOptions(
            knownConfigs.map((config: T) => {
                // TODO: this should so that the label is the name and the value is the id
                return new SelectOption(config.name, config.name);
            })
        );
        const foundConfig = knownConfigs.find((config) => config.id === selectedConfig?.id);
        if (foundConfig) {
            setSelectedConfig(foundConfig);
        } else if (knownConfigs.length > 0) {
            setSelectedConfig(knownConfigs[0]);
        }
    }, [knownConfigs]);

    return (
        <>
            <h5>{label}</h5>
            <CFormSelect options={[...configOptions]} onChange={handleConfigChange} value={selectedConfig?.name} />
            <div className="profile-button-list d-flex justify-content-evenly align-items-center mt-2">
                <CButton
                    type="button"
                    color="success"
                    className="flex-fill"
                    onClick={() => setCreateConfigModalVisible(true)}>
                    Create
                </CButton>
                <CButton
                    type="button"
                    color="warning"
                    className="flex-fill ms-2"
                    onClick={() => setEditConfigModalVisible(true)}
                    disabled={knownConfigs.length === 0}>
                    Edit
                </CButton>
                <CButton
                    type="button"
                    color="danger"
                    className="flex-fill ms-2"
                    onClick={handleConfigDeletion}
                    disabled={knownConfigs.length === 0}>
                    Delete
                </CButton>
            </div>
            <div className="create-config-modal">
                <CModal size="xl" visible={createConfigModalVisible} onClose={() => setCreateConfigModalVisible(false)}>
                    <CModalHeader>
                        <CModalTitle>Create Config</CModalTitle>
                    </CModalHeader>
                    <CModalBody>
                        <ConfigFormComponent closeModal={() => setCreateConfigModalVisible(false)} />
                    </CModalBody>
                </CModal>
            </div>
            <div className="edit-config-modal">
                <CModal size="xl" visible={editConfigModalVisible} onClose={() => setEditConfigModalVisible(false)}>
                    <CModalHeader>
                        <CModalTitle>Edit Config</CModalTitle>
                    </CModalHeader>
                    <CModalBody>
                        <ConfigFormComponent
                            configToShow={selectedConfig}
                            closeModal={() => setEditConfigModalVisible(false)}
                        />
                    </CModalBody>
                </CModal>
            </div>
        </>
    );
};

export default ConfigSelector;
