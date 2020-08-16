import axios from 'axios';

import connectionUrl from '../services/connectionUrl'

const api = axios.create({
  baseURL: `http://localhost:5000/`,
})

export default api