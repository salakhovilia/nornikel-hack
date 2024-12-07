import React, { useState } from 'react';
import { Upload, Button, message, Spin } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { openPlugin } from '@react-pdf-viewer/open';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import styles from './Upload.module.scss';

const UploadPage: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState<boolean>(false); // Для индикатора загрузки
    const openPluginInstance = openPlugin();

    const handleFileChange = (file: any) => {
        setLoading(true);
        setFile(file as File);
    };

    const beforeUpload = (file: File) => {
        const isPdf = file.type === 'application/pdf';
        if (!isPdf) {
            message.error('Пожалуйста, загрузите PDF файл.');
        }
        return isPdf;
    };

    return (
        <div className={styles.container}>
            <div className={styles.uploadSection}>
                <Upload
                    accept=".pdf"
                    beforeUpload={(file) => {
                        return beforeUpload(file as File) && !file;
                    }}
                    showUploadList={false}
                    onChange={({ file }) => handleFileChange(file as unknown as File)}
                >
                    <Button icon={<UploadOutlined />}>Выберите PDF файл</Button>
                </Upload>
            </div>

            {loading && !file && <Spin tip="Загрузка..." className={styles.loader} />}

            {file && (
                <div className={styles.pdfViewer}>
                    <Worker workerUrl="https://unpkg.com/pdfjs-dist@2.6.347/build/pdf.worker.min.js" />
                    <Viewer fileUrl={URL.createObjectURL(file)} plugins={[openPluginInstance]} />
                </div>
            )}
        </div>
    );
};

export default UploadPage;
