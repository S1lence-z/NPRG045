import { CCard, CCardBody, CCardText, CCol, CRow } from "@coreui/react";

const getFieldValues = (config: object, nameMap: { [key: string]: string }) => {
    return Object.entries(config).map(([key, value]) => ({
        field: nameMap[key],
        value: typeof value === "boolean" ? (value ? "Yes" : "No") : value,
    }));
};

const ConfigDetailsCard = <T extends { id: number; name: string }>({
    config,
    nameMap,
    label,
}: {
    config: T;
    nameMap: { [key: string]: string };
    label: string;
}) => {
    if (!config) {
        return null;
    }
    const fieldValues = getFieldValues(config, nameMap);

    return (
        <>
            <h5>{label}</h5>
            <CCard className="flex-fill">
                <CCardBody className="flex-fill">
                    {fieldValues.map(({ field, value }, index) => (
                        <CRow key={index}>
                            <CCol>
                                <CCardText>
                                    <b>{field}:</b> {value}
                                </CCardText>
                            </CCol>
                        </CRow>
                    ))}
                </CCardBody>
            </CCard>
        </>
    );
};

export default ConfigDetailsCard;
