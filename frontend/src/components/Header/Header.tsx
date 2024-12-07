import React from 'react';
import { Layout, Breadcrumb } from 'antd';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import styles from './Header.module.scss';

const { Header } = Layout;

const pageTitles: Record<string, string> = {
    '/search': 'Поиск',
    '/settings': 'Настройки',
    '/upload': 'Загрузка файлов',
};

function AppHeader() {
    const location = useLocation();
    const [searchParams] = useSearchParams();

    const isSourcePage = location.pathname === '/source';
    const isBasePage = !!pageTitles[location.pathname];
    const sourceName = searchParams.get('name') || '';

    return (
        <Header className={styles.header}>
            <div className={styles.breadcrumbContainer}>
                <Breadcrumb className={styles.breadcrumb} separator={<span className={styles.separator}>/</span>}>
                    {isSourcePage ? (
                        <>
                            <Breadcrumb.Item>
                                <Link to="/search">Поиск</Link>
                            </Breadcrumb.Item>
                            <Breadcrumb.Item>{decodeURIComponent(sourceName)}</Breadcrumb.Item>
                        </>
                    ) : (
                        isBasePage && <Breadcrumb.Item>{pageTitles[location.pathname] || 'Страница'}</Breadcrumb.Item>
                    )}
                </Breadcrumb>
            </div>
        </Header>
    );
}

export default AppHeader;
