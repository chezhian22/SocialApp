import {jwtDecode} from 'jwt-decode';

export const isAuthenticated = () =>{
    return !!localStorage.getItem('token');
};

export const getUserRole =() =>{
    const token = localStorage.getItem('token');
    if(!token) return null;
    const decoded = jwtDecode(token);
    return decoded.role;
}
