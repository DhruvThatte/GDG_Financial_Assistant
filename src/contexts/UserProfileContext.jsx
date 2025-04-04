import { createContext, useContext, useState } from 'react';

const UserProfileContext = createContext();

export function UserProfileProvider({ children }) {
    const [userProfile, setUserProfile] = useState({
        name: '',
        email: '',
        // Add other user profile fields as needed
    });

    const updateProfile = (newProfile) => {
        setUserProfile(prevProfile => ({
            ...prevProfile,
            ...newProfile
        }));
    };

    return (
        <UserProfileContext.Provider value={{ userProfile, updateProfile }}>
            {children}
        </UserProfileContext.Provider>
    );
}

export function useUserProfile() {
    const context = useContext(UserProfileContext);
    if (!context) {
        throw new Error('useUserProfile must be used within a UserProfileProvider');
    }
    return context;
}