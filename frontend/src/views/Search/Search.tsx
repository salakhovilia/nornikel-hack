import React, { useState, useEffect } from 'react';
import styles from './Search.module.scss';
import UserInput from '@components/UserInput/UserInput';
import QuestionBlock from '@components/QuestionBlock/QuestionBlock';
import Sources from '@components/Sources/Sources';
import { v4 as uuidv4 } from 'uuid';
import { mockAnswers } from '@mock/answers';

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

    const handleBlockClick = (id: string) => {
        setActiveQuestionId(activeQuestionId === id ? null : id);
    };

    const handleUserQuestion = (userQuestion: string) => {
        if (isAnswering) return;

        setIsAnswering(true);
        const questionId = uuidv4();

        const randomAnswer = mockAnswers[Math.floor(Math.random() * mockAnswers.length)];

        const newQuestion = {
            id: questionId,
            question: userQuestion,
            answer: '',
            isLoading: true,
            sources: randomAnswer.sources,
        };

        setQuestions((prev) => [newQuestion, ...prev]);
        setActiveQuestionId(questionId);

        const randomDelay = Math.floor(Math.random() * 4000) + 1000;

        setTimeout(() => {
            setQuestions((prev) =>
                prev.map((q) =>
                    q.id === questionId
                        ? {
                              ...q,
                              isLoading: false,
                              answer: randomAnswer.answer,
                          }
                        : q,
                ),
            );
            setIsAnswering(false);
        }, randomDelay);
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
