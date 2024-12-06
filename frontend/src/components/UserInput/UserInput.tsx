import React from 'react';
import { Input, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import styles from './UserInput.module.scss';

function UserInput() {
    return (
        <div className={styles.footer}>
            <div className={styles.form}>
                <Input placeholder="Поиск..." style={{ flex: 1 }} size="large" />
                <Button type="primary" icon={<SearchOutlined />} size="large" />
            </div>
        </div>
    );
}

export default UserInput;
