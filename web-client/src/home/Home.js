import '../App.css';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, Form } from 'react-router-dom';
import data from '../data.js'
import axios from 'axios';
import NavBar from './NavBar.js';
import Folders from './Folders.js';

function Home({setLoggedin, data}) {
    return(<div style = {{minHeight : "100vh"}}>
        <NavBar setLoggedin={setLoggedin}/>
        <Folders data = {data}/>
    </div>)
}
export default Home;