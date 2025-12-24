import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    ArrowLeft, User, Moon, Bell, Shield, Info, ChevronRight, LogOut, Mail, Smartphone
} from 'lucide-react';
import { useUser } from '../context/UserContext';

const SettingsSection = ({ title, children }) => (
    <div className="mb-8">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">{title}</h3>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {children}
        </div>
    </div>
);

const SettingsItem = ({ icon: Icon, label, value, type = 'arrow', onClick, isLast }) => (
    <div
        onClick={type !== 'toggle' ? onClick : undefined}
        className={`flex items-center justify-between p-4 ${!isLast ? 'border-b border-gray-50' : ''} ${type !== 'toggle' ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''}`}
    >
        <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                <Icon size={20} />
            </div>
            <span className="font-medium text-gray-900">{label}</span>
        </div>

        {type === 'toggle' && (
            <button
                onClick={onClick}
                className={`w-12 h-7 rounded-full p-1 flex items-center transition-colors duration-300 focus:outline-none ${value ? 'bg-black justify-end' : 'bg-gray-200 justify-start'}`}
            >
                <motion.div
                    layout
                    className="w-5 h-5 bg-white rounded-full shadow-sm"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
            </button>
        )}

        {type === 'arrow' && (
            <ChevronRight size={18} className="text-gray-300" />
        )}

        {type === 'value' && (
            <span className="text-sm text-gray-500">{value}</span>
        )}
    </div>
);

const Settings = ({ onBack, onNavigate }) => {
    const { user, logout } = useUser();

    // Mock States for toggles
    const [darkMode, setDarkMode] = useState(false);
    const [notifications, setNotifications] = useState(true);
    const [emailAlerts, setEmailAlerts] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-2xl mx-auto pb-20"
        >
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={onBack}
                    className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-3xl font-black text-gray-900">Settings</h1>
            </div>

            {/* Profile Section */}
            <SettingsSection title="Account">
                <div className="p-6 flex items-center gap-4 border-b border-gray-50">
                    <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center font-bold text-2xl">
                        {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">{user?.name || 'User Name'}</h2>
                        <p className="text-gray-500 text-sm">{user?.email || 'user@example.com'}</p>
                    </div>
                    <button className="ml-auto px-4 py-2 text-sm font-bold bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                        Edit
                    </button>
                </div>
                <SettingsItem
                    icon={User}
                    label="Personal Information"
                    isLast={true}
                    onClick={() => alert('Full profile editing coming soon!')}
                />
            </SettingsSection>

            {/* Preferences */}
            <SettingsSection title="Preferences">
                <SettingsItem
                    icon={Moon}
                    label="Dark Mode"
                    type="toggle"
                    value={darkMode}
                    onClick={() => setDarkMode(!darkMode)}
                />
                <SettingsItem
                    icon={Bell}
                    label="Push Notifications"
                    type="toggle"
                    value={notifications}
                    onClick={() => setNotifications(!notifications)}
                />
                <SettingsItem
                    icon={Mail}
                    label="Email Alerts"
                    type="toggle"
                    value={emailAlerts}
                    isLast={true}
                    onClick={() => setEmailAlerts(!emailAlerts)}
                />
            </SettingsSection>

            {/* Support & About */}
            <SettingsSection title="Support">
                <SettingsItem
                    icon={Shield}
                    label="Privacy Policy"
                    onClick={() => onNavigate && onNavigate('privacy')}
                />
                <SettingsItem
                    icon={Info}
                    label="Terms of Service"
                    onClick={() => onNavigate && onNavigate('terms')}
                />
                <SettingsItem
                    icon={Smartphone}
                    label="App Version"
                    type="value"
                    value="v1.2.0"
                    isLast={true}
                />
            </SettingsSection>

            {/* Danger Zone */}
            <div className="mt-8">
                <button
                    onClick={() => {
                        if (window.confirm('Are you sure you want to logout?')) {
                            logout();
                        }
                    }}
                    className="w-full bg-red-50 text-red-600 font-bold p-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
                >
                    <LogOut size={20} />
                    Log Out
                </button>
                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-400">
                        Lets Try Inc. © 2024
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default Settings;
