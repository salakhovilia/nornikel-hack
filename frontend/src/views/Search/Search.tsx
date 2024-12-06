import React, { useState } from 'react';
import { Document, Page } from 'react-pdf';
import styles from './Search.module.scss';
import UserInput from '@components/UserInput/UserInput';
import { FileOutlined } from '@ant-design/icons';
import { fileList } from '@mock/fileList';
import ExamplePDF from '@assets/example.pdf';

function Search() {
    const [numPages, setNumPages] = useState<number>(0);

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
    };

    return (
        <div className={styles.searchLayout}>
            <div className={styles.searchWindow}>
                <UserInput />
                <div className={styles.main}>
                    <div className={styles.pdfViewer}>
                        <Document file={ExamplePDF} onLoadSuccess={onDocumentLoadSuccess}>
                            {Array.from(new Array(numPages), (_, index) => (
                                <Page key={index} pageNumber={index + 1} />
                            ))}
                        </Document>
                    </div>
                </div>
            </div>
            <div className={styles.fileSidebar}>
                <div className={styles.title}>
                    <span className={styles.fileSidebarTitle}>Источники</span>
                </div>
                <div className={styles.fileList}>
                    {fileList.map((file) => (
                        <div key={file.name} className={styles.fileItem}>
                            <FileOutlined className={styles.fileIcon} />
                            <span className={styles.fileName}>{file.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Search;
