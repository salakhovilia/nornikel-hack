import React from 'react';
import { Input, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import styles from './UserInput.module.scss';

type UserInputProps = {
    onSubmit: (value: string) => void;
    disabled: boolean;
};

function UserInput({ onSubmit, disabled }: UserInputProps) {
    const [inputValue, setInputValue] = React.useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleSearchClick = () => {
        if (!disabled && inputValue.trim()) {
            onSubmit(inputValue);
            setInputValue('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !disabled && inputValue.trim()) {
            onSubmit(inputValue);
            setInputValue('');
        }
    };

    return (
        <div className={styles.footer}>
            <div className={styles.form}>
                <Input
                    placeholder="Поиск..."
                    style={{ flex: 1 }}
                    size="large"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                />
                <Button
                    type="primary"
                    icon={<SearchOutlined />}
                    size="large"
                    onClick={handleSearchClick}
                    disabled={disabled || !inputValue.trim()}
                />
            </div>
        </div>
    );
}

export default UserInput;
