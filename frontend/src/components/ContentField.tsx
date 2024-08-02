type ContentFieldProps = {
    title: string;
    children?: React.ReactNode;
};

const ContentField: React.FC<ContentFieldProps> = ({ title, children }) => {
    return (
        <div className="content-field">
            <h1>{title}</h1>
            {children}
        </div>
    );
};

export default ContentField;
