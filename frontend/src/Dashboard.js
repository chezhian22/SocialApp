import React, { useState,useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from './config/api';

const Dashboard =()=>{
    const [data,setData] = useState('');
    const clearLocalStorage =()=>{
        localStorage.clear();
    }
    useEffect(()=>{
        axios.get(`${API_BASE_URL}/api/dashboard`,{
            headers:{Authorization: localStorage.getItem('token')}
        }).then(res=> setData(res.data.msg)).catch(err => setData('Access Denied. Please login.'));
    },[])
    return(
        <div>
            <h2>Dashboard</h2>
            <p>{data}</p>
            <button onClick={clearLocalStorage}>Clear</button>
        </div>
    )
}

export default Dashboard;