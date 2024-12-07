import React from 'react';
import { Avatar } from 'antd';
import styles from './Message.module.scss';

import { Message as MessageType } from '@domains/message';

type MessageProps = {
    message: MessageType;
};

const Message: React.FC<MessageProps> = ({ message: { sender, content } }) => {
    return (
        <div className={sender === 'bot' ? styles.botMessage : styles.userMessage}>
            <div className={styles.avatar}>
                <Avatar
                    style={{
                        backgroundColor: sender === 'bot' ? '#1677fe' : '#87d068',
                    }}
                >
                    {sender === 'bot' ? 'B' : 'U'}
                </Avatar>
            </div>
            <div className={styles.content}>
                <p>{content}</p>
            </div>
        </div>
    );
};

export default Message;
