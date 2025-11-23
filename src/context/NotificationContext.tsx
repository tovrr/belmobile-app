
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { CheckCircleIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

type NotificationType = 'success' | 'error' | 'info';

interface Notification {
    id: number;
    type: NotificationType;
    message: string;
}

interface NotificationContextType {
    addNotification: (type: NotificationType, message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const addNotification = useCallback((type: NotificationType, message: string) => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, type, message }]);

        // Auto remove after 5 seconds
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 5000);
    }, []);

    const removeNotification = (id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    return (
        <NotificationContext.Provider value={{ addNotification }}>
            {children}
            <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
                {notifications.map(notification => (
                    <div 
                        key={notification.id}
                        className={`
                            flex items-center p-4 rounded-xl shadow-lg border w-80 animate-fade-in-up transition-all
                            ${notification.type === 'success' ? 'bg-white border-green-100 text-gray-800' : ''}
                            ${notification.type === 'error' ? 'bg-white border-red-100 text-gray-800' : ''}
                            ${notification.type === 'info' ? 'bg-white border-blue-100 text-gray-800' : ''}
                        `}
                    >
                        <div className={`p-2 rounded-full mr-3 ${
                            notification.type === 'success' ? 'bg-green-100 text-green-600' :
                            notification.type === 'error' ? 'bg-red-100 text-red-600' :
                            'bg-blue-100 text-blue-600'
                        }`}>
                            {notification.type === 'success' && <CheckCircleIcon className="h-5 w-5" />}
                            {notification.type === 'error' && <XCircleIcon className="h-5 w-5" />}
                            {notification.type === 'info' && <CheckCircleIcon className="h-5 w-5" />}
                        </div>
                        <div className="flex-1 text-sm font-medium">{notification.message}</div>
                        <button onClick={() => removeNotification(notification.id)} className="text-gray-400 hover:text-gray-600">
                            <XMarkIcon className="h-4 w-4" />
                        </button>
                    </div>
                ))}
            </div>
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};
