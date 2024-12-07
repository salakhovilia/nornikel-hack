import React from 'react';
import { searchPlugin } from '@react-pdf-viewer/search';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import testPdf from '@assets/example.pdf';
import styles from './Source.module.scss';

function Source() {
    const searchPluginInstance = searchPlugin({
        keyword: ['Как', 'Промышленность'],
    });

    return (
        <div className={styles.container}>
            <div className={styles.pdfViewer}>
                <Worker workerUrl="https://unpkg.com/pdfjs-dist@2.6.347/build/pdf.worker.min.js" />
                <Viewer fileUrl={testPdf} plugins={[searchPluginInstance]} />
            </div>
        </div>
    );
}

export default Source;
