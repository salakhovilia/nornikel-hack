import React, { useState } from 'react';
import { UploadOutlined } from '@ant-design/icons';
import { Button, Upload, Spin } from 'antd';
import { RcFile } from 'antd/lib/upload';
import { Document, Page } from 'react-pdf';
import styles from './Upload.module.scss';

function UploadPage() {
    const [file, setFile] = useState<RcFile | null>(null);
    const [numPages, setNumPages] = useState<number | null>(null);
    const [containerWidth, setContainerWidth] = useState<number>(800);

    const handleFileUpload = (uploadedFile: RcFile) => {
        setFile(uploadedFile);
    };

    const handleLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
    };

    return (
        <div className={styles.upload}>
            <h1>Загрузка файлов</h1>
            <p>Выберите PDF-документ для загрузки и просмотра.</p>

            <Upload
                accept=".pdf"
                beforeUpload={(file) => {
                    handleFileUpload(file);
                    return false;
                }}
                showUploadList={false}
            >
                <Button icon={<UploadOutlined />}>Выберите файл</Button>
            </Upload>

            {file && (
                <div
                    className={styles.pdfViewer}
                    ref={(ref) => {
                        if (ref) {
                            setContainerWidth(ref.offsetWidth);
                        }
                    }}
                >
                    <Document
                        file={file}
                        loading={
                            <div className={styles.loader}>
                                <Spin size="large" />
                            </div>
                        }
                        onLoadSuccess={handleLoadSuccess}
                        onLoadError={(error) => console.error('Ошибка загрузки файла:', error)}
                    >
                        {numPages &&
                            Array.from({ length: numPages }, (_, index) => (
                                <Page
                                    key={index}
                                    pageNumber={index + 1}
                                    scale={containerWidth / 600}
                                    renderTextLayer={false}
                                    renderAnnotationLayer={false}
                                />
                            ))}
                    </Document>
                </div>
            )}
        </div>
    );
}

export default UploadPage;
