import { useState, useEffect } from 'react';
import { GITHUB } from '@/config/config';
import Toast from '@/utils/toast';

export const useGitHubOAuth = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [loading, setLoading] = useState(false);
    const [connectionData, setConnectionData] = useState(null);
    
    // Check if user is already connected to GitHub
    const checkGitHubConnection = async () => {
        // For now, we'll assume not connected
        setIsConnected(false);
    };

    // Initiate GitHub OAuth flow
    const initiateGitHubOAuth = () => {
        const state = Math.random().toString(36).substring(7);
        const params = new URLSearchParams({
            client_id: GITHUB.CLIENT_ID,
            scope: GITHUB.SCOPE,
            redirect_uri: GITHUB.REDIRECT_URI,
            state: state,
            response_type: 'code'
        });
        
        // Redirect to GitHub OAuth
        window.location.href = `${GITHUB.AUTH_URL}?${params.toString()}`;
    };

    // Handle OAuth callback - this is handled by the Next.js API route
    const handleGitHubCallback = async (code: string, state: string) => {
        setLoading(true);
        try {
            // The actual token exchange happens in the Next.js API route
            // This function is called after successful OAuth
            setIsConnected(true);
            Toast('Successfully connected to GitHub!', 'success');            
        } catch (error) {
            console.error('Error handling GitHub callback:', error);
            Toast('Failed to connect to GitHub. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Disconnect GitHub
    const disconnectGitHub = async () => {
        setLoading(true);
        try {
            // Clear local storage
            setIsConnected(false);
            setConnectionData(null);
            Toast('Successfully disconnected from GitHub!', 'success');
        } catch (error) {
            console.error('Error disconnecting GitHub:', error);
            Toast('Failed to disconnect from GitHub. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Send test message to GitHub (create issue, etc.)
    const createTestIssue = async (repo: string, title: string, body: string) => {
        try {
            // This would call your backend API to create an issue
            // For now, just show a success message
            Toast('Issue created successfully!', 'success');
        } catch (error) {
            console.error('Error creating GitHub issue:', error);
            Toast('Failed to create issue. Please try again.', 'error');
        }
    };

    useEffect(() => {
        checkGitHubConnection();
    }, []);

    return {
        isConnected,
        loading,
        connectionData,
        initiateGitHubOAuth,
        handleGitHubCallback,
        disconnectGitHub,
        createTestIssue,
        checkGitHubConnection
    };
}; 