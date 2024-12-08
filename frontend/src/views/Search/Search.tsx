import React, { useState, useEffect } from 'react';
import styles from './Search.module.scss';
import UserInput from '@components/UserInput/UserInput';
import QuestionBlock from '@components/QuestionBlock/QuestionBlock';
import Sources from '@components/Sources/Sources';
import { v4 as uuidv4 } from 'uuid';
import { Question, Source } from '@domains/question';
import { QueryResponse } from '@domains/api';

function Search() {
    const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
    const [questions, setQuestions] = useState<Question[]>(() => {
        const savedQuestions = localStorage.getItem('questions');
        return savedQuestions ? JSON.parse(savedQuestions) : [];
    });
    const [isAnswering, setIsAnswering] = useState(false);

    useEffect(() => {
        localStorage.setItem('questions', JSON.stringify(questions));
    }, [questions]);

    const handleBlockClick = (id: string) => {
        setActiveQuestionId(activeQuestionId === id ? null : id);
    };

    const handleUserQuestion = async (userQuestion: string) => {
        if (isAnswering) return;

        setIsAnswering(true);
        const questionId = uuidv4();

        const newQuestion: Question = {
            id: questionId,
            question: userQuestion,
            answer: 'Ответ с сервера',
            isLoading: true,
            sources: null,
        };

        setQuestions((prev) => [newQuestion, ...prev]);
        setActiveQuestionId(questionId);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/query`, {
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
                const data: QueryResponse = await response.json();

                const sources: Source[] = data.sources
                    .map((item) => {
                        if (item.payload && item.payload.file_path && item.payload.docId) {
                            const source: Source = {
                                file_path: item.payload.file_path,
                                docId: item.payload.docId,
                                score: item.score,
                                page: item.payload.source,
                                text: item.payload.text,
                                keywords: userQuestion.split(' '), // Извлекаем ключевые слова
                            };
                            return source;
                        }
                        return null;
                    })
                    .filter((source): source is Source => source !== null);

                setQuestions((prev) =>
                    prev.map((q) =>
                        q.id === questionId ? { ...q, isLoading: false, answer: data.answer, sources: sources } : q,
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
                sources={activeQuestion?.sources || null}
                isLoading={isAnswering}
            />
        </div>
    );
}

export default Search;
