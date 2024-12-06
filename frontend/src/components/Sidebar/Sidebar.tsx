import React from 'react';
import { Menu } from 'antd';
import { Link } from 'react-router-dom';
import { SettingOutlined, SearchOutlined } from '@ant-design/icons';
import styles from './Sidebar.module.scss';

function Sidebar() {
    return (
        <Menu className={styles.menu} theme="dark" mode="inline" defaultSelectedKeys={['1']}>
            <Menu.Item key="1" icon={<SearchOutlined />}>
                <Link to="/search">Поиск</Link>
            </Menu.Item>
            <Menu.Item key="3" icon={<SettingOutlined />}>
                <Link to="/settings">Настройки</Link>
            </Menu.Item>
        </Menu>
    );
}

export default Sidebar;
