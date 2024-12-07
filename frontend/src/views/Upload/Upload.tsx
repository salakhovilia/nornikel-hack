import React, { useState, useEffect } from 'react';
import { Upload, Button, Input, message, Spin } from 'antd';
import { UploadOutlined, SearchOutlined } from '@ant-design/icons';
import { Document, Page } from 'react-pdf';
import { usePdfTextSearch } from '@hooks/usePdfSearch';
import styles from './Upload.module.scss';

const UploadPage: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [numPages, setNumPages] = useState<number>(0); // Число страниц для рендеринга

    const handleFileChange = (file: File) => {
        setFile(file);
        setSearchQuery('');
    };

    // Используем хук поиска текста, передавая `file` и `searchQuery`
    const searchResults = usePdfTextSearch(file, searchQuery);

    const customTextRenderer = (props: any) => {
        const { str } = props;

        if (!searchQuery) {
            return str;
        }

        const regex = new RegExp(`(${searchQuery})`, 'gi');
        const parts = str.split(regex);

        return parts.map((part: string, index: number) =>
            regex.test(part) ? (
                <span key={index} className={styles.highlight}>
                    {part}
                </span>
            ) : (
                part
            ),
        );
    };

    const onDocumentLoadSuccess = ({ numPages }: any) => {
        setNumPages(numPages); // Получаем количество страниц и сохраняем в стейт
        setLoading(false);
    };

    useEffect(() => {
        if (file) {
            setLoading(true); // Начинаем загрузку, когда файл выбран
        }
    }, [file]);

    return (
        <div className={styles.container}>
            <Upload
                accept=".pdf,application/pdf"
                beforeUpload={(file) => {
                    const isValid = file.type === 'application/pdf';
                    if (isValid) {
                        handleFileChange(file);
                        return false; // Отключаем автоматическую загрузку
                    } else {
                        message.error('Пожалуйста, загрузите PDF файл.');
                        return Upload.LIST_IGNORE;
                    }
                }}
                showUploadList={false}
            >
                <Button icon={<UploadOutlined />}>Выберите PDF файл</Button>
            </Upload>

            {file && (
                <div className={styles.pdfContainer}>
                    <Input
                        placeholder="Введите текст для поиска"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ margin: '20px 0', width: '300px' }}
                        suffix={<SearchOutlined onClick={() => setSearchQuery(searchQuery)} />}
                    />
                    <div>
                        <span>Результаты поиска: {searchResults.length}</span>
                    </div>
                    {loading && <Spin tip="Загрузка..." />}
                    <Document
                        file={file}
                        onLoadSuccess={onDocumentLoadSuccess}
                        onLoadError={(error) => message.error('Ошибка загрузки PDF')}
                    >
                        {/* Рендерим все страницы */}
                        {Array.from(new Array(numPages), (_, index) => (
                            <Page
                                key={`page_${index + 1}`}
                                pageNumber={index + 1}
                                customTextRenderer={customTextRenderer}
                            />
                        ))}
                    </Document>
                </div>
            )}
        </div>
    );
};

export default UploadPage;
