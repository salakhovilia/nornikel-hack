import React, { useState } from 'react';
import { Document, Page } from 'react-pdf';
import styles from './Source.module.scss';
import examplePdf from '@assets/example.pdf';
import { Spin } from 'antd';

function Source() {
    const [numPages, setNumPages] = useState<number | null>(null);

    const handleLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
    };

    return (
        <div className={styles.source}>
            <div className={styles.pdfViewer}>
                <Document
                    file={examplePdf}
                    onLoadSuccess={handleLoadSuccess}
                    onLoadError={(error) => {
                        console.error('Ошибка загрузки документа:', error);
                    }}
                    loading={
                        <div className={styles.loader}>
                            <Spin size="large" />
                        </div>
                    }
                >
                    {numPages &&
                        Array.from({ length: numPages }, (_, index) => (
                            <div key={index} className={styles.pageContainer}>
                                <Page
                                    scale={1.2}
                                    pageNumber={index + 1}
                                    renderTextLayer={false}
                                    renderAnnotationLayer={false}
                                />
                            </div>
                        ))}
                </Document>
            </div>
        </div>
    );
}

export default Source;
