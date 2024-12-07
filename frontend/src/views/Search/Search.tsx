import React, { useState, useEffect } from 'react';
import styles from './Search.module.scss';
import UserInput from '@components/UserInput/UserInput';
import QuestionBlock from '@components/QuestionBlock/QuestionBlock';
import Sources from '@components/Sources/Sources';
import { v4 as uuidv4 } from 'uuid';
import { mockAnswers } from '@mock/answers';

type Payload = {
    total_pages: number;
    file_path: string;
    source: string;
    text: string;
    docId: string;
};

type ResponseItem = {
    id: string;
    version: number;
    score: number;
    payload: Payload;
    vector: unknown;
    shard_key: unknown;
    order_value: unknown;
};

function Search() {
    const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
    const [questions, setQuestions] = useState<
        { id: string; question: string; answer: string; isLoading: boolean; sources: string[] }[]
    >(() => {
        const savedQuestions = localStorage.getItem('questions');
        return savedQuestions ? JSON.parse(savedQuestions) : [];
    });
    const [isAnswering, setIsAnswering] = useState(false);

    useEffect(() => {
        localStorage.setItem('questions', JSON.stringify(questions));
    }, [questions]);

    console.log('Questions: ', questions);

    const handleBlockClick = (id: string) => {
        setActiveQuestionId(activeQuestionId === id ? null : id);
    };

    const handleUserQuestion = async (userQuestion: string) => {
        if (isAnswering) return;

        setIsAnswering(true);
        const questionId = uuidv4();

        const randomAnswer = mockAnswers[Math.floor(Math.random() * mockAnswers.length)];

        const newQuestion = {
            id: questionId,
            question: userQuestion,
            answer: 'Ответ с сервера',
            isLoading: true,
            sources: randomAnswer.sources,
        };

        setQuestions((prev) => [newQuestion, ...prev]);
        setActiveQuestionId(questionId);

        try {
            const response = await fetch('http://localhost:8000/api/query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question: userQuestion,
                    meta: {},
                }),
            });
            if (response.ok) {
                const data = await response.json();

                const filePathsSet = new Set<string>();

                data.response.forEach((item: ResponseItem) => {
                    if (item.payload && item.payload.file_path && item.payload.docId) {
                        const modifiedPath = item.payload.file_path.replace(`uploads/${item.payload.docId}_`, '');
                        filePathsSet.add(modifiedPath);
                    }
                });

                const uniqueSources = [...filePathsSet];

                setQuestions((prev) =>
                    prev.map((q) =>
                        q.id === questionId
                            ? { ...q, isLoading: false, answer: data.answer, sources: uniqueSources }
                            : q,
                    ),
                );

                setIsAnswering(false);
            } else {
                throw new Error('Ошибка запроса');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setIsAnswering(false);
        }
    };

    const activeQuestion = questions.find((q) => q.id === activeQuestionId);

    return (
        <div className={styles.searchLayout}>
            <div className={styles.searchWindow}>
                <UserInput onSubmit={handleUserQuestion} disabled={isAnswering} />
                <div className={styles.questionSection}>
                    {questions.map((q) => (
                        <QuestionBlock
                            key={q.id}
                            question={q.question}
                            answer={q.answer}
                            isActive={activeQuestionId === q.id}
                            isLoading={q.isLoading}
                            onClick={() => handleBlockClick(q.id)}
                        />
                    ))}
                </div>
            </div>
            <Sources
                question={activeQuestion?.question || null}
                sources={activeQuestion?.sources || []}
                isLoading={isAnswering}
            />
        </div>
    );
}

export default Search;
