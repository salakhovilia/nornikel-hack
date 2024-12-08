import React, { useEffect } from 'react';
import { searchPlugin } from '@react-pdf-viewer/search';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { useLocation } from 'react-router-dom';
import styles from './Source.module.scss';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import '@react-pdf-viewer/page-navigation/lib/styles/index.css';

import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation';

function Source() {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const file_path = queryParams.get('file_path');
    const text = queryParams.get('text');
    const keywordsParam = queryParams.get('keywords');
    const page = queryParams.get('page');

    const keywords = keywordsParam ? keywordsParam.split(',').map((word) => word.trim()) : [];

    const text_keywords = text ? text.split(/\s+/).map((word) => word.replace(/[^\w\s]/gi, '').toLowerCase()) : [];

    const keywords_final = [...keywords, ...text_keywords].filter((word) => word !== '');

    console.log('Final keywords:', keywords_final);

    const pdfUrl = `${import.meta.env.VITE_API_URL}/${file_path}`;

    const searchPluginInstance = searchPlugin({
        keyword: keywords_final.length > 0 ? keywords_final : [],
    });
    const pageNavigationPluginInstance = pageNavigationPlugin();

    useEffect(() => {
        if (pageNavigationPluginInstance.jumpToPage && page) {
            const pageNumber = parseInt(page, 10);
            if (!isNaN(pageNumber)) {
                pageNavigationPluginInstance.jumpToPage(pageNumber - 1);
            }
        }
    }, [page, pageNavigationPluginInstance]);

    return (
        <>
            <div className={styles.container}>
                <div className={styles.pdfViewer}>
                    <Worker workerUrl="https://unpkg.com/pdfjs-dist@2.6.347/build/pdf.worker.min.js" />
                    <Viewer fileUrl={pdfUrl} plugins={[searchPluginInstance, pageNavigationPluginInstance]} />
                </div>
            </div>
        </>
    );
}

export default Source;
