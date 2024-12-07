import React from 'react';
import { FileOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import styles from './Sources.module.scss';

type SourcesProps = {
    question: string | null;
    sources: string[] | null;
    isLoading: boolean;
};

const Sources: React.FC<SourcesProps> = ({ question, sources, isLoading }) => {
    const navigate = useNavigate();

    const handleSourceClick = (source: string) => {
        navigate(`/source?name=${encodeURIComponent(source)}`);
    };

    return (
        <div className={styles.sourcesSidebar}>
            <div className={styles.title}>
                <span className={styles.sourcesTitle}>{question ? `Источники для: ${question}` : 'Источники'}</span>
            </div>
            <div className={styles.fileList}>
                {isLoading ? (
                    <div className={styles.loader}>
                        <Spin size="large" />
                    </div>
                ) : sources && sources.length > 0 ? (
                    sources.map((source, index) => (
                        <div key={index} className={styles.fileItem} onClick={() => handleSourceClick(source)}>
                            <FileOutlined className={styles.fileIcon} />
                            <span className={styles.fileName}>{source}</span>
                        </div>
                    ))
                ) : (
                    <div className={styles.placeholder}>
                        <span>Выберите вопрос</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sources;
