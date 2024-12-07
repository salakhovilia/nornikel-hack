import React, { useRef } from 'react';
import { Card, Typography, Spin } from 'antd';
import styles from './QuestionBlock.module.scss';

const { Text } = Typography;

type QuestionBlockProps = {
    question: string;
    answer: string;
    isActive: boolean;
    isLoading: boolean;
    onClick: () => void;
};

const QuestionBlock: React.FC<QuestionBlockProps> = ({ question, answer, isActive, isLoading, onClick }) => {
    const contentRef = useRef<HTMLDivElement>(null);

    return (
        <Card
            className={`${styles.questionBlock} ${isActive ? styles.active : ''}`}
            onClick={() => {
                if (!isActive) onClick();
            }}
        >
            <div className={styles.cardHeader}>
                <Text strong className={styles.question}>
                    {question}
                </Text>
                {isLoading && <Spin className={styles.spinner} />}
            </div>
            <div className={`${styles.answerWrapper} ${isActive ? styles.expanded : ''}`} ref={contentRef}>
                <div className={styles.answer}>
                    {isActive ? isLoading ? <Text>Идёт поиск...</Text> : <Text>{answer}</Text> : null}
                </div>
            </div>
        </Card>
    );
};

export default QuestionBlock;
