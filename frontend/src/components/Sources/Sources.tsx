import React from 'react';
import { FileOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import styles from './Sources.module.scss';
import { Source } from '@domains/question';

type SourcesProps = {
    question: string | null;
    sources: Source[] | null;
    isLoading: boolean;
};

const Sources: React.FC<SourcesProps> = ({ question, sources, isLoading }) => {
    const navigate = useNavigate();

    const handleSourceClick = (file_path: string, text: string, keywords: string[]) => {
        const encodedText = encodeURIComponent(text);
        const encodedFilePath = encodeURIComponent(file_path);
        const encodedKeywords = encodeURIComponent(keywords.join(', '));

        console.log('encodedText: ', encodedText);
        console.log('encodedFilePath: ', encodedFilePath);
        console.log('encodedKeywords: ', encodedKeywords);

        console.log(
            'Navigate to: ',
            `/source?file_path=${encodedFilePath}&text=${encodedText}&keywords=${encodedKeywords}`,
        );

        navigate(`/source?file_path=${encodedFilePath}&text=${encodedText}&keywords=${encodedKeywords}`);
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
                    sources.map((source, index) => {
                        const fileName = source.file_path.split('_').slice(1).join('_');
                        const { text, page, score } = source;

                        const formattedScore = score.toFixed(1);

                        return (
                            <div
                                key={index}
                                className={styles.fileItem}
                                onClick={() => handleSourceClick(source.file_path, text, source.keywords || [])}
                            >
                                <FileOutlined className={styles.fileIcon} />
                                <span className={styles.score}>{formattedScore}</span>
                                <span className={styles.fileName}>{fileName}</span>
                                <span className={styles.page}>Стр: {page}</span>
                            </div>
                        );
                    })
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
