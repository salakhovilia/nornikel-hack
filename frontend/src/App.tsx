import React, { useState } from 'react';
import { Layout } from 'antd';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Sidebar from '@components/Sidebar/Sidebar';
import Header from '@components/Header/Header';
import styles from './App.module.scss';
import { VerticalAlignBottomOutlined, VerticalAlignTopOutlined } from '@ant-design/icons';
import Settings from '@views/Settings/Settings';
import Search from '@views/Search/Search';
import Source from '@views/Source/Source';
import Upload from '@views/Upload/Upload';

const { Content, Sider } = Layout;

function App() {
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <Router>
            <Layout className={styles.app}>
                <Sider trigger={null} collapsible collapsed={isSidebarCollapsed} className={styles.sidebar}>
                    <button className={styles.sidebarToggle} onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}>
                        {isSidebarCollapsed ? (
                            <VerticalAlignTopOutlined className={styles.icon} />
                        ) : (
                            <VerticalAlignBottomOutlined className={styles.icon} />
                        )}
                    </button>
                    <Sidebar />
                </Sider>

                <Layout>
                    <Header />
                    <Content className={styles.content}>
                        <Routes>
                            <Route path="/search" element={<Search />} />
                            <Route path="/settings" element={<Settings />} />
                            <Route path="/source" element={<Source />} />
                            <Route path="/upload" element={<Upload />} />
                        </Routes>
                    </Content>
                </Layout>
            </Layout>
        </Router>
    );
}

export default App;
