import React from 'react';
import { searchPlugin } from '@react-pdf-viewer/search';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { useLocation } from 'react-router-dom';
import styles from './Source.module.scss';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

function Source() {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const file_path = queryParams.get('file_path');
    const text = queryParams.get('text');
    const keywordsParam = queryParams.get('keywords');

    const keywords = keywordsParam ? keywordsParam.split(',').map((word) => word.trim()) : [];

    const text_keywords = text ? text.split(/\s+/).map((word) => word.replace(/[^\w\s]/gi, '').toLowerCase()) : [];

    const keywords_final = [...keywords, ...text_keywords].filter((word) => word !== '');

    console.log('Final keywords:', keywords_final);

    const pdfUrl = `${import.meta.env.VITE_API_URL}/${file_path}`;

    const searchPluginInstance = searchPlugin({
        keyword: keywords_final.length > 0 ? keywords_final : [],
    });

    return (
        <>
            <div className={styles.container}>
                <div className={styles.pdfViewer}>
                    <Worker workerUrl="https://unpkg.com/pdfjs-dist@2.6.347/build/pdf.worker.min.js" />
                    <Viewer fileUrl={pdfUrl} plugins={[searchPluginInstance]} />
                </div>
            </div>
        </>
    );
}

export default Source;
