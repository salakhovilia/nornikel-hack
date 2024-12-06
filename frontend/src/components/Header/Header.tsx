import React from 'react';
import { Layout, Typography } from 'antd';
import { useLocation } from 'react-router-dom';
import styles from './Header.module.scss';

const { Header } = Layout;
const { Text } = Typography;

const pageTitles: Record<string, string> = {
    '/search': 'Поиск',
    '/settings': 'Настройки',
};

function AppHeader() {
    const location = useLocation();
    const title = pageTitles[location.pathname] || 'Страница';

    return (
        <Header className={styles.header}>
            <Text className={styles.title}>{title}</Text>
        </Header>
    );
}

export default AppHeader;
