class SelectOption<T = any> {
    label: string;
    value: T;

    constructor(label: string, value: T) {
        this.label = label;
        this.value = value;
    }
}

export default SelectOption;
