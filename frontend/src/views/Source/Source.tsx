import React from 'react';
import { searchPlugin } from '@react-pdf-viewer/search';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import styles from './Source.module.scss';
import { useLocation } from 'react-router-dom';

function Source() {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const file_path = queryParams.get('file_path');
    const text = queryParams.get('text');

    const pdfUrl = `${import.meta.env.VITE_API_URL}/${file_path}`;

    const searchPluginInstance = searchPlugin({
        keyword: text?.split('') || '',
    });

    return (
        <div className={styles.container}>
            <div className={styles.pdfViewer}>
                <Worker workerUrl="https://unpkg.com/pdfjs-dist@2.6.347/build/pdf.worker.min.js" />
                <Viewer fileUrl={pdfUrl} plugins={[searchPluginInstance]} />
            </div>
        </div>
    );
}

export default Source;
