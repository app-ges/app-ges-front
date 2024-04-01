import axios from 'axios';

export const signIn = async (username, password, router) => {

    try {
        const response = await axios.post(
            `${import.meta.env.VITE_API_URL}/v2/auth/login`,
            {
                username: username,
                password: password
            },
            {
                Headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        const token = response.data;

        localStorage.setItem('user', JSON.stringify(token));

        // Add 'group-company: company' to user data
        const userData = JSON.parse(localStorage.getItem('user'));
        userData['group-company'] = 'company';
        localStorage.setItem('user', JSON.stringify(userData));

        if (response.status === 200) {
            router.push('/dashboard');
        } else {
            console.error('Login Failed:', response.data.message);
        }
    } catch (error) {
        console.error('Error signing in:', error);
    }
};

export const signOut = (router) => {
    localStorage.removeItem('user');
    router.push('/auth/login');
};

export const isAuthenticated = () => {
    return localStorage.getItem('user');
};
