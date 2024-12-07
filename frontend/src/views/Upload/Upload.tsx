import React from 'react';
import { Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import axios from 'axios';

const UploadPage: React.FC = () => {
    const handleUpload = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('meta', JSON.stringify({ name: file.name }));

        try {
            console.log('Отправка файла...');
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/files`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log('Ответ от сервера:', response);
            if (response.status === 200) {
                message.success('Файл успешно загружен');
            }
        } catch (error) {
            console.error('Ошибка при загрузке:', error);
            message.error('Ошибка при загрузке файла');
        }
    };

    return (
        <div>
            <Upload
                customRequest={({ file, onSuccess, onError }) => {
                    console.log('Файл:', file);
                    handleUpload(file as File)
                        .then(() => {
                            onSuccess && onSuccess({});
                        })
                        .catch(onError);
                }}
                showUploadList={false}
            >
                <Button icon={<UploadOutlined />}>Загрузить файл</Button>
            </Upload>
        </div>
    );
};

export default UploadPage;
