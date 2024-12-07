import { useState, useEffect } from 'react';
import { pdfjs } from 'react-pdf';

export const usePdfTextSearch = (file: File | null, searchString: string) => {
    const [pages, setPages] = useState<string[]>([]);
    const [resultsList, setResultsList] = useState<number[]>([]);
    const [isCancelled, setIsCancelled] = useState(false); // Для отслеживания отмены запроса

    useEffect(() => {
        if (!file) {
            setPages([]);
            return; // Если файл пустой, сразу возвращаем пустой список
        }

        const fileURL = URL.createObjectURL(file); // Преобразуем файл в URL

        pdfjs
            .getDocument(fileURL)
            .promise.then((docData) => {
                const pageCount = docData.numPages;

                // Извлекаем текст с каждой страницы
                const pagePromises = Array.from({ length: pageCount }, (_, pageNumber) => {
                    return docData.getPage(pageNumber + 1).then((pageData) => {
                        return pageData.getTextContent().then((textContent) => {
                            // Проверка типа, чтобы извлечь строку
                            return textContent.items
                                .map((item) => {
                                    if ('str' in item) {
                                        return item.str;
                                    }
                                    return ''; // Если str отсутствует, вернуть пустую строку
                                })
                                .join(' ');
                        });
                    });
                });

                Promise.all(pagePromises)
                    .then((pages) => {
                        if (!isCancelled) {
                            setPages(pages); // Только если запрос не был отменен
                        }
                    })
                    .catch((error) => {
                        if (!isCancelled) {
                            console.error('Ошибка при извлечении текста: ', error);
                        }
                    });
            })
            .catch((error) => {
                if (!isCancelled) {
                    console.error('Ошибка при загрузке PDF: ', error);
                }
            });

        // Очистка при отмене компонента
        return () => {
            setIsCancelled(true); // Отменяем запрос при размонтировании
        };
    }, [file]); // Хук зависит от file

    useEffect(() => {
        if (!searchString.trim()) {
            setResultsList([]);
            return;
        }

        const regex = new RegExp(searchString, 'i');
        const updatedResults: number[] = [];

        pages.forEach((text, index) => {
            if (regex.test(text)) {
                updatedResults.push(index + 1);
            }
        });

        setResultsList(updatedResults);
    }, [pages, searchString]); // Хук зависит от страниц и поискового запроса

    return resultsList;
};
