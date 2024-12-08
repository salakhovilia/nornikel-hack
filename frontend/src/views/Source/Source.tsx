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
    const keywordsParam = queryParams.get('keywords');

    const keywords = keywordsParam ? keywordsParam.split(', ') : [];

    const pdfUrl = `${import.meta.env.VITE_API_URL}/${file_path}`;

    console.log('queryParams: ', queryParams);
    console.log('file_path: ', file_path);
    console.log('text: ', text);
    console.log('keywordsParam: ', keywordsParam);
    console.log('keywords: ', keywords);
    console.log('pdfUrl: ', pdfUrl);

    const searchPluginInstance = searchPlugin({
        keyword: keywords.length > 0 ? keywords : text ? [text] : [],
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
